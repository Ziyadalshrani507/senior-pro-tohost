const Rating = require('../Models/Rating');
const Destination = require('../Models/Destination');
const { Restaurant } = require('../Models/Restaurant');
const Hotel = require('../Models/Hotel');

// Add a new rating
const addRating = async (req, res) => {
  try {
    const { itemId, itemType, rating, comment, visitDate } = req.body;
    const userId = req.user._id;

    // Check if item exists
    let Model;
    if (itemType === 'destination') {
      Model = Destination;
    } else if (itemType === 'hotel') {
      Model = Hotel;
    } else {
      // Default to Restaurant for backward compatibility
      Model = Restaurant;
    }
    
    const item = await Model.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: `${itemType} not found` });
    }

    // Create new rating
    const newRating = new Rating({
      userId,
      itemId,
      itemType,
      rating,
      comment,
      visitDate
    });

    // Check for duplicate content
    if (await newRating.isDuplicate()) {
      return res.status(400).json({ message: 'Similar review already exists. Please wait 24 hours before posting similar content.' });
    }

    // Basic content moderation
    const moderationFlags = ['spam', 'offensive', 'inappropriate'].filter(word => 
      comment.toLowerCase().includes(word)
    );

    if (moderationFlags.length > 0) {
      return res.status(400).json({ message: 'Review contains inappropriate content' });
    }

    await newRating.save();

    // Update average rating for the item
    const allRatings = await Rating.find({ itemId, itemType });
    const avgRating = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;
    
    // For Hotel model, update the nested rating object
    if (itemType === 'hotel') {
      await Model.findByIdAndUpdate(itemId, { 
        'rating.average': avgRating.toFixed(1),
        'rating.count': allRatings.length
      });
    } else {
      await Model.findByIdAndUpdate(itemId, { rating: avgRating.toFixed(1) });
    }

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a rating
const updateRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found or unauthorized' });
    }

    const { comment, rating: newRating, visitDate } = req.body;

    // Update fields if provided
    if (comment) rating.comment = comment;
    if (newRating) rating.rating = newRating;
    if (visitDate) rating.visitDate = visitDate;

    await rating.save();

    // Update average rating for the item
    const allRatings = await Rating.find({ itemId: rating.itemId, itemType: rating.itemType });
    const avgRating = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;
    
    // Get the appropriate model based on item type
    let Model;
    if (rating.itemType === 'destination') {
      Model = Destination;
    } else if (rating.itemType === 'hotel') {
      Model = Hotel;
    } else {
      Model = Restaurant;
    }
    
    // For Hotel model, update the nested rating object
    if (rating.itemType === 'hotel') {
      await Model.findByIdAndUpdate(rating.itemId, { 
        'rating.average': avgRating.toFixed(1),
        'rating.count': allRatings.length
      });
    } else {
      await Model.findByIdAndUpdate(rating.itemId, { rating: avgRating.toFixed(1) });
    }

    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a rating
const deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found or unauthorized' });
    }

    await rating.remove();

    // Update average rating for the item
    const allRatings = await Rating.find({ itemId: rating.itemId, itemType: rating.itemType });
    const avgRating = allRatings.length > 0 
      ? allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length 
      : 0;
    
    // Get the appropriate model based on item type
    let Model;
    if (rating.itemType === 'destination') {
      Model = Destination;
    } else if (rating.itemType === 'hotel') {
      Model = Hotel;
    } else {
      Model = Restaurant;
    }
    
    // For Hotel model, update the nested rating object
    if (rating.itemType === 'hotel') {
      await Model.findByIdAndUpdate(rating.itemId, { 
        'rating.average': avgRating.toFixed(1),
        'rating.count': allRatings.length
      });
    } else {
      await Model.findByIdAndUpdate(rating.itemId, { rating: avgRating.toFixed(1) });
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ratings for an item
const getItemRatings = async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const ratings = await Rating.find({ itemId, itemType })
      .populate({
        path: 'userId',
        select: 'firstName lastName profilePicture'
      })
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ itemId, itemType });

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRatings: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rating statistics for an item
const getRatingStats = async (req, res) => {
  try {
    const { itemType, itemId } = req.params;

    // Find the appropriate model based on item type
    let Model;
    if (itemType === 'destination') {
      Model = Destination;
    } else if (itemType === 'hotel') {
      Model = Hotel;
    } else {
      // Default to Restaurant for backward compatibility
      Model = Restaurant;
    }

    const [ratings, item] = await Promise.all([
      Rating.find({ itemType, itemId }),
      Model.findById(itemId)
    ]);

    if (!item) {
      return res.status(404).json({ message: `${itemType} not found` });
    }

    const stats = {
      average: 0,
      total: ratings.length,
      distribution: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      }
    };

    if (ratings.length > 0) {
      // Calculate distribution
      ratings.forEach(rating => {
        stats.distribution[rating.rating]++;
      });

      // Calculate average
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      stats.average = sum / ratings.length;
    }

    res.json(stats);
  } catch (error) {
    console.error('Error in getRatingStats:', error);
    res.status(500).json({ message: 'Error fetching rating statistics' });
  }
};

// Get user's ratings
const getUserRatings = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // First, get all ratings
    const ratings = await Rating.find({ userId }).sort('-createdAt');

    // Group ratings by itemType
    const destinationRatings = ratings.filter(r => r.itemType === 'destination');
    const hotelRatings = ratings.filter(r => r.itemType === 'hotel');
    const restaurantRatings = ratings.filter(r => r.itemType === 'restaurant');

    // Populate each type separately
    const [populatedDestinations, populatedHotels, populatedRestaurants] = await Promise.all([
      Rating.populate(destinationRatings, {
        path: 'itemId',
        model: Destination,
        select: 'name images location description'
      }),
      Rating.populate(hotelRatings, {
        path: 'itemId',
        model: Hotel,
        select: 'name images location description'
      }),
      Rating.populate(restaurantRatings, {
        path: 'itemId',
        model: Restaurant,
        select: 'name images location description'
      })
    ]);

    // Combine and sort all populated ratings
    const allPopulatedRatings = [...populatedDestinations, ...populatedHotels, ...populatedRestaurants]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice((page - 1) * limit, page * limit);

    // Format the ratings
    const formattedRatings = allPopulatedRatings.map(rating => ({
      _id: rating._id,
      rating: rating.rating,
      comment: rating.comment,
      visitDate: rating.visitDate,
      createdAt: rating.createdAt,
      itemType: rating.itemType,
      itemId: {
        _id: rating.itemId?._id,
        name: rating.itemId?.name || rating.itemId?.title,
      },
      destinationName: rating.itemId?.name || rating.itemId?.title,
      description: rating.itemId?.description,
      images: rating.itemId?.images
    }));

    const total = await Rating.countDocuments({ userId });

    res.json({
      ratings: formattedRatings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRatings: total
    });
  } catch (error) {
    console.error('Error in getUserRatings:', error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle like on a rating
const toggleLike = async (req, res) => {
  try {
    const ratingId = req.params.id;
    const userId = req.user._id;

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    const userLikedIndex = rating.likes.indexOf(userId);
    
    if (userLikedIndex === -1) {
      // User hasn't liked the rating yet
      rating.likes.push(userId);
    } else {
      // User already liked the rating, so unlike it
      rating.likes.splice(userLikedIndex, 1);
    }

    await rating.save();
    
    res.json({
      likes: rating.likes.length,
      isLiked: userLikedIndex === -1
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addRating,
  updateRating,
  deleteRating,
  getItemRatings,
  getUserRatings,
  toggleLike,
  getRatingStats
};
