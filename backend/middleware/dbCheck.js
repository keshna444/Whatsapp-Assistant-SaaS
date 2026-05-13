const mongoose = require('mongoose');

const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database not connected. Please try again later.',
    });
  }
  next();
};

module.exports = { dbCheck };
