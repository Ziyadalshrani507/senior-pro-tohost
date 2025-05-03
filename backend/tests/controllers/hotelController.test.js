const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Hotel = require('../../Models/Hotel');
const hotelController = require('../../Controllers/hotelController');

// Set up a minimal express app for testing
const app = express();
app.use(express.json());
app.get('/api/hotels', hotelController.getHotels);
app.get('/api/hotels/schema-options', hotelController.getSchemaOptions);
app.get('/api/hotels/:id', hotelController.getHotelById);
app.post('/api/hotels', hotelController.createHotel);
app.put('/api/hotels/:id', hotelController.updateHotel);
app.delete('/api/hotels/:id', hotelController.deleteHotel);

// Test suite for hotel controller with in-memory database
describe('Hotel Controller Integration Tests', () => {
  // Setup and cleanup for each test
  let luxuryHotel;
  let budgetHotel;
  
  beforeEach(async () => {
    // Clear the hotels collection before each test
    await Hotel.deleteMany({});
    
    // Create test hotels in the in-memory database
    luxuryHotel = await Hotel.create({
      name: 'Luxury Palace Hotel',
      description: 'A 5-star luxury hotel for testing',
      locationCity: 'Riyadh',
      address: '123 King Fahd Road, Riyadh',
      hotelClass: '5',
      priceRange: '$$$$',
      amenities: ['Wi-Fi', 'Swimming Pool', 'Spa', 'Restaurant'],
      featured: true,
      coordinates: {
        coordinates: [46.675296, 24.713552]  // Riyadh coordinates
      },
      contact: {
        phone: '+966123456789',
        email: 'info@luxurypalace.test',
        website: 'https://luxurypalace.test'
      }
    });
    
    budgetHotel = await Hotel.create({
      name: 'Budget Stay Inn',
      description: 'An affordable hotel option',
      locationCity: 'Jeddah',
      address: '456 Corniche Road, Jeddah',
      hotelClass: '3',
      priceRange: '$$',
      amenities: ['Wi-Fi', 'Parking'],
      coordinates: {
        coordinates: [39.173526, 21.485811]  // Jeddah coordinates
      },
      contact: {
        phone: '+966987654321',
        email: 'info@budgetstay.test'
      }
    });
  });
  
  afterEach(async () => {
    // Clean up all data after tests
    await Hotel.deleteMany({});
  });
  
  describe('GET /api/hotels', () => {
    test('Should return all hotels', async () => {
      // Make the request
      const response = await request(app)
        .get('/api/hotels');
        
      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
      
      // Check that we have both hotels in the response
      const names = response.body.map(h => h.name);
      expect(names).toContain('Luxury Palace Hotel');
      expect(names).toContain('Budget Stay Inn');
    });
    
    test('Should filter hotels by featured flag', async () => {
      // Make the request with featured filter
      const response = await request(app)
        .get('/api/hotels')
        .query({ featured: 'true' });
        
      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Luxury Palace Hotel');
      expect(response.body[0].featured).toBe(true);
    });
    
    test('Should filter hotels by city', async () => {
      // Make the request with city filter
      const response = await request(app)
        .get('/api/hotels')
        .query({ city: 'Jeddah' });
        
      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Budget Stay Inn');
      expect(response.body[0].locationCity).toBe('Jeddah');
    });
    
    test('Should filter hotels by price range', async () => {
      // Make the request with price range filter
      const response = await request(app)
        .get('/api/hotels')
        .query({ priceRange: '$$$$' });
        
      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Luxury Palace Hotel');
      expect(response.body[0].priceRange).toBe('$$$$');
    });
    
    test('Should sort hotels by rating', async () => {
      // First, update hotels with different ratings
      await Hotel.findByIdAndUpdate(luxuryHotel._id, { 
        'rating.average': 4.8,
        'rating.count': 120 
      });
      
      await Hotel.findByIdAndUpdate(budgetHotel._id, { 
        'rating.average': 3.5,
        'rating.count': 80 
      });
      
      // Make the request with sort by rating
      const response = await request(app)
        .get('/api/hotels')
        .query({ sort: 'rating' });
        
      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
      
      // First hotel should be the one with higher rating
      expect(response.body[0].name).toBe('Luxury Palace Hotel');
      expect(response.body[0].rating.average).toBe(4.8);
      
      // Second hotel should have lower rating
      expect(response.body[1].name).toBe('Budget Stay Inn');
      expect(response.body[1].rating.average).toBe(3.5);
    });
    
    test('Should limit the number of results', async () => {
      // Make the request with limit
      const response = await request(app)
        .get('/api/hotels')
        .query({ limit: '1' });
        
      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
    });
  });
  
  describe('GET /api/hotels/:id', () => {
    test('Should return a single hotel by ID', async () => {
      // Make the request using the ID of our luxury hotel
      const response = await request(app)
        .get(`/api/hotels/${luxuryHotel._id}`);
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toBe(luxuryHotel._id.toString());
      expect(response.body.name).toBe('Luxury Palace Hotel');
      expect(response.body.locationCity).toBe('Riyadh');
      expect(response.body.hotelClass).toBe('5');
    });
    
    test('Should return 404 when hotel is not found', async () => {
      // Generate a random ID that doesn't exist
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Make the request
      const response = await request(app)
        .get(`/api/hotels/${nonExistentId}`);
        
      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hotel not found');
    });
  });
  
  describe('GET /api/hotels/schema-options', () => {
    test('Should return schema options with enum values', async () => {
      // Make the request
      const response = await request(app)
        .get('/api/hotels/schema-options');
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(response.body).toHaveProperty('hotelClasses');
      expect(response.body).toHaveProperty('priceRanges');
      expect(response.body).toHaveProperty('amenities');
      
      // Check some specific enum values
      expect(response.body.cities).toContain('Riyadh');
      expect(response.body.cities).toContain('Jeddah');
      expect(response.body.hotelClasses).toContain('5');
      expect(response.body.priceRanges).toContain('$$$$');
      expect(response.body.amenities).toContain('Wi-Fi');
    });
  });
  
  describe('POST /api/hotels', () => {
    test('Should create a new hotel with valid data', async () => {
      const newHotelData = {
        name: 'New Test Hotel',
        description: 'A newly created test hotel',
        locationCity: 'Mecca',
        address: '789 Test Street, Mecca',
        hotelClass: '4',
        priceRange: '$$$',
        amenities: ['Wi-Fi', 'Fitness Center'],
        coordinates: {
          coordinates: [39.826168, 21.422510]  // Mecca coordinates
        },
        contact: {
          phone: '+966555555555',
          email: 'info@newtesthotel.test'
        }
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/hotels')
        .send(newHotelData);
        
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('New Test Hotel');
      expect(response.body.locationCity).toBe('Mecca');
      
      // Verify it was actually saved to the database
      const savedHotel = await Hotel.findById(response.body._id);
      expect(savedHotel).toBeTruthy();
      expect(savedHotel.name).toBe('New Test Hotel');
    });
    
    test('Should return 400 when creating hotel with missing required fields', async () => {
      const invalidHotelData = {
        // Missing name, description, locationCity, address
        hotelClass: '4',
        priceRange: '$$$'
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/hotels')
        .send(invalidHotelData);
        
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation error');
    });
  });
  
  describe('PUT /api/hotels/:id', () => {
    test('Should update an existing hotel', async () => {
      const updateData = {
        description: 'Updated description for testing',
        hotelClass: '4',
        amenities: ['Wi-Fi', 'Restaurant', 'Gym']
      };
      
      // Make the request
      const response = await request(app)
        .put(`/api/hotels/${budgetHotel._id}`)
        .send(updateData);
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description for testing');
      expect(response.body.hotelClass).toBe('4');
      expect(response.body.amenities).toContain('Gym');
      
      // Verify the hotel was actually updated in the database
      const updatedHotel = await Hotel.findById(budgetHotel._id);
      expect(updatedHotel.description).toBe('Updated description for testing');
    });
    
    test('Should return 404 when updating non-existent hotel', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Make the request
      const response = await request(app)
        .put(`/api/hotels/${nonExistentId}`)
        .send({ description: 'This hotel does not exist' });
        
      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hotel not found');
    });
  });
  
  describe('DELETE /api/hotels/:id', () => {
    test('Should soft delete an existing hotel', async () => {
      // Make the request
      const response = await request(app)
        .delete(`/api/hotels/${luxuryHotel._id}`);
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Hotel deleted successfully');
      
      // Verify the hotel was marked as deleted but still exists in the database
      const deletedHotel = await Hotel.findById(luxuryHotel._id);
      expect(deletedHotel).toBeTruthy();
      expect(deletedHotel.isDeleted).toBe(true);
      
      // Verify it's not returned in regular GET requests
      const getResponse = await request(app).get('/api/hotels');
      const hotelIds = getResponse.body.map(h => h._id.toString());
      expect(hotelIds).not.toContain(luxuryHotel._id.toString());
    });
    
    test('Should return 404 when deleting non-existent hotel', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Make the request
      const response = await request(app)
        .delete(`/api/hotels/${nonExistentId}`);
        
      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Hotel not found');
    });
  });
});
