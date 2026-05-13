const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/chatController');

// Public route — customers can chat without an account
router.post('/', chat);

module.exports = router;
