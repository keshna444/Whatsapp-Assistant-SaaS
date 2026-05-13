const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  // Demo mode: skip auth when MongoDB is not connected
  if (mongoose.connection.readyState !== 1) {
    req.user = { _id: 'demo-user-id', email: 'demo@bookflow.local', name: 'Demo User' };
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised, no token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    next();
  } catch {
    res.status(401).json({ message: 'Not authorised, token invalid.' });
  }
};

module.exports = { protect };
