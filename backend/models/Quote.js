// models/Quote.js
const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    propertyType: {
      type: String,
      enum: ['Residential Home', 'Apartment / Flat', 'Commercial Building', 'Industrial / Factory', 'Agricultural'],
      required: true,
    },
    billRange:    { type: String, required: true },
    message:      { type: String },
    status:       {
      type: String,
      enum: ['New', 'In Progress', 'Resolved'],
      default: 'New',
    },
    // optional: link to a registered user
    user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quote', quoteSchema);
