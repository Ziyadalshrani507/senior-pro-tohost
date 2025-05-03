const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { Restaurant, SAUDI_CITIES, CUISINES, CATEGORIES } = require('../../Models/Restaurant');
const restaurantController = require('../../Controllers/restaurantController');

// Create a consistent user ID for testing authentication
const testUserId = new mongoose.Types.ObjectId();

// Mock the authentication middleware since some endpoints need user auth
const mockAuthMiddleware = (req, res, next) => {
  // Add a mock user object with consistent ID
  req.user = {
    _id: testUserId,
    name: 'Test User',
    email: 'test@example.com'
  };
  next();
};

// Set up a minimal express app for testing
const app = express();
app.use(express.json());

// Routes that don't need authentication
app.get('/api/restaurants/schema-options', restaurantController.getSchemaOptions);
app.get('/api/restaurants/cities', restaurantController.getCities);
app.get('/api/restaurants/:id', restaurantController.getRestaurantById);

// Routes that require authentication - apply mock middleware
app.get('/api/restaurants', mockAuthMiddleware, restaurantController.getRestaurants);
app.post('/api/restaurants', mockAuthMiddleware, restaurantController.createRestaurant);
app.put('/api/restaurants/:id', mockAuthMiddleware, restaurantController.updateRestaurant);
app.delete('/api/restaurants/:id', mockAuthMiddleware, restaurantController.deleteRestaurant);

// Test suite for restaurant controller with in-memory database
describe('Restaurant Controller Integration Tests', () => {
  // Setup and cleanup for each test
  let fancyRestaurant;
  let casualRestaurant;
  let userId;
  
  beforeEach(async () => {
    // Clear the restaurants collection before each test
    await Restaurant.deleteMany({});
    
    // Use the consistent user ID for testing likes
    userId = testUserId;
    
    // Create test restaurants in the in-memory database
    fancyRestaurant = await Restaurant.create({
      name: 'Fancy Fine Dining',
      description: 'An elegant restaurant for testing',
      cuisine: 'French',
      priceRange: '$$$$',
      locationCity: 'Riyadh',
      address: '123 Gourmet Street, Riyadh',
      coordinates: {
        type: 'Point',
        coordinates: [46.675296, 24.713552]  // Riyadh coordinates
      },
      categories: ['Fine Dining', 'Seafood'],
      contact: {
        phone: '+966123456789',
        email: 'info@fancyrestaurant.test',
        website: 'https://fancyfine.test'
      },
      rating: {
        average: 4.8,
        count: 125
      },
      likes: [userId],
      likeCount: 1
    });
    
    casualRestaurant = await Restaurant.create({
      name: 'Casual Cafe',
      description: 'A casual dining experience',
      cuisine: 'Italian',
      priceRange: '$$',
      locationCity: 'Jeddah',
      address: '456 Casual Street, Jeddah',
      coordinates: {
        type: 'Point',
        coordinates: [39.173526, 21.485811]  // Jeddah coordinates
      },
      categories: ['Cafe', 'Casual Dining'],
      contact: {
        phone: '+966987654321',
        email: 'info@casualcafe.test'
      },
      rating: {
        average: 4.2,
        count: 80
      }
    });
  });
  
  afterEach(async () => {
    // Clean up all data after tests
    await Restaurant.deleteMany({});
  });
  
  describe('GET /api/restaurants', () => {
    test('Should return all restaurants with isLiked field', async () => {
      // Make the request with authentication
      const response = await request(app)
        .get('/api/restaurants');
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('restaurants');
      expect(Array.isArray(response.body.restaurants)).toBeTruthy();
      expect(response.body.restaurants.length).toBe(2);
      
      // Check that restaurants have correct data
      const restaurantNames = response.body.restaurants.map(r => r.name);
      expect(restaurantNames).toContain('Fancy Fine Dining');
      expect(restaurantNames).toContain('Casual Cafe');
      
      // Verify isLiked field is set correctly
      const fancyRestaurantInResponse = response.body.restaurants.find(r => r.name === 'Fancy Fine Dining');
      expect(fancyRestaurantInResponse.isLiked).toBe(true);
      
      const casualRestaurantInResponse = response.body.restaurants.find(r => r.name === 'Casual Cafe');
      expect(casualRestaurantInResponse.isLiked).toBe(false);
      
      // Verify likes array is not sent to client
      expect(fancyRestaurantInResponse.likes).toBeUndefined();
    });
  });
  
  describe('GET /api/restaurants/schema-options', () => {
    test('Should return schema options with enum values', async () => {
      // Make the request
      const response = await request(app)
        .get('/api/restaurants/schema-options');
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(response.body).toHaveProperty('cuisines');
      expect(response.body).toHaveProperty('categories');
      expect(response.body).toHaveProperty('priceRanges');
      
      // Check specific enum values
      expect(response.body.cities).toEqual(SAUDI_CITIES);
      expect(response.body.cuisines).toEqual(CUISINES);
      expect(response.body.categories).toEqual(CATEGORIES);
      expect(response.body.priceRanges).toEqual(['$', '$$', '$$$', '$$$$']);
    });
  });
  
  describe('GET /api/restaurants/cities', () => {
    test('Should return all available cities', async () => {
      // Make the request
      const response = await request(app)
        .get('/api/restaurants/cities');
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(Array.isArray(response.body.cities)).toBeTruthy();
      expect(response.body.cities).toEqual(SAUDI_CITIES);
    });
  });
  
  describe('GET /api/restaurants/:id', () => {
    test('Should return a single restaurant by ID with related restaurants', async () => {
      // Make the request
      const response = await request(app)
        .get(`/api/restaurants/${fancyRestaurant._id}`);
        
      // Assertions
      expect(response.status).toBe(200);
      
      // Check restaurant data
      expect(response.body).toHaveProperty('name', 'Fancy Fine Dining');
      expect(response.body).toHaveProperty('cuisine', 'French');
      expect(response.body).toHaveProperty('locationCity', 'Riyadh');
      expect(response.body).toHaveProperty('rating.average', 4.8);
      
      // Check for related restaurants
      expect(response.body).toHaveProperty('relatedRestaurants');
      expect(Array.isArray(response.body.relatedRestaurants)).toBeTruthy();
    });
    
    test('Should return 404 when restaurant is not found', async () => {
      // Generate a random ID that doesn't exist
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Make the request
      const response = await request(app)
        .get(`/api/restaurants/${nonExistentId}`);
        
      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Restaurant not found');
    });
  });
  
  describe('POST /api/restaurants', () => {
    test('Should create a new restaurant with valid data', async () => {
      const newRestaurantData = {
        name: 'New Test Restaurant',
        description: 'A newly created test restaurant',
        cuisine: 'Lebanese',
        priceRange: '$$$',
        locationCity: 'Mecca',
        address: '789 Test Street, Mecca',
        coordinates: {
          type: 'Point',
          coordinates: [39.826168, 21.422510]  // Mecca coordinates
        },
        categories: ['Fine Dining', 'Halal'],
        contact: {
          phone: '+966555555555',
          email: 'info@newrestaurant.test',
          website: 'https://newrestaurant.test'
        }
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/restaurants')
        .send(newRestaurantData);
        
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('New Test Restaurant');
      expect(response.body.cuisine).toBe('Lebanese');
      expect(response.body.locationCity).toBe('Mecca');
      
      // Verify it was actually saved to the database
      const savedRestaurant = await Restaurant.findById(response.body._id);
      expect(savedRestaurant).toBeTruthy();
      expect(savedRestaurant.name).toBe('New Test Restaurant');
    });
    
    test('Should return 400 when creating restaurant with missing required fields', async () => {
      const invalidRestaurantData = {
        // Missing required fields
        description: 'Missing required fields',
        priceRange: '$$'
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/restaurants')
        .send(invalidRestaurantData);
        
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields');
      expect(response.body).toHaveProperty('missingFields');
    });
  });
  
  describe('PUT /api/restaurants/:id', () => {
    test('Should update an existing restaurant', async () => {
      // Get the existing data first to ensure we have all required fields
      const existingRestaurant = await Restaurant.findById(casualRestaurant._id);
      
      const updateData = {
        name: existingRestaurant.name, // Keep the original name
        description: 'Updated description for testing',
        cuisine: existingRestaurant.cuisine, // Include original cuisine
        priceRange: '$$$', // This is being updated
        locationCity: existingRestaurant.locationCity, // Include original city
        address: existingRestaurant.address, // Include original address
        categories: ['Cafe', 'Vegetarian'], // This is being updated
        contact: {
          phone: existingRestaurant.contact.phone, // Include original phone
          email: existingRestaurant.contact.email || 'info@casualcafe.test'
        },
        // Include coordinates to avoid validation errors
        coordinates: {
          type: 'Point',
          coordinates: existingRestaurant.coordinates.coordinates
        }
      };
      
      // Make the request
      const response = await request(app)
        .put(`/api/restaurants/${casualRestaurant._id}`)
        .send(updateData);
      
      // Debug - log the response body to see what's wrong
      console.log('Update restaurant response:', response.status, JSON.stringify(response.body, null, 2));
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description for testing');
      expect(response.body.priceRange).toBe('$$$');
      expect(response.body.categories).toContain('Vegetarian');
      expect(response.body.categories).toContain('Organic');
      
      // Verify the restaurant was actually updated in the database
      const updatedRestaurant = await Restaurant.findById(casualRestaurant._id);
      expect(updatedRestaurant.description).toBe('Updated description for testing');
      expect(updatedRestaurant.priceRange).toBe('$$$');
    });
    
    test('Should return 404 when updating non-existent restaurant', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Make the request with complete valid data to avoid validation errors
      const response = await request(app)
        .put(`/api/restaurants/${nonExistentId}`)
        .send({
          name: 'Non-Existent Restaurant',
          description: 'This restaurant does not exist',
          cuisine: 'Italian', // Must be a valid cuisine from enum
          priceRange: '$$',
          locationCity: 'Riyadh', // Must be a valid city from enum
          address: '123 Nowhere Street, Riyadh',
          coordinates: {
            type: 'Point',
            coordinates: [46.675296, 24.713552] // Valid coordinates to pass validation
          },
          contact: {
            phone: '+966123456789',
            email: 'test@example.com', // Valid email to pass validation
            website: 'https://example.com' // Valid URL to pass validation
          },
          categories: ['Fine Dining'] // Valid category from enum
        });
        
      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Restaurant not found');
    });
  });
  
  describe('DELETE /api/restaurants/:id', () => {
    test('Should delete an existing restaurant', async () => {
      // Make the request
      const response = await request(app)
        .delete(`/api/restaurants/${fancyRestaurant._id}`);
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Restaurant deleted successfully');
      
      // Verify the restaurant was actually deleted from the database
      const deletedRestaurant = await Restaurant.findById(fancyRestaurant._id);
      expect(deletedRestaurant).toBeNull();
    });
    
    test('Should return 404 when deleting non-existent restaurant', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Make the request
      const response = await request(app)
        .delete(`/api/restaurants/${nonExistentId}`);
        
      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Restaurant not found');
    });
  });
});
