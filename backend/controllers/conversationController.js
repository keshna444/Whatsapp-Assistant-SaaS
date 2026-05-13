const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const demoStore = require('../store/demoStore');
const { getAiReply } = require('./chatController');

const isDbConnected = () => mongoose.connection.readyState === 1;

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

const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) return res.status(400).json({ message: 'Message is required.' });

  try {
    if (!isDbConnected()) {
      const conv = demoStore.conversations.find(c => c._id === id);
      if (!conv) return res.status(404).json({ message: 'Conversation not found.' });

      const userMsg = { _id: demoStore.nextId(), text: message, sender: 'user', createdAt: new Date().toISOString() };
      conv.messages.push(userMsg);

      const reply = getAiReply(message);
      const botMsg = { _id: demoStore.nextId(), text: reply, sender: 'bot', createdAt: new Date().toISOString() };
      conv.messages.push(botMsg);

      conv.lastMessage = message;
      conv.updatedAt = new Date().toISOString();
      if (conv.unread > 0) conv.unread = 0;

      return res.json({ reply, userMessage: userMsg, botMessage: botMsg });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    conversation.messages.push({ text: message, sender: 'user' });

    const reply = getAiReply(message);
    conversation.messages.push({ text: reply, sender: 'bot' });

    conversation.lastMessage = message;
    conversation.unread = 0;
    await conversation.save();

    const msgs = conversation.messages;
    const userMsg = msgs[msgs.length - 2];
    const botMsg = msgs[msgs.length - 1];

    res.json({ reply, userMessage: userMsg, botMessage: botMsg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
      return res.status(201).json(conv);
    }

    const existing = await Conversation.findOne({ phone });
    if (existing) return res.json(existing);

    const conversation = await Conversation.create({ phone, name: name || phone });
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getConversations, getConversationById, sendMessage, createConversation };
