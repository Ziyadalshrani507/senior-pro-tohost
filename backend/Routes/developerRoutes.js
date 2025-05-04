const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
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

// Sanitize filename to prevent path traversal and invalid characters
const sanitizeFilename = (filename) => {
  // Replace any path traversal patterns and invalid characters
  return filename
    .replace(/\.\./g, '')
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_');
};

// Configure multer for developer photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, developersUploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a random string for added security
    const randomString = crypto.randomBytes(8).toString('hex');
    
    // Get sanitized filename and file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const sanitizedName = sanitizeFilename(path.basename(file.originalname, fileExtension));
    
    // Create a secure filename with timestamp and random string
    cb(null, `${Date.now()}-${randomString}-${sanitizedName}${fileExtension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow one file per request
  },
  fileFilter: (req, file, cb) => {
    // Validate file MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error, false);
    }
    
    // Validate file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowedExtensions.includes(fileExtension)) {
      const error = new Error('Invalid file extension. Only .jpg, .jpeg, .png and .gif are allowed.');
      error.code = 'INVALID_FILE_EXTENSION';
      return cb(error, false);
    }
    
    cb(null, true);
  }
});

// Error handler for file upload
const handleFileUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Public routes - available to all users
router.get('/', getDevelopers);
router.get('/:id', getDeveloperById);

// Protected routes - require admin role
router.get('/profile/me', protect, admin, getDeveloperByUser);
router.post('/profile', protect, admin, createUpdateDeveloper);
router.put('/profile', protect, admin, createUpdateDeveloper);
router.post('/profile/photo', protect, admin, upload.single('photo'), handleFileUploadError, uploadDeveloperPhoto);

module.exports = router;