const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  businessId: { type: String, default: 'default' },
  customerPhone: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  direction: { type: String, enum: ['inbound', 'outbound'], required: true },
  timestamp: { type: Date, default: Date.now },
});

messageSchema.index({ customerPhone: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
