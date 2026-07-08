const express = require('express');
const router = express.Router();
const { Op, fn, col } = require('sequelize');
const db = require('../models');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');
const orderRoutes = require('./orders');

const { Item, Order, OrderItem, User, Review, BoxSerial } = db;

router.get('/stats', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const [items, orders, users, reviews, orderItems] = await Promise.all([
      Item.findAll({ paranoid: false }),
      Order.findAll(),
      User.findAll({ attributes: ['id', 'role', 'is_active'] }),
      Review.findAll(),
      OrderItem.findAll()
    ]);

    const totalInventory = items.reduce((sum, item) => sum + Number(item.stock || 0), 0);
    const totalRevenue = orders
      .filter((order) => String(order.status).toLowerCase() === 'delivered')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const pendingOrders = orders.filter((order) => String(order.status).toLowerCase() === 'pending').length;
    const approvedReviews = reviews.filter((review) => String(review.status).toLowerCase() === 'approved').length;

    const formatDay = (date) => {
      const d = new Date(date);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return formatDay(d);
    });

    const formatMonth = (date) => {
      const d = new Date(date);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return formatMonth(d);
    });

    const salesByDayMap = last7Days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});
    const userGrowthMap = last7Days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});
    const monthlyRevenueMap = last12Months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

    orders.forEach((order) => {
      if (String(order.status).toLowerCase() === 'delivered') {
        const orderDate = order.created_at || order.createdAt;
        if (orderDate) {
          const label = formatDay(orderDate);
          if (salesByDayMap[label] !== undefined) {
            salesByDayMap[label] += Number(order.total_amount || 0);
          }

          const monthLabel = formatMonth(orderDate);
          if (monthlyRevenueMap[monthLabel] !== undefined) {
            monthlyRevenueMap[monthLabel] += Number(order.total_amount || 0);
          }
        }
      }
    });

    users.forEach((user) => {
      const userDate = user.created_at || user.createdAt;
      if (userDate) {
        const label = formatDay(userDate);
        if (userGrowthMap[label] !== undefined) {
          userGrowthMap[label] += 1;
        }
      }
    });

    const salesByDay = last7Days.map((label) => ({ label, value: Number(salesByDayMap[label] || 0).toFixed(2) }));
    const userGrowth = last7Days.map((label) => ({ label, value: userGrowthMap[label] || 0 }));
    const monthlyRevenue = last12Months.map((label) => ({ label, value: Number(monthlyRevenueMap[label] || 0).toFixed(2) }));

    const itemThemeMap = items.reduce((acc, item) => {
      acc[item.id] = item.theme || 'General';
      return acc;
    }, {});

    const orderStatusMap = orders.reduce((acc, order) => {
      acc[order.id] = String(order.status).toLowerCase();
      return acc;
    }, {});

    const revenueByThemeMap = {};
    orderItems.forEach((oi) => {
      const orderStatus = orderStatusMap[oi.order_id];
      if (orderStatus === 'delivered') {
        const theme = itemThemeMap[oi.item_id] || 'General';
        const amount = Number(oi.quantity || 0) * Number(oi.price || 0);
        revenueByThemeMap[theme] = (revenueByThemeMap[theme] || 0) + amount;
      }
    });

    const revenueByTheme = Object.entries(revenueByThemeMap).map(([label, value]) => ({
      label,
      value: Number(value).toFixed(2)
    }));

    const rarityDistribution = items.reduce((acc, item) => {
      const rarity = String(item.rarity || 'common').toUpperCase();
      acc[rarity] = (acc[rarity] || 0) + 1;
      return acc;
    }, {});

    const roleCounts = users.reduce((acc, user) => {
      const role = String(user.role || 'user').toUpperCase();
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        inventory: totalInventory,
        revenue: Number(totalRevenue).toFixed(2),
        orders: orders.length,
        pendingOrders,
        users: users.length,
        reviews: reviews.length,
        approvedReviews,
        salesByDay,
        userGrowth,
        monthlyRevenue,
        revenueByTheme,
        rarityDistribution,
        roleCounts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/orders', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['created_at', 'DESC']],
      include: [{ model: OrderItem, as: 'items' }]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const { status, payment_status, courier_name, tracking_number, shipped_at } = req.body;
    if (status) order.status = status;
    if (payment_status) order.payment_status = payment_status;
    if (courier_name !== undefined) order.courier_name = courier_name;
    if (tracking_number !== undefined) order.tracking_number = tracking_number;
    if (shipped_at !== undefined) order.shipped_at = shipped_at ? new Date(shipped_at) : null;
    await order.save();

    // Send transaction update notification email with the attached PDF receipt details
    try {
      const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
      await orderRoutes.sendOrderUpdateEmail(order, orderItems);
    } catch (emailErr) {
      console.warn('Could not send transaction update email notification:', emailErr.message);
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/orders/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    await order.destroy();
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/order-status', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const total = await Order.count();
    const processing = await Order.count({ where: { status: 'processing' } });
    const shipped = await Order.count({ where: { status: 'shipped' } });
    const delivered = await Order.count({ where: { status: 'delivered' } });
    const cancelled = await Order.count({ where: { status: 'cancelled' } });
    const pending = await Order.count({ where: { status: 'pending' } });

    res.json({ success: true, data: { total, pending, processing, shipped, delivered, cancelled } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/sales-performance', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    let { startDate, endDate } = req.query;
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end);
    if (!startDate) start.setDate(end.getDate() - 29);
    const startTime = new Date(start.setHours(0, 0, 0, 0));
    const endTime = new Date(end.setHours(23, 59, 59, 999));

    const rows = await Order.findAll({
      attributes: [
        [fn('DATE', col('created_at')), 'day'],
        [fn('SUM', col('total_amount')), 'total']
      ],
      where: {
        status: 'delivered',
        created_at: { [Op.between]: [startTime, endTime] }
      },
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true
    });

    const dayMap = {};
    const days = [];
    let current = new Date(startTime);
    while (current <= endTime) {
      const label = current.toISOString().slice(0, 10);
      dayMap[label] = 0;
      days.push(label);
      current = new Date(current.getTime() + 86400000);
    }

    rows.forEach((row) => {
      dayMap[row.day] = Number(row.total || 0);
    });

    res.json({ success: true, data: { labels: days, values: days.map((day) => dayMap[day]) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/yearly-revenue', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const yearStart = new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0);
    const isSqlite = db.sequelize.options.dialect === 'sqlite';
    const monthFormatExpr = isSqlite
      ? fn('strftime', '%Y-%m', col('created_at'))
      : fn('DATE_FORMAT', col('created_at'), '%Y-%m');

    const rows = await Order.findAll({
      attributes: [
        [monthFormatExpr, 'month'],
        [fn('SUM', col('total_amount')), 'total']
      ],
      where: {
        status: 'delivered',
        created_at: { [Op.gte]: yearStart }
      },
      group: [monthFormatExpr],
      order: [[monthFormatExpr, 'ASC']],
      raw: true
    });

    res.json({ success: true, data: { labels: rows.map((row) => row.month), values: rows.map((row) => Number(row.total || 0)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/product-share', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const rows = await OrderItem.findAll({
      attributes: [
        [col('item.name'), 'name'],
        [fn('SUM', col('OrderItem.quantity')), 'units']
      ],
      include: [
        { model: Item, as: 'item', attributes: [] },
        { model: Order, as: 'order', attributes: [], where: { status: 'delivered' } }
      ],
      group: ['item.id', 'item.name'],
      order: [[fn('SUM', col('OrderItem.quantity')), 'DESC']],
      limit: 20,
      raw: true
    });

    res.json({ success: true, data: { labels: rows.map((row) => row.name), values: rows.map((row) => Number(row.units || 0)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/inventory', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const items = await Item.findAll({ include: [{ model: BoxSerial, as: 'boxSerials' }] });
    const totalInventory = items.reduce((sum, item) => sum + Number(item.stock || 0), 0);
    res.json({ success: true, data: { totalInventory, items } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/box-serials', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const serials = await BoxSerial.findAll({ include: [{ model: Item, as: 'item', attributes: ['id', 'name'] }], order: [['created_at', 'DESC']] });
    res.json({ success: true, data: serials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/box-serials', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const { serials, item_id, status } = req.body;
    if (!serials || !Array.isArray(serials) || !serials.length) {
      return res.status(400).json({ success: false, message: 'serials array is required' });
    }
    const created = await Promise.all(serials.map((serial) => BoxSerial.create({ serial, item_id: item_id || null, status: status || 'available' })));
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/box-serials/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const serial = await BoxSerial.findByPk(req.params.id);
    if (!serial) return res.status(404).json({ success: false, message: 'Box serial not found' });
    const { item_id, status } = req.body;
    if (item_id !== undefined) serial.item_id = item_id;
    if (status !== undefined) serial.status = status;
    await serial.save();
    res.json({ success: true, data: serial });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/reviews', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const reviews = await Review.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/reviews/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    if (req.body.status) review.status = req.body.status;
    await review.save();
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/reviews/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await review.destroy();
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
