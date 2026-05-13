const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    totalBookings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastVisit: { type: Date },
    status: { type: String, enum: ['new', 'active', 'loyal', 'slipping'], default: 'new' },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
