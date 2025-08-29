const express = require('express');
const router = express.Router();
const ConversationController = require('../controllers/ConversationController');
const MessageController = require('../controllers/MessageController');
const verifyToken = require('../middlewares/authMiddleware');
const parser = require('../middlewares/uploadImage');


router.post('/create-conversation', verifyToken, ConversationController.createConversation);
router.get('/get-conversation', verifyToken, ConversationController.getUserConversations);

router.post('/send-message', verifyToken, parser.array('media'), MessageController.sendMessage);
router.get('/messages/:ConversationId', verifyToken, MessageController.getMessages);


module.exports = router;