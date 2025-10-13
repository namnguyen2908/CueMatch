const express = require("express");
const router = express.Router();
const SavedPostController = require("../controllers/SavedPostController");
const { verifyToken, checkRole } = require("../middlewares/authMiddleware");

router.post("/savedPost", verifyToken, SavedPostController.savePost);
router.delete("/unsavePost/:postId", verifyToken, SavedPostController.unsavePost);
router.get("/get-savePost", verifyToken, SavedPostController.getSavedPost);
router.get("/check-saved/:postId", verifyToken, SavedPostController.checkSaved);

module.exports = router;