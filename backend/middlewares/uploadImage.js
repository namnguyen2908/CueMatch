const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'posts';
    let resource_type = 'auto'; // auto: ảnh hoặc video đều được
    return {
      folder,
      resource_type,
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

// File size limits: 100MB max (covers both images and videos)
// Frontend will validate specific limits (10MB for images, 100MB for videos)
const limits = {
  fileSize: 100 * 1024 * 1024, // 100MB max
};

const parser = multer({ 
  storage,
  limits,
  // Error handler for file size limit exceeded
  onError: (err, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new Error('File size exceeds the maximum limit of 100MB'));
    }
    next(err);
  }
});

module.exports = parser;