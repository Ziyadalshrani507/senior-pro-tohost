const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getDevelopers,
  getDeveloperById,
  getDeveloperByUser,
  createUpdateDeveloper,
  uploadDeveloperPhoto
} = require('../Controllers/developerController');

// Ensure uploads directory exists
const developersUploadDir = path.join(__dirname, '..', 'uploads', 'developers');
if (!fs.existsSync(developersUploadDir)) {
  fs.mkdirSync(developersUploadDir, { recursive: true });
}

// Configure multer for developer photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, developersUploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }
    cb(null, true);
  }
});

// Public routes - available to all users
router.get('/', getDevelopers);
router.get('/:id', getDeveloperById);

// Protected routes - require admin role
router.get('/profile/me', protect, admin, getDeveloperByUser);
router.post('/profile', protect, admin, createUpdateDeveloper);
router.put('/profile', protect, admin, createUpdateDeveloper);
router.post('/profile/photo', protect, admin, upload.single('photo'), uploadDeveloperPhoto);

module.exports = router;