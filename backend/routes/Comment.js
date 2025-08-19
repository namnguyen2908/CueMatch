const express = require("express");
const router = express.Router();
const commentController = require("../controllers/CommentController");
const  verifyToken  = require('../middlewares/authMiddleware');

router.post("/", verifyToken, commentController.createComment);
router.get("/post/:postId", commentController.getCommentsByPost);
router.put("/like/:id", verifyToken, commentController.toggleLikeComment);
router.delete("/:id", verifyToken, commentController.deleteComment);

module.exports = router;
