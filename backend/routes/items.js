const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('node:path');
const fs = require('node:fs');
const db = require('../models');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const Item = db.Item;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/', async (req, res) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(Number.parseInt(req.query.limit, 10) || 0, 0);
    const shouldPaginate = Boolean(req.query.page || req.query.limit);
    const includeDeleted = req.query.includeDeleted === 'true';

    const findOptions = {
      order: [['created_at', 'DESC']]
    };
    if (includeDeleted) {
      findOptions.paranoid = false;
    }

    if (!shouldPaginate || limit <= 0) {
      const items = await Item.findAll(findOptions);
      return res.json({ success: true, data: items });
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await Item.findAndCountAll({
      ...findOptions,
      limit,
      offset
    });

    res.json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total: count,
        totalPages: Math.max(Math.ceil(count / limit), 1),
        hasMore: offset + rows.length < count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const includeDeleted = req.query.includeDeleted === 'true';
    const findOptions = includeDeleted ? { paranoid: false } : {};
    const item = await Item.findByPk(req.params.id, findOptions);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await db.Review.findAll({
      where: { item_id: req.params.id, status: 'approved' },
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/reviews', isAuthenticatedUser, upload.array('photos', 5), async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Check if user has purchased the item and the order is delivered
    const userOrders = await db.Order.findAll({ where: { user_id: req.user.id } });
    const deliveredOrders = userOrders.filter(o => String(o.status || '').toLowerCase() === 'delivered');

    let purchasedAndDelivered = false;
    for (const o of deliveredOrders) {
      const orderItems = await db.OrderItem.findAll({ where: { order_id: o.id, item_id: item.id } });
      if (orderItems && orderItems.length > 0) {
        purchasedAndDelivered = true;
        break;
      }
    }

    if (!purchasedAndDelivered) {
      return res.status(403).json({
        success: false,
        message: 'Only customers who purchased and received this product can review it.'
      });
    }

    const rating = Number(req.body.rating) || 5;
    const comment = String(req.body.comment || '').trim();

    const review = await db.Review.create({
      user_id: req.user.id,
      item_id: item.id,
      rating: Math.min(Math.max(rating, 1), 5),
      comment,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Review submitted for approval', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, price, stock, brand, theme } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    const imagePaths = (req.files || []).map(file => `/uploads/${file.filename}`);

    const item = await Item.create({
      name,
      description,
      price,
      stock: stock || 0,
      brand: brand || 'Mystery Pop',
      theme: theme || 'General',
      image: imagePaths[0] || null,
      images: imagePaths
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), upload.array('images', 5), async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const imagePaths = (req.files || []).map(file => `/uploads/${file.filename}`);
    const updatedData = {
      name: req.body.name || item.name,
      description: req.body.description ?? item.description,
      price: req.body.price || item.price,
      stock: req.body.stock ?? item.stock,
      brand: req.body.brand ?? item.brand,
      theme: req.body.theme ?? item.theme,
      images: item.images || []
    };

    if (imagePaths.length > 0) {
      updatedData.image = imagePaths[0];
      updatedData.images = imagePaths;
    }

    await item.update(updatedData);
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id, { paranoid: false });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const force = req.query.force === 'true';
    if (force) {
      if (db.Review) {
        await db.Review.destroy({ where: { item_id: item.id } });
      }
      if (db.OrderItem) {
        await db.OrderItem.destroy({ where: { item_id: item.id } });
      }
      if (db.BoxSerial) {
        await db.BoxSerial.destroy({ where: { item_id: item.id } });
      }
    }
    await item.destroy({ force });
    res.json({ success: true, message: force ? 'Item permanently deleted' : 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/restore', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id, { paranoid: false });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await item.restore();
    res.json({ success: true, message: 'Item restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
