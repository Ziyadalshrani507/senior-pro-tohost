const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { Restaurant } = require('../../Models/Restaurant');
const User = require('../../Models/User');
const restaurantController = require('../../Controllers/restaurantController');

// Create test user IDs
const testUserId = new mongoose.Types.ObjectId();
const secondUserId = new mongoose.Types.ObjectId();

// Mock auth middleware with configurable user
const createMockAuthMiddleware = (userId = testUserId) => (req, res, next) => {
  req.user = {
    _id: userId,
    name: 'Test User',
    email: 'test@example.com'
  };
  next();
};

// Set up express app for testing
const app = express();
app.use(express.json());

// Set up routes
app.get('/api/restaurants', createMockAuthMiddleware(), restaurantController.getRestaurants);

// Test suite for user interactions with restaurants
describe('User Restaurant Interaction Tests', () => {
  let restaurant1, restaurant2;
  
  beforeEach(async () => {
    // Clear the collections before each test
    await Restaurant.deleteMany({});
    
    // Create test restaurants
    restaurant1 = await Restaurant.create({
      name: 'Popular Restaurant',
      description: 'A restaurant with many likes',
      cuisine: 'Italian',
      priceRange: '$$',
      locationCity: 'Riyadh',
      address: '123 Popular Street, Riyadh',
      coordinates: {
        type: 'Point',
        coordinates: [46.675296, 24.713552]
      },
      categories: ['Casual Dining'],
      contact: {
        phone: '+966123456789',
        email: 'popular@example.com',
        website: 'https://popular-restaurant.test'
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
      likes: [secondUserId], // Pre-liked by second user
      likeCount: 1
    });
    
    restaurant2 = await Restaurant.create({
      name: 'New Restaurant',
      description: 'A new restaurant with no likes',
      cuisine: 'Mexican',
      priceRange: '$$',
      locationCity: 'Jeddah',
      address: '456 New Street, Jeddah',
      coordinates: {
        type: 'Point',
        coordinates: [39.173526, 21.485811]
      },
      categories: ['Casual Dining'],
      contact: {
        phone: '+966987654321',
        email: 'new@example.com',
        website: 'https://new-restaurant.test'
      },
      openingHours: {
        open: {
          hour: 11,
          minute: 30,
          period: 'AM'
        },
        close: {
          hour: 11,
          minute: 0,
          period: 'PM'
        }
      },
      likes: [],
      likeCount: 0
    });
  });
  
  afterEach(async () => {
    await Restaurant.deleteMany({});
  });
  
  describe('Restaurant Likes Handling', () => {
    test('Should mark restaurants as liked for current user', async () => {
      // Get restaurants as the test user (not second user)
      const response = await request(app)
        .get('/api/restaurants');
      
      expect(response.status).toBe(200);
      expect(response.body.restaurants).toHaveLength(2);
      
      // First restaurant should be marked as not liked by current user (but liked by second user)
      const popularRestaurant = response.body.restaurants.find(r => r.name === 'Popular Restaurant');
      expect(popularRestaurant.isLiked).toBe(false);
      
      // Second restaurant should also be not liked
      const newRestaurant = response.body.restaurants.find(r => r.name === 'New Restaurant');
      expect(newRestaurant.isLiked).toBe(false);
    });
    
    test('Should correctly identify liked restaurants when viewing as second user', async () => {
      // Create app with middleware using secondUserId
      const secondUserApp = express();
      secondUserApp.use(express.json());
      secondUserApp.get('/api/restaurants', createMockAuthMiddleware(secondUserId), restaurantController.getRestaurants);
      
      // Get restaurants as the second user
      const response = await request(secondUserApp)
        .get('/api/restaurants');
      
      expect(response.status).toBe(200);
      
      // First restaurant should be marked as liked for second user
      const popularRestaurant = response.body.restaurants.find(r => r.name === 'Popular Restaurant');
      expect(popularRestaurant.isLiked).toBe(true);
      
      // Second restaurant should not be liked
      const newRestaurant = response.body.restaurants.find(r => r.name === 'New Restaurant');
      expect(newRestaurant.isLiked).toBe(false);
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    test('Should handle requests with no authentication gracefully', async () => {
      // Set up app without auth middleware
      const noAuthApp = express();
      noAuthApp.use(express.json());
      noAuthApp.get('/api/restaurants', restaurantController.getRestaurants);
      
      // Make request without authentication
      const response = await request(noAuthApp)
        .get('/api/restaurants');
      
      // Should still return restaurants, just without isLiked field
      expect(response.status).toBe(200);
      expect(response.body.restaurants).toBeDefined();
      expect(response.body.restaurants.length).toBeGreaterThan(0);
    });
    
    test('Should handle empty database gracefully', async () => {
      // Delete all restaurants
      await Restaurant.deleteMany({});
      
      // Make request
      const response = await request(app)
        .get('/api/restaurants');
      
      // Should return empty array, not error
      expect(response.status).toBe(200);
      expect(response.body.restaurants).toHaveLength(0);
    });
    
    test('Should handle invalid page parameters', async () => {
      // Request with negative page number
      const response = await request(app)
        .get('/api/restaurants')
        .query({ page: '-1' });
      
      // Should default to reasonable values and not error
      expect(response.status).toBe(200);
      expect(response.body.restaurants).toBeDefined();
    });
  });
});
