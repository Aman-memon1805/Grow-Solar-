// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    category:    {
      type: String,
      required: true,
      enum: ['Residential', 'Commercial', 'Industrial', 'Accessories'],
    },
    wattage:     { type: Number },           // e.g. 2000 (watts)
    type:        { type: String },           // e.g. "On-Grid", "Off-Grid", "Hybrid"
    panels:      { type: Number },           // number of panels in kit
    image:       { type: String, default: '' },
    inStock:     { type: Boolean, default: true },
    featured:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
