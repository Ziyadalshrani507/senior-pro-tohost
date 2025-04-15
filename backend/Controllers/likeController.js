const Destination = require('../Models/Destination');
const { Restaurant } = require('../Models/Restaurant');
const User = require('../Models/User');
const mongoose = require('mongoose');

// Helper function to get model based on place type
const getModelByType = (placeType) => {
  switch (placeType.toLowerCase()) {
    case 'destination':
      return Destination;
    case 'restaurant':
      return Restaurant;
    default:
      throw new Error('Invalid place type');
  }
};

// Toggle like status for a place
exports.toggleLike = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { placeType, placeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ message: 'Invalid place ID format' });
    }

    const Model = getModelByType(placeType);
    const place = await Model.findById(placeId).session(session);

    if (!place) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Place not found' });
    }

    // Initialize likes array if it doesn't exist
    if (!Array.isArray(place.likes)) {
      place.likes = [];
    }

    // Initialize likeCount if it doesn't exist
    if (typeof place.likeCount !== 'number') {
      place.likeCount = 0;
    }

    const isLiked = place.likes.some(like => like && like.toString() === userId.toString());
    const updateOperation = isLiked
      ? { $pull: { likes: userId }, $inc: { likeCount: -1 } }
      : { $addToSet: { likes: userId }, $inc: { likeCount: 1 } };

    const updatedPlace = await Model.findByIdAndUpdate(
      placeId,
      updateOperation,
      { new: true, session, runValidators: true }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: !isLiked ? 'Place liked successfully' : 'Place unliked successfully',
      isLiked: !isLiked,
      likeCount: updatedPlace.likeCount || 0
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error in toggleLike:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', error: error.message });
    }
    
    res.status(500).json({ message: 'Error toggling like', error: error.message });
  } finally {
    session.endSession();
  }
};

// Get all likes for a user
exports.getUserLikes = async (req, res) => {
  try {
    const userId = req.user._id;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Get all liked places
    const [destinations, restaurants] = await Promise.all([
      Destination.find({ likes: userId }, '_id').lean(),
      Restaurant.find({ likes: userId }, '_id').lean()
    ]);

    // Create arrays of IDs
    const likedDestinations = destinations.map(d => d._id.toString());
    const likedRestaurants = restaurants.map(r => r._id.toString());

    res.json({
      success: true,
      likes: {
        destinations: likedDestinations,
        restaurants: likedRestaurants
      }
    });
  } catch (error) {
    console.error('Error in getUserLikes:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format', error: error.message });
    }
    res.status(500).json({ message: 'Error fetching user likes', error: error.message });
  }
};

// Get like state for a specific place
exports.getPlaceLikes = async (req, res) => {
  try {
    const { placeType, placeId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ message: 'Invalid place ID format' });
    }

    const Model = getModelByType(placeType);
    const place = await Model.findById(placeId).lean();

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    // Safely check if user has liked the place
    const isLiked = userId && Array.isArray(place.likes) ? 
      place.likes.some(like => like && like.toString() === userId.toString()) : 
      false;

    res.json({
      success: true,
      isLiked,
      likeCount: place.likeCount || 0
    });
  } catch (error) {
    console.error('Error in getPlaceLikes:', error);
    res.status(500).json({ message: 'Error fetching place likes', error: error.message });
  }
};
