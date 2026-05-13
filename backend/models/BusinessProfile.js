const mongoose = require('mongoose');

const openingHoursSchema = new mongoose.Schema(
  {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '18:00' },
  },
  { _id: false }
);

const businessProfileSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, required: true, trim: true },
    businessType: {
      type: String,
      enum: ['salon', 'barber', 'clinic', 'sme', 'other'],
      required: true,
    },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    description: { type: String, trim: true },
    openingDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    openingHours: { type: openingHoursSchema, default: () => ({}) },
    bookingNotes: { type: String, trim: true },
    aiInstructions: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);
