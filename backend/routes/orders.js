const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const db = require('../models');
const { isAuthenticatedUser } = require('../middlewares/auth');

const Order = db.Order;
const OrderItem = db.OrderItem;
const Item = db.Item;

function formatShippingAddress(shippingAddress) {
  if (!shippingAddress) return '';
  if (typeof shippingAddress === 'string') {
    return shippingAddress.trim();
  }
  if (typeof shippingAddress === 'object') {
    const lines = [
      shippingAddress.addressLine1,
      shippingAddress.addressLine2,
      shippingAddress.city,
      shippingAddress.state,
      shippingAddress.zip,
      shippingAddress.country
    ].filter(Boolean);
    return lines.join(', ');
  }
  return String(shippingAddress).trim();
}

async function generateReceiptPdf(order, items, orderNumber) {
  const displayNum = orderNumber || order.id;
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.font('Helvetica-Bold').fontSize(20).text('MysteryPopShop Receipt', { underline: true });
    doc.moveDown();
    doc.font('Helvetica').fontSize(12);
    doc.text(`Order #: ${displayNum}`);
    doc.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}`);
    doc.text(`Customer: ${order.customer_name}`);
    doc.text(`Email: ${order.email}`);
    doc.moveDown();

    doc.text('Shipping Address:', { underline: true });
    doc.font('Helvetica').text(order.shipping_address || 'N/A');
    doc.moveDown();

    doc.text('Order items:', { underline: true });
    items.forEach((item) => {
      const itemLine = `${item.quantity} × ${item.item_name} @ ₱${Number(item.price).toFixed(2)} = ₱${(item.quantity * Number(item.price)).toFixed(2)}`;
      doc.text(itemLine);
    });
    doc.moveDown();

    doc.font('Helvetica-Bold').text(`Total Amount: ₱${Number(order.total_amount).toFixed(2)}`);
    doc.moveDown();
    doc.font('Helvetica').text('Thank you for your purchase from MysteryPopShop!');
    doc.end();
  });
}

function createMailTransporter() {
  const host = process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io';
  const port = Number(process.env.MAILTRAP_PORT || 2525);
  const user = process.env.MAILTRAP_USER;
  const pass = process.env.MAILTRAP_PASS;

  if (!user || !pass || user === 'your_mailtrap_username' || pass === 'your_mailtrap_password') {
    console.warn('Mailtrap credentials not configured. Please define MAILTRAP_USER and MAILTRAP_PASS in your .env file to enable transactional email notifications.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user,
      pass
    }
  });
}

async function sendReceiptEmail(user, order, orderItems, orderNumber) {
  const displayNum = orderNumber || order.id;
  const transporter = createMailTransporter();
  if (!transporter) {
    return { sent: false, reason: 'Mailtrap not configured' };
  }

  const pdfBuffer = await generateReceiptPdf(order, orderItems, displayNum);
  const mailOptions = {
    from: process.env.MAIL_FROM || 'MysteryPopShop <no-reply@mysterypopshop.com>',
    to: user.email || order.email,
    subject: `Your MysteryPopShop receipt for order #${displayNum}`,
    text: `Hi ${user.name},\n\nThank you for your order. Your receipt is attached as a PDF.\n\nOrder #${displayNum}\nTotal: ₱${Number(order.total_amount).toFixed(2)}\n\nRegards,\nMysteryPopShop`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #2e4358; padding-bottom: 20px; margin-bottom: 20px;">
          <h1 style="color: #2e4358; margin: 0; font-size: 24px;">Mystery Pop Shop</h1>
          <p style="color: #777777; margin: 5px 0 0 0; font-size: 14px;">Thank you for your order!</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #333333; margin-top: 0;">Order Information</h2>
          <table style="width: 100%; font-size: 14px; color: #555555; line-height: 1.6;">
            <tr>
              <td style="width: 120px; font-weight: bold; padding: 3px 0;">Order Number:</td>
              <td style="padding: 3px 0;">#${displayNum}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3px 0;">Order Date:</td>
              <td style="padding: 3px 0;">${order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3px 0;">Customer Name:</td>
              <td style="padding: 3px 0;">${order.customer_name}</td>
            </tr>
            <tr>
              <td style="font-weight: bold; padding: 3px 0;">Payment Status:</td>
              <td style="padding: 3px 0;"><span style="background-color: ${order.payment_status === 'paid' ? '#d4edda' : '#fff3cd'}; color: ${order.payment_status === 'paid' ? '#155724' : '#856404'}; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${order.payment_status.toUpperCase()}</span></td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #333333; margin-bottom: 10px;">Shipping Details</h2>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; font-size: 14px; color: #555555; border-left: 4px solid #2e4358;">
            ${order.shipping_address || 'No shipping address provided.'}
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; color: #333333; margin-bottom: 10px;">Ordered Items</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="border-bottom: 1px solid #dddddd; text-align: left; background-color: #f8f9fa;">
                <th style="padding: 10px; font-weight: bold; color: #333333;">Product</th>
                <th style="padding: 10px; font-weight: bold; color: #333333; text-align: center;">Qty</th>
                <th style="padding: 10px; font-weight: bold; color: #333333; text-align: right;">Unit Price</th>
                <th style="padding: 10px; font-weight: bold; color: #333333; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr style="border-bottom: 1px solid #eeeeee;">
                  <td style="padding: 10px; color: #555555;">${item.item_name}</td>
                  <td style="padding: 10px; color: #555555; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; color: #555555; text-align: right;">₱${Number(item.price).toFixed(2)}</td>
                  <td style="padding: 10px; color: #555555; text-align: right; font-weight: bold;">₱${(item.quantity * Number(item.price)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="border-top: 2px solid #eeeeee; padding-top: 15px; text-align: right;">
          <p style="font-size: 18px; font-weight: bold; color: #2e4358; margin: 0;">Grand Total: ₱${Number(order.total_amount).toFixed(2)}</p>
        </div>

        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #eeeeee; padding-top: 20px; font-size: 12px; color: #999999;">
          <p style="margin: 0 0 5px 0;">This is an automated transaction receipt from Mystery Pop Shop.</p>
          <p style="margin: 0;">© 2026 Mystery Pop Shop. All rights reserved.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `receipt-order-${displayNum}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Receipt email sent successfully for order #${displayNum} to ${user.email || order.email}`);
    return { sent: true };
  } catch (err) {
    console.error(`Failed to send receipt email for order #${displayNum} to ${user.email || order.email}:`, err.message);
    throw err;
  }
}

router.post('/checkout', isAuthenticatedUser, async (req, res) => {
  try {
    const { cart, shippingAddress, contactPhone, paymentMethod, notes } = req.body;
    const items = Array.isArray(cart) ? cart : [];

    if (!items.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const totalAmount = items.reduce((sum, item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.qty || 1);
      return sum + price * qty;
    }, 0);

    const shippingText = formatShippingAddress(shippingAddress);
    const noteParts = [];
    if (contactPhone) noteParts.push(`Contact: ${contactPhone}`);
    if (paymentMethod) noteParts.push(`Payment: ${paymentMethod}`);
    if (notes) noteParts.push(`Note: ${notes}`);

    // Calculate sequential order number for this user
    const previousCount = await Order.count({ where: { user_id: req.user.id } });
    const orderNumber = previousCount + 1;

    // COD is pending until delivered and paid
    const paymentStatus = (paymentMethod === 'COD' || paymentMethod === 'cod') ? 'pending' : 'paid';

    const order = await Order.create({
      user_id: req.user.id,
      customer_name: req.user.name,
      email: req.user.email,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: paymentStatus,
      shipping_address: shippingText || null,
      notes: noteParts.length ? noteParts.join(' | ') : null
    });

    const orderItems = [];

    for (const item of items) {
      const itemId = Number(item.id);
      const product = await Item.findByPk(itemId);
      if (!product) {
        continue;
      }

      const quantity = Math.max(1, Number(item.qty || 1));
      const unitPrice = Number(item.price || product.price || 0);

      orderItems.push({
        order_id: order.id,
        item_id: product.id,
        item_name: product.name,
        quantity,
        price: unitPrice
      });

      if (Number(product.stock) >= 0) {
        await product.update({ stock: Math.max(0, Number(product.stock) - quantity) });
      }
    }

    if (orderItems.length) {
      await OrderItem.bulkCreate(orderItems);
    }

    let receiptEmailSent = false;
    let emailError = null;
    try {
      const receiptResult = await sendReceiptEmail(req.user, order, orderItems, orderNumber);
      receiptEmailSent = Boolean(receiptResult.sent);
      if (!receiptResult.sent) {
        emailError = receiptResult.reason || 'Receipt email was not sent';
      }
    } catch (emailErr) {
      emailError = emailErr.message;
      console.warn('Receipt email could not be sent:', emailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: { ...order.get({ plain: true }), order_number: orderNumber },
        items: orderItems,
        receiptEmailSent,
        emailError
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/orders', isAuthenticatedUser, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'ASC']],
      include: [{ model: db.OrderItem, as: 'items' }]
    });

    // Attach order_number sequentially starting from 1
    const mappedOrders = orders.map((order, idx) => {
      const plain = order.get({ plain: true });
      plain.order_number = idx + 1;
      return plain;
    });

    // Return in DESC order for display (newest first)
    mappedOrders.reverse();

    res.json({ success: true, data: mappedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

async function getSequentialOrderNumber(order) {
  try {
    const count = await Order.count({
      where: {
        user_id: order.user_id,
        created_at: {
          [db.Sequelize.Op.lte]: order.created_at || new Date()
        }
      }
    });
    return count || 1;
  } catch (e) {
    return order.id;
  }
}

async function sendOrderUpdateEmail(order, orderItems) {
  const transporter = createMailTransporter();
  if (!transporter) {
    console.warn('Cannot send order update email: Mailtrap transporter could not be created.');
    return { sent: false, reason: 'Mailtrap not configured' };
  }

  let email = order.email;
  if (!email && order.user_id) {
    try {
      const user = await db.User.findByPk(order.user_id);
      if (user) {
        email = user.email;
      }
    } catch (e) {
      console.warn('Could not fetch user for order fallback email:', e.message);
    }
  }

  if (!email) {
    console.warn(`Cannot send order update email for order #${order.id}: No email address available.`);
    return { sent: false, reason: 'No email address found' };
  }

  const orderNumber = await getSequentialOrderNumber(order);
  const pdfBuffer = await generateReceiptPdf(order, orderItems, orderNumber);
  const mailOptions = {
    from: process.env.MAIL_FROM || 'MysteryPopShop <no-reply@mysterypopshop.com>',
    to: email,
    subject: `MysteryPopShop: Order #${orderNumber} status updated to ${order.status}`,
    text: `Hi ${order.customer_name || 'Customer'},\n\nWe have updated your order #${orderNumber} status.\n\nNew Status: ${order.status}\nPayment Status: ${order.payment_status}\nTotal: ₱${Number(order.total_amount).toFixed(2)}\n\nYour receipt is attached to this email as a PDF.\n\nRegards,\nMysteryPopShop`,
    html: `<p>Hi ${order.customer_name || 'Customer'},</p><p>We have updated your order <strong>#${orderNumber}</strong> status.</p><p><strong>New Status:</strong> ${order.status}<br/><strong>Payment Status:</strong> ${order.payment_status}<br/><strong>Total:</strong> ₱${Number(order.total_amount).toFixed(2)}</p><p>Your receipt is attached to this email as a PDF.</p><p>Regards,<br/>MysteryPopShop</p>`,
    attachments: [
      {
        filename: `receipt-order-${orderNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order update email sent successfully to ${email} for order #${orderNumber}`);
    return { sent: true };
  } catch (err) {
    console.error(`Failed to send order update email to ${email}:`, err.message);
    throw err;
  }
}

router.sendOrderUpdateEmail = sendOrderUpdateEmail;

module.exports = router;
