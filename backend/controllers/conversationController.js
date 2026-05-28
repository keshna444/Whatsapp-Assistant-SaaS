const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const demoStore = require('../store/demoStore');
const { getAiReply } = require('./chatController');
const socketManager = require('../socket/socketManager');

const isDbConnected = () => mongoose.connection.readyState === 1;

// ---------------------------------------------------------------------------
// GET /api/conversations
// ---------------------------------------------------------------------------
const getConversations = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const list = demoStore.conversations.map(({ messages, ...c }) => ({
        ...c,
        messageCount: messages.length,
      }));
      return res.json(list);
    }
    const conversations = await Conversation.find()
      .select('-messages')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------------------
// GET /api/conversations/:id
// ---------------------------------------------------------------------------
const getConversationById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!isDbConnected()) {
      const conv = demoStore.conversations.find(c => c._id === id);
      if (!conv) return res.status(404).json({ message: 'Conversation not found.' });
      return res.json(conv);
    }
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/conversations/:id/message
// ---------------------------------------------------------------------------
const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) return res.status(400).json({ message: 'Message is required.' });

  try {
    // ---- Demo mode ----
    if (!isDbConnected()) {
      const conv = demoStore.conversations.find(c => c._id === id);
      if (!conv) return res.status(404).json({ message: 'Conversation not found.' });

      const userMsg = {
        _id: demoStore.nextId(),
        text: message,
        sender: 'user',
        createdAt: new Date().toISOString(),
      };
      conv.messages.push(userMsg);

      // Signal AI is processing
      socketManager.emitAiTyping(conv.businessId || 'default', id, true);

      const reply = getAiReply(message);
      const botMsg = {
        _id: demoStore.nextId(),
        text: reply,
        sender: 'bot',
        createdAt: new Date().toISOString(),
      };
      conv.messages.push(botMsg);
      conv.lastMessage = message;
      conv.updatedAt = new Date().toISOString();
      if (conv.unread > 0) conv.unread = 0;

      // Emit real-time events
      socketManager.emitAiTyping(conv.businessId || 'default', id, false);
      socketManager.emitNewMessage(conv.businessId || 'default', id, userMsg);
      socketManager.emitNewMessage(conv.businessId || 'default', id, botMsg);
      socketManager.emitConversationUpdated(conv.businessId || 'default', id, {
        lastMessage: message,
        updatedAt: conv.updatedAt,
        unread: conv.unread,
      });

      return res.json({ reply, userMessage: userMsg, botMessage: botMsg });
    }

    // ---- DB mode ----
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    const businessId = conversation.businessId?.toString() || 'default';

    conversation.messages.push({ text: message, sender: 'user' });

    // Signal AI is processing before generating reply
    socketManager.emitAiTyping(businessId, id, true);

    const reply = getAiReply(message);
    conversation.messages.push({ text: reply, sender: 'bot' });
    conversation.lastMessage = message;
    conversation.unread = 0;
    await conversation.save();

    const msgs = conversation.messages;
    const userMsg = msgs[msgs.length - 2];
    const botMsg = msgs[msgs.length - 1];

    socketManager.emitAiTyping(businessId, id, false);
    socketManager.emitNewMessage(businessId, id, {
      _id: userMsg._id.toString(),
      text: userMsg.text,
      sender: userMsg.sender,
      createdAt: userMsg.createdAt,
    });
    socketManager.emitNewMessage(businessId, id, {
      _id: botMsg._id.toString(),
      text: botMsg.text,
      sender: botMsg.sender,
      createdAt: botMsg.createdAt,
    });
    socketManager.emitConversationUpdated(businessId, id, {
      lastMessage: message,
      updatedAt: conversation.updatedAt,
      unread: 0,
    });

    res.json({ reply, userMessage: userMsg, botMessage: botMsg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/conversations
// ---------------------------------------------------------------------------
const createConversation = async (req, res) => {
  const { phone, name } = req.body;
  if (!phone) return res.status(400).json({ message: 'Phone is required.' });

  try {
    if (!isDbConnected()) {
      const conv = {
        _id: demoStore.nextId(),
        phone,
        name: name || phone,
        status: 'ai_active',
        unread: 0,
        lastMessage: '',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoStore.conversations.push(conv);

      const { messages: _msgs, ...convSummary } = conv;
      socketManager.emitNewConversation('default', convSummary);

      return res.status(201).json(conv);
    }

    const existing = await Conversation.findOne({ phone });
    if (existing) return res.json(existing);

    const conversation = await Conversation.create({ phone, name: name || phone });
    const businessId = conversation.businessId?.toString() || 'default';

    const convObj = conversation.toObject();
    const { messages: _msgs, ...convSummary } = convObj;
    socketManager.emitNewConversation(businessId, { ...convSummary, _id: convSummary._id.toString() });

    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------------------
// PATCH /api/conversations/:id/status
// Persists AI/human takeover decision to the database.
// ---------------------------------------------------------------------------
const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['ai_active', 'human_needed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be ai_active or human_needed.' });
  }

  try {
    // ---- Demo mode ----
    if (!isDbConnected()) {
      const conv = demoStore.conversations.find(c => c._id === id);
      if (!conv) return res.status(404).json({ message: 'Conversation not found.' });

      conv.status = status;
      conv.updatedAt = new Date().toISOString();

      socketManager.emitConversationUpdated('default', id, { status, updatedAt: conv.updatedAt });
      return res.json({ status, updatedAt: conv.updatedAt });
    }

    // ---- DB mode ----
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { status },
      { new: true, select: 'status updatedAt businessId' }
    );
    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    const businessId = conversation.businessId?.toString() || 'default';
    socketManager.emitConversationUpdated(businessId, id, {
      status: conversation.status,
      updatedAt: conversation.updatedAt,
    });

    res.json({ status: conversation.status, updatedAt: conversation.updatedAt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConversations, getConversationById, sendMessage, createConversation, updateStatus };
