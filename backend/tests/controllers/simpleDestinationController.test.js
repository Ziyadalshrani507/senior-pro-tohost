const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Destination = require('../../Models/Destination');
const destinationController = require('../../Controllers/destinationController');

// Set up a minimal express app for testing
const app = express();
app.use(express.json());
app.get('/api/destinations', destinationController.getDestinations);
app.get('/api/destinations/:id', destinationController.getDestination);

// Test suite for destination controller without unnecessary mocking
describe('Destination Controller Integration Tests', () => {
  // Setup and cleanup for each test
  let testDestination;
  let featuredDestination;
  
  beforeEach(async () => {
    // Clear the destinations collection before each test
    await Destination.deleteMany({});
    
    // Create a test destination in the in-memory database
    testDestination = await Destination.create({
      name: 'Test Destination',
      description: 'A test destination for integration testing',
      locationCity: 'Riyadh',
      type: 'Historical',
      cost: 100,
      coordinates: {
        coordinates: [46.675296, 24.713552]  // Riyadh coordinates
      }
    });
    
    // Create a featured destination
    featuredDestination = await Destination.create({
      name: 'Featured Destination',
      description: 'A featured destination for testing',
      locationCity: 'Jeddah',
      type: 'Adventure',
      cost: 200,
      featured: true,
      coordinates: {
        coordinates: [39.173526, 21.485811]  // Jeddah coordinates
      }
    });
  });
  
  afterEach(async () => {
    // Clean up all data after tests
    await Destination.deleteMany({});
  });
  
  describe('GET /api/destinations', () => {
    test('Should return all destinations', async () => {
      // Make the request
      const response = await request(app)
        .get('/api/destinations');
        
      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
      
      // Check that we have both destinations in the response
      const names = response.body.map(d => d.name);
      expect(names).toContain('Test Destination');
      expect(names).toContain('Featured Destination');
    });
    
    test('Should filter destinations by featured flag', async () => {
      // Make the request with featured filter
      const response = await request(app)
        .get('/api/destinations')
        .query({ featured: 'true' });
        
      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Featured Destination');
      expect(response.body[0].featured).toBe(true);
    });
    
    test('Should limit the number of results', async () => {
      // Make the request with limit
      const response = await request(app)
        .get('/api/destinations')
        .query({ limit: '1' });
        
      // Assertions
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
    });
  });
  
  describe('GET /api/destinations/:id', () => {
    test('Should return a single destination by ID', async () => {
      // Make the request using the ID of our test destination
      const response = await request(app)
        .get(`/api/destinations/${testDestination._id}`);
        
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body._id.toString()).toBe(testDestination._id.toString());
      expect(response.body.name).toBe('Test Destination');
      expect(response.body.locationCity).toBe('Riyadh');
    });
    
    test('Should return 404 when destination is not found', async () => {
      // Generate a random ID that doesn't exist
      const nonExistentId = new mongoose.Types.ObjectId();
      
      // Make the request
      const response = await request(app)
        .get(`/api/destinations/${nonExistentId}`);
        
      // Assertions
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Destination not found');
    });
  });
});
