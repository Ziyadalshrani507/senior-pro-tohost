const Rating = require('../Models/Rating');
const Destination = require('../Models/Destination');
const { Restaurant } = require('../Models/Restaurant');

// Add a new rating
const addRating = async (req, res) => {
  try {
    const { itemId, itemType, rating, comment, visitDate } = req.body;
    const userId = req.user._id;

    // Check if item exists
    const Model = itemType === 'destination' ? Destination : Restaurant;
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
    
    await Model.findByIdAndUpdate(itemId, { rating: avgRating.toFixed(1) });

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
    
    const Model = rating.itemType === 'destination' ? Destination : Restaurant;
    await Model.findByIdAndUpdate(rating.itemId, { rating: avgRating.toFixed(1) });

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
    
    const Model = rating.itemType === 'destination' ? Destination : Restaurant;
    await Model.findByIdAndUpdate(rating.itemId, { rating: avgRating.toFixed(1) });

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

    const [ratings, item] = await Promise.all([
      Rating.find({ itemType, itemId }),
      itemType === 'destination' 
        ? Destination.findById(itemId) 
        : Restaurant.findById(itemId)
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

    const ratings = await Rating.find({ userId })
      .populate([
        {
          path: 'itemId',
          select: 'name images location',
          model: function(doc) {
            return doc.itemType === 'destination' ? 'Destination' : 'Restaurant';
          }
        }
      ])
      .sort('-createdAt')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ userId });

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
