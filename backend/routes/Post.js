const express = require('express');
const router = express.Router();
const PostController = require('../controllers/PostController');
const  verifyToken  = require('../middlewares/authMiddleware');

router.post('/create', verifyToken, PostController.createPost);
router.get('/detail/:id', verifyToken, PostController.getPostById);
router.put('/update/:id', verifyToken, PostController.Update);
router.get('/', verifyToken, PostController.getPosts);
router.delete('/delete/:id', verifyToken, PostController.deletePost);

module.exports = router;