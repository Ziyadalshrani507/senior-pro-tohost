const Destination = require('../Models/Destination');
const { Restaurant } = require('../Models/Restaurant');
const Hotel = require('../Models/Hotel');
const User = require('../Models/User');
const mongoose = require('mongoose');

// Helper function to get model based on place type
const getModelByType = (placeType) => {
  if (!placeType) {
    throw new Error('Place type is required');
  }
  
  switch (placeType.toLowerCase()) {
    case 'destination':
      return Destination;
    case 'restaurant':
      return Restaurant;
    case 'hotel':
      return Hotel;
    default:
      throw new Error(`Invalid place type: ${placeType}`);
  }
};

// Toggle like status for a place
exports.toggleLike = async (req, res) => {
  try {
    const { placeType, placeId } = req.params;
    
    if (!placeType || !placeId) {
      return res.status(400).json({ message: 'Place type and place ID are required' });
    }
    
    const userId = req.user._id;
    const userIdStr = userId.toString();
    
    console.log(`toggleLike - type:${placeType}, placeId:${placeId}, userId:${userIdStr}`);

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ message: 'Invalid place ID format' });
    }

    const Model = getModelByType(placeType);
    const mongoId = new mongoose.Types.ObjectId(placeId);
    
    // Get the document using the MongoDB driver directly
    const document = await Model.collection.findOne({ _id: mongoId });
    
    if (!document) {
      return res.status(404).json({ message: `${placeType} not found` });
    }
    
    console.log(`Found ${placeType} with ID ${placeId}`);
    
    // Ensure likes is an array
    let likes = [];
    if (Array.isArray(document.likes)) {
      likes = [...document.likes]; // Copy the array
    }
    
    console.log(`Current likes:`, likes);
    
    // Check if user has already liked this place
    let isLiked = false;
    
    // Check all possible formats of likes
    for (const like of likes) {
      if (!like) continue;
      
      let likeStr;
      if (typeof like === 'object' && like !== null) {
        likeStr = like.toString();
      } else {
        likeStr = String(like);
      }
      
      if (likeStr === userIdStr) {
        isLiked = true;
        break;
      }
    }
    
    console.log(`${placeType} ${placeId} is ${isLiked ? 'liked' : 'not liked'} by user ${userIdStr}`);
    
    // Update likes array
    let updatedLikes;
    if (isLiked) {
      // Remove the like
      updatedLikes = likes.filter(like => {
        if (!like) return true;
        
        let likeStr;
        if (typeof like === 'object' && like !== null) {
          likeStr = like.toString();
        } else {
          likeStr = String(like);
        }
        
        return likeStr !== userIdStr;
      });
      console.log(`Removed like for user ${userIdStr}`);
    } else {
      // Add the like - using string format for consistency
      updatedLikes = [...likes, userIdStr];
      console.log(`Added like for user ${userIdStr}`);
    }
    
    // Update like count based on array length
    const newLikeCount = updatedLikes.length;
    
    // Update the document atomically
    const result = await Model.collection.updateOne(
      { _id: mongoId },
      { $set: {
          likes: updatedLikes,
          likeCount: newLikeCount
        }
      }
    );
    
    console.log(`${placeType} like update result:`, result);
    
    // Return the response
    return res.json({
      success: true,
      message: !isLiked ? `${placeType} liked successfully` : `${placeType} unliked successfully`,
      isLiked: !isLiked,
      likeCount: newLikeCount
    });
  } catch (error) {
    console.error('Error in toggleLike:', error);
    return res.status(500).json({ message: 'Error toggling like', error: error.message });
  }
};

// Get all likes for a user
exports.getUserLikes = async (req, res) => {
  try {
    const userId = req.user._id;
    const userIdStr = userId.toString();
    
    console.log('getUserLikes - userId:', userIdStr);
    
    // Get all places with just the essential fields for performance
    const destinations = await Destination.collection.find({}).project({ _id: 1, name: 1, likes: 1, likeCount: 1 }).toArray();
    const hotels = await Hotel.collection.find({}).project({ _id: 1, name: 1, likes: 1, likeCount: 1 }).toArray();
    const restaurants = await Restaurant.collection.find({}).project({ _id: 1, name: 1, likes: 1, likeCount: 1 }).toArray();
    
    console.log(`Found ${destinations.length} destinations, ${hotels.length} hotels, ${restaurants.length} restaurants`);
    
    // Common function to check likes for any place type
    function checkUserLikes(places) {
      return places
        .filter(place => {
          if (!place || !place._id) return false;
          
          // Ensure likes is an array
          if (!Array.isArray(place.likes)) return false;
          
          // Check each like, comparing as strings for consistency
          return place.likes.some(like => {
            if (!like) return false;
            
            let likeStr;
            if (typeof like === 'object' && like !== null) {
              likeStr = like.toString();
            } else {
              likeStr = String(like);
            }
            
            return likeStr === userIdStr;
          });
        })
        .map(place => ({
          _id: place._id,
          name: place.name,
          likeCount: place.likeCount || 0
        }));
    }
    
    // Process all place types using the same logic
    const likedDestinations = checkUserLikes(destinations);
    const likedHotels = checkUserLikes(hotels);  
    const likedRestaurants = checkUserLikes(restaurants);

    console.log(`Found ${likedDestinations.length} liked destinations`);
    console.log(`Found ${likedHotels.length} liked hotels`);
    console.log(`Found ${likedRestaurants.length} liked restaurants`);

    res.json({
      success: true,
      likes: {
        destinations: likedDestinations,
        restaurants: likedRestaurants,
        hotels: likedHotels
      }
    });
  } catch (error) {
    console.error('Error in getUserLikes:', error);
    res.status(500).json({ message: 'Error fetching user likes', error: error.message });
  }
};

// Get like state for a specific place
exports.getPlaceLikes = async (req, res) => {
  try {
    const { placeType, placeId } = req.params;
    
    if (!placeType || !placeId) {
      return res.status(400).json({ message: 'Place type and place ID are required' });
    }
    
    // We'll check if the current user has liked this place
    // If no user is logged in, just return false for isLiked
    let userId = null;
    let userIdStr = null;
    
    if (req.user && req.user._id) {
      userId = req.user._id;
      userIdStr = userId.toString();
    }
    
    console.log(`getPlaceLikes - type:${placeType}, placeId:${placeId}, userId:${userIdStr || 'anonymous'}`);
    
    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ message: 'Invalid place ID format' });
    }
    
    const Model = getModelByType(placeType);
    const mongoId = new mongoose.Types.ObjectId(placeId);
    
    // Get the document directly from MongoDB collection for consistency
    const place = await Model.collection.findOne({ _id: mongoId });
    
    if (!place) {
      return res.status(404).json({ message: `${placeType} not found` });
    }
    
    console.log(`Found ${placeType} ${placeId}:`, {
      id: place._id.toString(),
      name: place.name,
      hasLikes: !!place.likes,
      likesType: typeof place.likes,
      isArray: Array.isArray(place.likes)
    });
    
    // Ensure likes is an array
    if (!place.likes || !Array.isArray(place.likes)) {
      // Update the document to ensure consistent structure
      await Model.collection.updateOne(
        { _id: mongoId },
        { $set: { likes: [] } }
      );
      console.log(`Fixed likes array for ${placeType} ${placeId}`);
      place.likes = [];
    }
    
    // Ensure likeCount exists and matches array length
    if (typeof place.likeCount !== 'number') {
      const newLikeCount = place.likes.length;
      await Model.collection.updateOne(
        { _id: mongoId },
        { $set: { likeCount: newLikeCount } }
      );
      place.likeCount = newLikeCount;
      console.log(`Fixed likeCount for ${placeType} ${placeId} to ${newLikeCount}`);
    }
    
    // Not logged in = not liked
    if (!userIdStr) {
      return res.json({
        success: true,
        isLiked: false,
        likeCount: place.likeCount || 0
      });
    }
    
    // Check if user has liked this place
    let isLiked = false;
    
    if (Array.isArray(place.likes) && place.likes.length > 0) {
      // Debug logging
      console.log(`Checking ${place.likes.length} likes for ${placeType} ${placeId}`);
      
      isLiked = place.likes.some(like => {
        if (!like) return false;
        
        // Convert to string for consistent comparison
        let likeStr;
        if (typeof like === 'object' && like !== null) {
          likeStr = like.toString();
        } else {
          likeStr = String(like);
        }
        
        return likeStr === userIdStr;
      });
    }
    
    console.log(`${placeType} ${placeId} like status for user ${userIdStr}: ${isLiked}`);
    
    return res.json({
      success: true,
      isLiked,
      likeCount: place.likeCount || 0
    });
  } catch (error) {
    console.error('Error in getPlaceLikes:', error);
    res.status(500).json({ message: 'Error fetching place likes', error: error.message });
  }
};


// Handles liking/unliking functionality for resources.
// This includes toggling likes, fetching user likes, and checking like status for specific places.
// This controller is designed to work with multiple place types (e.g., destinations, hotels, restaurants).
// It uses Mongoose for MongoDB interactions and includes error handling for various scenarios.
// The code also includes helper functions to get the appropriate model based on the place type.
// The toggleLike function updates the likes array and like count atomically.
// The getUserLikes function retrieves all places liked by the user, while the getPlaceLikes function checks if a specific place is liked by the user.