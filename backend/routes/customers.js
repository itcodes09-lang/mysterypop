const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../models');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const Customer = db.Customer;

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

const upload = multer({ storage });

router.get('/', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const customers = await Customer.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', isAuthenticatedUser, authorizeRoles('admin'), upload.single('image'), async (req, res) => {
  try {
    const { fname, lname, address, zipcode, phone } = req.body;
    if (!fname) {
      return res.status(400).json({ success: false, message: 'First name is required' });
    }

    const customer = await Customer.create({
      fname,
      lname,
      address,
      zipcode,
      phone,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), upload.single('image'), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const updatedData = {
      fname: req.body.fname || customer.fname,
      lname: req.body.lname ?? customer.lname,
      address: req.body.address ?? customer.address,
      zipcode: req.body.zipcode ?? customer.zipcode,
      phone: req.body.phone ?? customer.phone
    };

    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`;
    }

    await customer.update(updatedData);
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await customer.destroy();
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
