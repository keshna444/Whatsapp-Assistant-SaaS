const express = require('express');
const router = express.Router();
const { verifyWebhook, handleIncomingMessage } = require('../controllers/webhookController');

router.get('/', verifyWebhook);
router.post('/', handleIncomingMessage);

module.exports = router;
