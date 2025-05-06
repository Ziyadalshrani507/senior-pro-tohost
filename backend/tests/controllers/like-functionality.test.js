const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { Restaurant } = require('../../Models/Restaurant');
const Destination = require('../../Models/Destination');
const Hotel = require('../../Models/Hotel');
const User = require('../../Models/User');
const likeController = require('../../Controllers/likeController');
const { protect } = require('../../middleware/authMiddleware');

// Create consistent user IDs for testing
const testUserId = new mongoose.Types.ObjectId();
const secondUserId = new mongoose.Types.ObjectId();
const adminUserId = new mongoose.Types.ObjectId();

// Mock the authentication middleware
const mockProtect = (req, res, next) => {
  // Add test user to the request
  req.user = {
    _id: testUserId,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  };
  next();
};

// Admin auth middleware
const mockAdminProtect = (req, res, next) => {
  req.user = {
    _id: adminUserId,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };
  next();
};

// Second user auth middleware
const mockSecondUserProtect = (req, res, next) => {
  req.user = {
    _id: secondUserId,
    name: 'Second User',
    email: 'second@example.com',
    role: 'user'
  };
  next();
};

// Set up a minimal express app for testing
const app = express();
app.use(express.json());

// Set up routes with auth middleware
app.post('/api/likes/:placeType/:placeId', mockProtect, likeController.toggleLike);
app.get('/api/likes/user', mockProtect, likeController.getUserLikes);
app.get('/api/likes/:placeType/:placeId', mockProtect, likeController.getPlaceLikes);

// Admin routes
const adminApp = express();
adminApp.use(express.json());
adminApp.get('/api/likes/:placeType/:placeId', mockAdminProtect, likeController.getPlaceLikes);

// Second user routes
const secondUserApp = express();
secondUserApp.use(express.json());
secondUserApp.post('/api/likes/:placeType/:placeId', mockSecondUserProtect, likeController.toggleLike);
secondUserApp.get('/api/likes/:placeType/:placeId', mockSecondUserProtect, likeController.getPlaceLikes);

// Test suite for like functionality
describe('Like Functionality Tests', () => {
  // Test data
  let restaurant, destination, hotel;
  
  beforeEach(async () => {
    // Clear all collections
    await Restaurant.deleteMany({});
    await Destination.deleteMany({});
    await Hotel.deleteMany({});
    
    // Create test restaurant (with openingHours to satisfy validation)
    restaurant = await Restaurant.create({
      name: 'Test Restaurant',
      description: 'A test restaurant',
      cuisine: 'Italian',
      priceRange: '$$',
      locationCity: 'Riyadh',
      address: '123 Test Street, Riyadh',
      coordinates: {
        type: 'Point',
        coordinates: [46.675296, 24.713552]
      },
      categories: ['Casual Dining'],
      contact: {
        phone: '+966123456789',
        email: 'test@restaurant.com',
        website: 'https://test-restaurant.com'
      },
      openingHours: {
        open: {
          hour: 9,
          minute: 0,
          period: 'AM'
        },
        close: {
          hour: 10,
          minute: 0,
          period: 'PM'
        }
      },
      likes: [], // Initially no likes
      likeCount: 0
    });
    
    // Create test destination
    destination = await Destination.create({
      name: 'Test Destination',
      description: 'A test destination',
      locationCity: 'Jeddah',
      type: 'Cultural', // Using valid enum value from the schema
      cost: 100,
      coordinates: {
        type: 'Point',
        coordinates: [39.173526, 21.485811]
      },
      categories: ['Outdoor'], // Using valid enum value from the schema
      pictureUrls: ['https://example.com/test.jpg'],
      likes: [secondUserId], // Already liked by second user
      likeCount: 1
    });
    
    // Create test hotel
    hotel = await Hotel.create({
      name: 'Test Hotel',
      description: 'A test hotel',
      locationCity: 'Mecca',
      address: '456 Test Avenue, Mecca',
      hotelClass: 4,
      priceRange: '$$$',
      coordinates: {
        type: 'Point',
        coordinates: [39.826168, 21.422510]
      },
      amenities: ['Wi-Fi', 'Pool'],
      roomTypes: [{
        name: 'Standard',
        capacity: 2,
        pricePerNight: 500,
        available: 10
      }],
      contact: {
        phone: '+966987654321',
        email: 'test@hotel.com',
        website: 'https://test-hotel.com'
      },
      likes: [], // Initially no likes
      likeCount: 0
    });
  });
  
  afterEach(async () => {
    // Clean up
    await Restaurant.deleteMany({});
    await Destination.deleteMany({});
    await Hotel.deleteMany({});
  });
  
  describe('Toggle Like Tests', () => {
    test('Should like a restaurant when not previously liked', async () => {
      const response = await request(app)
        .post(`/api/likes/restaurant/${restaurant._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isLiked).toBe(true);
      expect(response.body.likeCount).toBe(1);
      expect(response.body.message).toBe('restaurant liked successfully');
      
      // Verify in database
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      
      // The likes might be stored as strings in the array
      const likesAsStrings = updatedRestaurant.likes.map(like => like.toString());
      expect(likesAsStrings).toContain(testUserId.toString());
      expect(updatedRestaurant.likeCount).toBe(1);
    });
    
    test('Should unlike a destination when previously liked', async () => {
      // The destination is already liked by secondUser, so we'll have them unlike it
      const response = await request(secondUserApp)
        .post(`/api/likes/destination/${destination._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isLiked).toBe(false);
      expect(response.body.likeCount).toBe(0);
      expect(response.body.message).toBe('destination unliked successfully');
      
      // Verify in database
      const updatedDestination = await Destination.findById(destination._id);
      expect(updatedDestination.likes).not.toContainEqual(secondUserId.toString());
      expect(updatedDestination.likeCount).toBe(0);
    });
    
    test('Should like a hotel when not previously liked', async () => {
      const response = await request(app)
        .post(`/api/likes/hotel/${hotel._id}`);
      
      // Check the API response
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isLiked).toBe(true);
      expect(response.body.likeCount).toBe(1);
      
      // Instead of checking the database directly, we can verify through the controller
      // This avoids issues with different model implementations
      const statusResponse = await request(app)
        .get(`/api/likes/hotel/${hotel._id}`);
      
      // Verify the like status matches what we expect
      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.isLiked).toBe(true);
      expect(statusResponse.body.likeCount).toBe(1);
    });
    
    test('Should handle duplicate likes gracefully', async () => {
      // Like the restaurant first
      await request(app).post(`/api/likes/restaurant/${restaurant._id}`);
      
      // Try to like it again
      const response = await request(app)
        .post(`/api/likes/restaurant/${restaurant._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isLiked).toBe(false); // Now unliked
      expect(response.body.likeCount).toBe(0);
      
      // Verify the restaurant was unliked
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(updatedRestaurant.likes).not.toContainEqual(testUserId.toString());
      expect(updatedRestaurant.likeCount).toBe(0);
    });
    
    test('Should handle non-existent place ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/api/likes/restaurant/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('restaurant not found');
    });
    
    test('Should handle invalid place type', async () => {
      const response = await request(app)
        .post(`/api/likes/invalidType/${restaurant._id}`);
      
      expect(response.status).toBe(500); // Error is caught in the try/catch
      expect(response.body.message).toBe('Error toggling like');
    });
  });
  
  describe('Get User Likes Tests', () => {
    test('Should get all likes for the current user', async () => {
      // Have the user like a restaurant and hotel
      await request(app).post(`/api/likes/restaurant/${restaurant._id}`);
      await request(app).post(`/api/likes/hotel/${hotel._id}`);
      
      // Destination already liked by second user
      
      // Get user likes
      const response = await request(app)
        .get('/api/likes/user');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.likes).toBeDefined();
      
      // Should have liked the restaurant and hotel but not the destination
      expect(response.body.likes.restaurants).toHaveLength(1);
      expect(response.body.likes.hotels).toHaveLength(1);
      expect(response.body.likes.destinations).toHaveLength(0);
      
      // Verify restaurant ID matches
      expect(response.body.likes.restaurants[0]._id.toString()).toBe(restaurant._id.toString());
    });
    
    test('Should handle user with no likes', async () => {
      // User hasn't liked anything yet
      const response = await request(app)
        .get('/api/likes/user');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.likes).toBeDefined();
      
      // All categories should be empty
      expect(response.body.likes.restaurants).toHaveLength(0);
      expect(response.body.likes.hotels).toHaveLength(0);
      expect(response.body.likes.destinations).toHaveLength(0);
    });
  });
  
  describe('Get Place Likes Tests', () => {
    test('Should get like status for a place when user is logged in', async () => {
      // Like the restaurant first
      await request(app).post(`/api/likes/restaurant/${restaurant._id}`);
      
      // Get like status
      const response = await request(app)
        .get(`/api/likes/restaurant/${restaurant._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isLiked).toBe(true);
      expect(response.body.likeCount).toBe(1);
    });
    
    test('Should get like status for destination already liked by another user', async () => {
      // Destination is already liked by second user
      
      // Check like status for main test user (should be false)
      const response = await request(app)
        .get(`/api/likes/destination/${destination._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isLiked).toBe(false);
      expect(response.body.likeCount).toBe(1);
      
      // Check like status for second user (should be true)
      const secondUserResponse = await request(secondUserApp)
        .get(`/api/likes/destination/${destination._id}`);
      
      expect(secondUserResponse.status).toBe(200);
      expect(secondUserResponse.body.success).toBe(true);
      expect(secondUserResponse.body.isLiked).toBe(true);
      expect(secondUserResponse.body.likeCount).toBe(1);
    });
    
    test('Should handle non-existent place ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/likes/restaurant/${nonExistentId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('restaurant not found');
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    test('Should handle invalid place ID format', async () => {
      const response = await request(app)
        .post('/api/likes/restaurant/invalid-id');
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid place ID format');
    });
    
    test('Should handle missing place type or ID', async () => {
      // Missing ID
      const responseNoId = await request(app)
        .post('/api/likes/restaurant/');
      
      expect(responseNoId.status).toBe(404); // Express returns 404 for unmatched routes
      
      // Missing type (will hit a different route)
      const responseNoType = await request(app)
        .post(`/api/likes/${restaurant._id}`);
      
      expect(responseNoType.status).toBe(404); // Express returns 404 for unmatched routes
    });
    
    test('Should handle invalid place type', async () => {
      const response = await request(app)
        .post(`/api/likes/invalidType/${restaurant._id}`);
      
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error toggling like');
      expect(response.body.error).toBe('Invalid place type: invalidType');
    });
    
    test('Should fix inconsistent likes data structures', async () => {
      // Manually set restaurant likes to null to test repair functionality
      await Restaurant.findByIdAndUpdate(restaurant._id, { likes: null, likeCount: null });
      
      // Check like status, which should repair the data structure
      const response = await request(app)
        .get(`/api/likes/restaurant/${restaurant._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.isLiked).toBe(false);
      expect(response.body.likeCount).toBe(0);
      
      // Verify in database that it was fixed
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(Array.isArray(updatedRestaurant.likes)).toBe(true);
      expect(updatedRestaurant.likeCount).toBe(0);
    });
  });
});
