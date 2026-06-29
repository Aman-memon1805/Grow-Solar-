// routes/products.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ── Multer storage config (local uploads folder) ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) =>
    cb(null, 'product-' + Date.now() + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

/* ─────────────────────────────────────
   GET /api/products
   Public – list all products
   Query params: category, featured
───────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured)  filter.featured  = req.query.featured === 'true';

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   GET /api/products/:id
   Public – single product detail
───────────────────────────────────── */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   POST /api/products
   Admin only – create product
───────────────────────────────────── */
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, wattage, type, panels, inStock, featured } = req.body;

    const product = await Product.create({
      name, description, price, category, wattage, type, panels,
      inStock:  inStock  !== undefined ? inStock  === 'true' : true,
      featured: featured !== undefined ? featured === 'true' : false,
      image:    req.file ? `/uploads/${req.file.filename}` : '',
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   PUT /api/products/:id
   Admin only – update product
───────────────────────────────────── */
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const fields = ['name', 'description', 'price', 'category', 'wattage', 'type', 'panels', 'inStock', 'featured'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        if (f === 'inStock' || f === 'featured') product[f] = req.body[f] === 'true';
        else product[f] = req.body[f];
      }
    });

    if (req.file) product.image = `/uploads/${req.file.filename}`;

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ─────────────────────────────────────
   DELETE /api/products/:id
   Admin only – delete product
───────────────────────────────────── */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
