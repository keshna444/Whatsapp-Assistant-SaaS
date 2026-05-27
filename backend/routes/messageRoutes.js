const express = require('express');
const router = express.Router();
const { getMessagesByPhone } = require('../controllers/messageController');

router.get('/:phone', getMessagesByPhone);

module.exports = router;
