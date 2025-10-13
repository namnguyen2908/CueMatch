const express = require('express');
const router = express.Router();
const MatchingController = require('../controllers/MatchingController');
const { verifyToken, checkRole }  = require('../middlewares/authMiddleware');
const checkFeature = require('../middlewares/checkFeature');

router.get('/get-player-list', verifyToken, checkFeature('Matching'), MatchingController.getPlayerList);
router.post('/send-invitation', verifyToken, MatchingController.sendInvitation);
router.post('/accept-invitation/:invitationId', verifyToken, MatchingController.acceptInvitation);
router.get('/get-invitations', verifyToken, MatchingController.getInvitations);
router.post('/decline-invitation/:invitationId', verifyToken, MatchingController.declineInvitation);
router.get('/get-sent-invitation', verifyToken, MatchingController.getSentInvitation);
router.post('/cancel-invitation/:invitationId', verifyToken, MatchingController.cancelInvitation);
router.get('/get-match-history', verifyToken, MatchingController.getMatchHistory);
router.get('/get-upcoming-matching', verifyToken, MatchingController.getUpcomingMatches);

module.exports = router;