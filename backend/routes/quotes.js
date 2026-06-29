// routes/quotes.js
const express = require('express');
const Quote   = require('../models/Quote');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

/* ─────────────────────────────────────
   POST /api/quotes
   Public – submit a quote request
───────────────────────────────────── */
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, propertyType, billRange, message } = req.body;

    if (!name || !email || !phone || !propertyType || !billRange)
      return res.status(400).json({ message: 'Please fill all required fields' });

    const quote = await Quote.create({
      name, email, phone, propertyType, billRange, message,
      user: req.body.userId || undefined,
    });

    res.status(201).json({ message: 'Quote submitted successfully', quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   GET /api/quotes
   Admin only – list all quotes
───────────────────────────────────── */
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const quotes = await Quote.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   GET /api/quotes/my
   Private – quotes submitted by logged-in user
───────────────────────────────────── */
router.get('/my', protect, async (req, res) => {
  try {
    const quotes = await Quote.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   PUT /api/quotes/:id/status
   Admin only – update quote status
───────────────────────────────────── */
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['New', 'In Progress', 'Resolved'].includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   DELETE /api/quotes/:id
   Admin only – delete a quote
───────────────────────────────────── */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json({ message: 'Quote deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
