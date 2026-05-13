const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    sender: { type: String, enum: ['user', 'bot'], required: true },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, trim: true },
    name: { type: String, trim: true },
    messages: [messageSchema],
    status: { type: String, enum: ['ai_active', 'human_needed'], default: 'ai_active' },
    unread: { type: Number, default: 0 },
    lastMessage: { type: String, default: '' },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);
