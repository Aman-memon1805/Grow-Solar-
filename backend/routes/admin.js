// routes/admin.js
const express = require('express');
const User    = require('../models/User');
const Product = require('../models/Product');
const Quote   = require('../models/Quote');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

/* ─────────────────────────────────────
   GET /api/admin/stats
   Admin only – dashboard summary stats
───────────────────────────────────── */
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalQuotes, newQuotes] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Quote.countDocuments(),
      Quote.countDocuments({ status: 'New' }),
    ]);

    res.json({ totalUsers, totalProducts, totalQuotes, newQuotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   GET /api/admin/users
   Admin only – list all users
───────────────────────────────────── */
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   DELETE /api/admin/users/:id
   Admin only – delete a user
───────────────────────────────────── */
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
