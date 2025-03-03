const express = require('express');
const router = express.Router();
const Rating = require('../Models/Rating');
const Destination = require('../Models/Destination');
const { Restaurant } = require('../Models/Restaurant');
const { protect } = require('../middleware/authMiddleware');

// Add a new rating
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, itemType, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate itemType
    if (!['destination', 'restaurant'].includes(itemType)) {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if item exists
    const Model = itemType === 'destination' ? Destination : Restaurant;
    const item = await Model.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: `${itemType} not found` });
    }

    // Create or update rating
    const ratingDoc = await Rating.findOneAndUpdate(
      { userId, itemId, itemType },
      { rating, comment },
      { upsert: true, new: true, runValidators: true }
    );

    // Calculate new average rating
    const ratings = await Rating.find({ itemId, itemType });
    const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;

    // Update item's rating
    await Model.findByIdAndUpdate(itemId, { 
      rating: averageRating,
      ...(itemType === 'restaurant' && { reviews: ratings.length })
    });

    res.status(200).json(ratingDoc);
  } catch (error) {
    console.error('Error in rating:', error);
    res.status(500).json({ message: error.message || 'Error processing rating' });
  }
});

// Get ratings for an item
router.get('/:itemType/:itemId', async (req, res) => {
  try {
    const { itemType, itemId } = req.params;

    // Validate itemType
    if (!['destination', 'restaurant'].includes(itemType)) {
      return res.status(400).json({ message: 'Invalid item type' });
    }

    const ratings = await Rating.find({ itemId, itemType })
      .populate('userId', 'name')
      .sort('-createdAt');

    res.status(200).json(ratings);
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: error.message || 'Error fetching ratings' });
  }
});

// Delete a rating
router.delete('/:id', protect, async (req, res) => {
  try {
    const rating = await Rating.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found or unauthorized' });
    }

    await rating.deleteOne();

    // Recalculate average rating
    const { itemId, itemType } = rating;
    const Model = itemType === 'destination' ? Destination : Restaurant;
    
    const ratings = await Rating.find({ itemId, itemType });
    const averageRating = ratings.length > 0 
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
      : 0;

    // Update item's rating
    await Model.findByIdAndUpdate(itemId, { 
      rating: averageRating,
      ...(itemType === 'restaurant' && { reviews: ratings.length })
    });

    res.status(200).json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ message: error.message || 'Error deleting rating' });
  }
});

module.exports = router;
