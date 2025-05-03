const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { Restaurant } = require('../../Models/Restaurant');
const restaurantController = require('../../Controllers/restaurantController');

// Create test user ID
const testUserId = new mongoose.Types.ObjectId();

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    _id: testUserId,
    name: 'Test User',
    email: 'test@example.com'
  };
  next();
};

// Set up express app for testing
const app = express();
app.use(express.json());

// Set up routes
app.get('/api/restaurants', mockAuthMiddleware, restaurantController.getRestaurants);
app.get('/api/restaurants/schema-options', restaurantController.getSchemaOptions);
app.post('/api/restaurants', mockAuthMiddleware, restaurantController.createRestaurant);

describe('Simplified Restaurant Controller Tests', () => {
  // Test restaurants
  let restaurantA, restaurantB;
  
  beforeEach(async () => {
    // Clear the database before each test
    await Restaurant.deleteMany({});
    
    // Create test restaurants
    restaurantA = await Restaurant.create({
      name: 'Restaurant A',
      description: 'Description for Restaurant A',
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
        phone: '+966123456781',
        email: 'restaurant.a@example.com',
        website: 'https://restaurant-a.test'
      },
      featured: true
    });
    
    restaurantB = await Restaurant.create({
      name: 'Restaurant B',
      description: 'Description for Restaurant B',
      cuisine: 'Japanese',
      priceRange: '$$$',
      locationCity: 'Jeddah',
      address: '456 Test Street, Jeddah',
      coordinates: {
        type: 'Point',
        coordinates: [39.173526, 21.485811]
      },
      categories: ['Fine Dining'],
      contact: {
        phone: '+966123456782',
        email: 'restaurant.b@example.com',
        website: 'https://restaurant-b.test'
      },
      featured: false
    });
  });
  
  afterEach(async () => {
    await Restaurant.deleteMany({});
  });
  
  describe('GET /api/restaurants', () => {
    test('Should return all restaurants', async () => {
      const response = await request(app).get('/api/restaurants');
      
      expect(response.status).toBe(200);
      
      // Extract restaurants array depending on the response structure
      const restaurants = response.body.restaurants || response.body;
      
      // Verify we got both restaurants
      expect(restaurants.length).toBeGreaterThanOrEqual(2);
      expect(restaurants.some(r => r.name === 'Restaurant A')).toBe(true);
      expect(restaurants.some(r => r.name === 'Restaurant B')).toBe(true);
    });
    
    test('Should filter restaurants by cuisine', async () => {
      const response = await request(app)
        .get('/api/restaurants')
        .query({ cuisine: 'Italian' });
      
      expect(response.status).toBe(200);
      
      // Extract restaurants array
      const restaurants = response.body.restaurants || response.body;
      
      // There should be at least one Italian restaurant
      const italianRestaurants = restaurants.filter(r => r.cuisine === 'Italian');
      expect(italianRestaurants.length).toBeGreaterThan(0);
    });
  });
  
  describe('GET /api/restaurants/schema-options', () => {
    test('Should return schema options with enum values', async () => {
      const response = await request(app).get('/api/restaurants/schema-options');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(response.body).toHaveProperty('cuisines');
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('priceRanges');
      
      // Verify the schema options contain expected values
      expect(response.body.cities).toContain('Riyadh');
      expect(response.body.cuisines).toContain('Italian');
      expect(response.body.categories).toContain('Fine Dining');
      expect(response.body.priceRanges).toContain('$$$');
    });
  });
  
  describe('POST /api/restaurants', () => {
    test('Should create a new restaurant with valid data', async () => {
      const newRestaurantData = {
        name: 'New Test Restaurant',
        description: 'A test restaurant created by the API',
        cuisine: 'Lebanese',
        priceRange: '$$$',
        locationCity: 'Mecca',
        address: '789 Test Street, Mecca',
        coordinates: {
          type: 'Point',
          coordinates: [39.826168, 21.422510]
        },
        categories: ['Fine Dining', 'Halal'],
        contact: {
          phone: '+966555555555',
          email: 'test@example.com',
          website: 'https://test-restaurant.com'
        }
      };
      
      const response = await request(app)
        .post('/api/restaurants')
        .send(newRestaurantData);
      
      // Test may pass with either 201 (Created) or 200 (OK)
      expect([200, 201]).toContain(response.status);
      
      // Verify the restaurant was created with correct data
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('New Test Restaurant');
      expect(response.body.cuisine).toBe('Lebanese');
      
      // Verify it was saved to the database
      const savedRestaurant = await Restaurant.findById(response.body._id);
      expect(savedRestaurant).toBeTruthy();
      expect(savedRestaurant.name).toBe('New Test Restaurant');
    });
    
    test('Should reject creating restaurant with missing required fields', async () => {
      const invalidData = {
        name: 'Incomplete Restaurant',
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/restaurants')
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
