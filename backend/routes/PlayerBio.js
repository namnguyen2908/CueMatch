const express = require('express');
const router = express.Router();
const PlayerBioController = require('../controllers/PlayerBioController');
const verifyToken  = require('../middlewares/authMiddleware');

router.post('/create-bio', verifyToken, PlayerBioController.createPlayerBio);
router.put('/edit-bio', verifyToken, PlayerBioController.updatePlayerBio);
router.get('/bio/:userId', verifyToken, PlayerBioController.getPlayerBioByUserId);
router.delete('/delete-bio', verifyToken, PlayerBioController.deletePlayerBio);

module.exports = router;