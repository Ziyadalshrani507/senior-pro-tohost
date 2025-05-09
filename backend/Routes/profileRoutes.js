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



//Endpoints for user profile management.
// This includes fetching user profiles, updating profiles, and managing profile pictures.
// Handles user profile-related operations (CRUD, listing, etc.).
// This controller manages user profiles, including fetching, updating, and deleting profile information.