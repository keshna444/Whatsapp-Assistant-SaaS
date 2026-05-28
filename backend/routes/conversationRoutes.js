const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversationById,
  sendMessage,
  createConversation,
  updateStatus,
} = require('../controllers/conversationController');

router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversationById);
router.post('/:id/message', sendMessage);
router.patch('/:id/status', updateStatus);

module.exports = router;
