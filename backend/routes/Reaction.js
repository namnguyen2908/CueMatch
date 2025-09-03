const express = require('express');
const router = express.Router();
const ReactionController = require('../controllers/ReactionController');
const verifyToken = require('../middlewares/authMiddleware');

router.post('/reactToPost', verifyToken, ReactionController.reactionToPost);
router.delete('/deleteReaction', verifyToken, ReactionController.deleteReaction);
router.get('/:postId/reactions', verifyToken, ReactionController.getReactionsGroupedByType);

module.exports = router;