const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const parser = require('../middlewares/uploadImage');

router.post('/create', verifyToken, parser.fields([
  { name: 'Image', maxCount: 10 },
  { name: 'Video', maxCount: 5 }
]), PostController.createPost);
router.get('/detail/:id', verifyToken, PostController.getPostById);
router.put('/update/:id', verifyToken, parser.fields([
  { name: 'Image', maxCount: 10 },
  { name: 'Video', maxCount: 5 }
]), PostController.Update);
router.get('/', verifyToken, PostController.getPosts);
router.delete('/delete/:id', verifyToken, PostController.deletePost);
router.get('/my-posts', verifyToken, PostController.getUserPosts);
router.get('/user/:userId', verifyToken, PostController.getPostsByUserId);

module.exports = router;