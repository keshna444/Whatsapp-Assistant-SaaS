const mongoose = require('mongoose');
const Message = require('../models/Message');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getMessagesByPhone = async (req, res) => {
  const { phone } = req.params;

  if (!isDbConnected()) {
    return res.status(503).json({ message: 'Database not connected.' });
  }

  try {
    const messages = await Message.find({ customerPhone: phone }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMessagesByPhone };
