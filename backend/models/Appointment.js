const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    appointmentDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: { type: String, trim: true },
    price: { type: Number, default: 0 },
    source: { type: String, enum: ['whatsapp', 'web', 'manual'], default: 'web' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
