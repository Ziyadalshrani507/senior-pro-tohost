const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { toggleLike, getUserLikes, getPlaceLikes } = require('../Controllers/likeController');

// Toggle like status for a place
router.post('/:placeType/:placeId', protect, toggleLike);

// Get all likes for a user
router.get('/user', protect, getUserLikes);

// Get all likes for a place (admin only)
router.get('/:placeType/:placeId', protect, getPlaceLikes);

module.exports = router;


// Endpoints for liking/unliking resources.
// This includes toggling like status, fetching user likes, and fetching likes for a specific place.
// Handles like-related operations (CRUD, listing, etc.).
// This controller manages user likes, including toggling like status and fetching likes for specific places.