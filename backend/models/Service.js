const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },
    name: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: 'General' },
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
