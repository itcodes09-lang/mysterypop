const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const db = require('../models');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

const User = db.User;

const jwtSecret = process.env.JWT_SECRET || 'change_this_secret';
const tokenExpiry = '7d';

router.post('/register', async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;
    const trimmedName = String(name || '').trim();
    const trimmedUsername = String(username || '').trim().toLowerCase();
    const trimmedEmail = String(email || '').trim().toLowerCase();

    if (!trimmedName || !trimmedUsername || !trimmedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Name, username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existing = await User.findOne({
      where: {
        [Op.or]: [{ email: trimmedEmail }, { username: trimmedUsername }]
      }
    });

    if (existing) {
      const message = existing.email === trimmedEmail ? 'Email already registered' : 'Username already taken';
      return res.status(409).json({ success: false, message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: trimmedName,
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      data: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const queryValue = String(identifier || email || username || '').trim().toLowerCase();

    if (!queryValue || !password) {
      return res.status(400).json({ success: false, message: 'Email/username and password are required' });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: queryValue }, { username: queryValue }]
      }
    });

    if (!user || user.is_active === false || user.is_active === 'false' || user.is_active === 0 || user.is_active === '0' || !user.is_active) {
      return res.status(401).json({ success: false, message: 'This account has been deactivated. Please contact support.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: tokenExpiry });
    user.auth_token = token;
    await user.save();

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, name: user.name, username: user.username, email: user.email, role: user.role, is_active: user.is_active }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/me', isAuthenticatedUser, async (req, res) => {
  try {
    const safeUser = req.user.toJSON();
    delete safeUser.password;
    delete safeUser.auth_token;
    res.json({ success: true, data: { user: safeUser } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.findAll({ order: [['created_at', 'DESC']], attributes: { exclude: ['password', 'auth_token'] } });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { role, is_active } = req.body;
    if (role) user.role = role;
    if (is_active !== undefined) user.is_active = is_active;
    await user.save();

    const responseUser = user.toJSON();
    delete responseUser.password;
    delete responseUser.auth_token;

    res.json({ success: true, data: responseUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/:id/status', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active boolean is required' });
    }

    user.is_active = is_active;
    await user.save();

    res.json({ success: true, message: is_active ? 'User activated successfully' : 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
