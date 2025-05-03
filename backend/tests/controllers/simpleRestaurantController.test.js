const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { Restaurant } = require('../../Models/Restaurant');

// Set up a minimal express app for testing
const app = express();
app.use(express.json());

// Import the controller
const restaurantController = require('../../Controllers/restaurantController');

// Set up routes
app.put('/api/restaurants/:id', restaurantController.updateRestaurant);
app.post('/api/restaurants', restaurantController.createRestaurant);

// Test suite for restaurant controller update functionality
describe('Restaurant Controller Update Tests', () => {
  let testRestaurant;
  
  beforeEach(async () => {
    // Clear the restaurants collection before each test
    await Restaurant.deleteMany({});
    
    // Create a test restaurant with all required fields
    testRestaurant = await Restaurant.create({
      name: 'Test Restaurant',
      description: 'A test restaurant for integration testing',
      cuisine: 'Italian',
      priceRange: '$$',
      locationCity: 'Riyadh',
      address: '123 Test Street, Riyadh',
      coordinates: {
        type: 'Point', // Must specify the GeoJSON type
        coordinates: [46.675296, 24.713552]  // Riyadh coordinates
      },
      contact: {
        phone: '+966123456789',
        email: 'test@example.com',
        website: 'https://test-restaurant.com'
      },
      categories: ['Casual Dining', 'Family Style']
    });
  });
  
  afterEach(async () => {
    await Restaurant.deleteMany({});
  });

  test('Should update restaurant when all required fields are provided', async () => {
    // Full replacement data with all required fields
    const updateData = {
      name: 'Updated Restaurant Name',
      description: 'Updated description',
      cuisine: 'Italian', // Keep valid cuisine from enum
      priceRange: '$$$', // Update price range
      locationCity: 'Riyadh', // Keep valid city from enum
      address: '123 Updated Street, Riyadh',
      coordinates: {
        type: 'Point', // Must specify the GeoJSON type
        coordinates: [46.675296, 24.713552]  // Keep valid coordinates
      },
      contact: {
        phone: '+966123456789', // Required
        email: 'updated@example.com',
        website: 'https://updated-restaurant.com'
      },
      categories: ['Fine Dining', 'Seafood']
    };
    
    // Make the request
    const response = await request(app)
      .put(`/api/restaurants/${testRestaurant._id}`)
      .send(updateData);
    
    // Log the response for debugging
    console.log('Update response:', {
      status: response.status,
      body: response.body
    });
    
    // Assertions
    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Updated Restaurant Name');
    expect(response.body.description).toBe('Updated description');
    expect(response.body.priceRange).toBe('$$$');
    
    // Verify the database was updated
    const updatedRestaurant = await Restaurant.findById(testRestaurant._id);
    expect(updatedRestaurant.name).toBe('Updated Restaurant Name');
  });

  test('Should return 404 for non-existent restaurant ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    
    // Full valid data but non-existent ID
    const updateData = {
      name: 'Non-Existent Restaurant',
      description: 'This restaurant does not exist',
      cuisine: 'Italian',
      priceRange: '$$',
      locationCity: 'Riyadh',
      address: '999 Missing Street, Riyadh',
      coordinates: {
        type: 'Point', // Must specify the GeoJSON type
        coordinates: [46.675296, 24.713552]
      },
      contact: {
        phone: '+966123456789',
        email: 'missing@example.com',
        website: 'https://non-existent.com'
      },
      categories: ['Fine Dining']
    };
    
    // Make the request
    const response = await request(app)
      .put(`/api/restaurants/${nonExistentId}`)
      .send(updateData);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Restaurant not found');
  });
});
