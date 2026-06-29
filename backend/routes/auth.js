// routes/auth.js
const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

/* ─────────────────────────────────────
   POST /api/auth/register
   Public – create a new user account
───────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone });

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   POST /api/auth/login
   Public – login with email & password
───────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   GET /api/auth/profile
   Private – get logged-in user's profile
───────────────────────────────────── */
router.get('/profile', protect, async (req, res) => {
  res.json({
    _id:       req.user._id,
    name:      req.user.name,
    email:     req.user.email,
    phone:     req.user.phone,
    role:      req.user.role,
    createdAt: req.user.createdAt,
  });
});

/* ─────────────────────────────────────
   PUT /api/auth/profile
   Private – update name / phone
───────────────────────────────────── */
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name  = req.body.name  || user.name;
    user.phone = req.body.phone || user.phone;

    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    res.json({
      _id:   updated._id,
      name:  updated.name,
      email: updated.email,
      phone: updated.phone,
      role:  updated.role,
      token: generateToken(updated._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
