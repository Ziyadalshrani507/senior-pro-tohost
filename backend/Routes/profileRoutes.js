const express = require('express');
const router = express.Router();
const profileController = require('../Controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get user profile
router.get('/', protect, profileController.getProfile);

// Update user profile
router.put('/', protect, profileController.updateProfile);

// Upload profile picture
router.post('/picture', protect, upload.single('profilePicture'), profileController.uploadProfilePicture);

// Delete profile picture
router.delete('/picture', protect, profileController.deleteProfilePicture);

module.exports = router;
