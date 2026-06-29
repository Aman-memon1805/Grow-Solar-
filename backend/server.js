// backend/server.js
require('dotenv').config();
const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const path      = require('path');
const bcrypt    = require('bcryptjs');

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const quoteRoutes   = require('./routes/quotes');
const adminRoutes   = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ─── Middleware ──────────────────────────────────────────── */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded product images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve the frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

/* ─── API Routes ──────────────────────────────────────────── */
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/quotes',   quoteRoutes);
app.use('/api/admin',    adminRoutes);

/* ─── Catch-all: serve frontend for any non-API route ─────── */
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

/* ─── Connect to MongoDB and start server ─────────────────── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedAdmin();        // create default admin if none exists
    await seedProducts();     // seed sample products if collection is empty
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

/* ─── Seed: default admin account ────────────────────────── */
async function seedAdmin() {
  const User = require('./models/User');
  const exists = await User.findOne({ role: 'admin' });
  if (!exists) {
    await User.create({
      name:     'Admin',
      email:    process.env.ADMIN_EMAIL    || 'admin@solarvolt.in',
      password: process.env.ADMIN_PASSWORD || 'Admin@1234',
      role:     'admin',
    });
    console.log(`👤 Admin created → ${process.env.ADMIN_EMAIL}`);
  }
}

/* ─── Seed: sample products ───────────────────────────────── */
async function seedProducts() {
  const Product = require('./models/Product');
  const count = await Product.countDocuments();
  if (count > 0) return;

  await Product.insertMany([
    {
      name:        'Home Starter Pack — 2kW',
      description: 'Perfect for small households. Covers fans, lights, TV, and refrigerator.',
      price:       120000,
      category:    'Residential',
      wattage:     2000,
      type:        'On-Grid',
      panels:      10,
      featured:    false,
      inStock:     true,
    },
    {
      name:        'Home Pro System — 5kW',
      description: 'Best-seller for mid-size homes. Runs ACs, geysers, and heavy appliances.',
      price:       280000,
      category:    'Residential',
      wattage:     5000,
      type:        'Hybrid',
      panels:      20,
      featured:    true,
      inStock:     true,
    },
    {
      name:        'Commercial Array — 10kW',
      description: 'Designed for offices and shops. Scalable with priority maintenance.',
      price:       550000,
      category:    'Commercial',
      wattage:     10000,
      type:        'On-Grid',
      panels:      40,
      featured:    false,
      inStock:     true,
    },
  ]);
  console.log('🌞 Sample products seeded');
}
