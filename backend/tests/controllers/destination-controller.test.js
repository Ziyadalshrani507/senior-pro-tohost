const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Destination = require('../../Models/Destination');
const destinationController = require('../../Controllers/destinationController');

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
app.get('/api/destinations', destinationController.getDestinations);
app.get('/api/destinations/schema-options', destinationController.getSchemaOptions);
app.get('/api/destinations/nearby', destinationController.getNearbyDestinations);
app.get('/api/destinations/:id', destinationController.getDestination);
app.post('/api/destinations', mockAuthMiddleware, destinationController.createDestination);
app.put('/api/destinations/:id', mockAuthMiddleware, destinationController.updateDestination);
app.delete('/api/destinations/:id', mockAuthMiddleware, destinationController.deleteDestination);

// Activity routes
app.get('/api/activities', destinationController.getActivities);
app.get('/api/activities/:id', destinationController.getActivity);
app.post('/api/activities', mockAuthMiddleware, destinationController.createActivity);
app.put('/api/activities/:id', mockAuthMiddleware, destinationController.updateActivity);
app.delete('/api/activities/:id', mockAuthMiddleware, destinationController.deleteActivity);

describe('Destination Controller Tests', () => {
  // Test destinations
  let historicalDestination, adventureDestination, culturalDestination;
  let activityDestination;
  
  beforeEach(async () => {
    // Clear the database before each test
    await Destination.deleteMany({});
    
    // Create test destinations
    historicalDestination = await Destination.create({
      name: 'Historical Site',
      description: 'A historical destination for testing',
      locationCity: 'Riyadh',
      type: 'Historical',
      cost: 100,
      coordinates: {
        type: 'Point',
        coordinates: [46.675296, 24.713552] // Riyadh coordinates
      },
      categories: ['Family-friendly', 'Outdoor'],
      pictureUrls: ['https://example.com/pic1.jpg'],
      featured: true,
      country: 'Saudi Arabia'
    });
    
    adventureDestination = await Destination.create({
      name: 'Adventure Park',
      description: 'An adventure destination for testing',
      locationCity: 'Jeddah',
      type: 'Adventure',
      cost: 150,
      coordinates: {
        type: 'Point',
        coordinates: [39.173526, 21.485811] // Jeddah coordinates
      },
      categories: ['Outdoor', 'Group-traveler'],
      pictureUrls: ['https://example.com/pic2.jpg'],
      featured: false,
      country: 'Saudi Arabia'
    });
    
    culturalDestination = await Destination.create({
      name: 'Cultural Center',
      description: 'A cultural destination for testing',
      locationCity: 'Mecca',
      type: 'Cultural',
      cost: 50,
      coordinates: {
        type: 'Point',
        coordinates: [39.826168, 21.422510] // Mecca coordinates
      },
      categories: ['Indoor', 'Family-friendly'],
      pictureUrls: ['https://example.com/pic3.jpg'],
      featured: false,
      country: 'Saudi Arabia'
    });
    
    // Create test activity
    activityDestination = await Destination.create({
      name: 'Desert Safari',
      description: 'A desert safari activity for testing',
      locationCity: 'Riyadh',
      type: 'Adventure',
      cost: 200,
      coordinates: {
        type: 'Point',
        coordinates: [46.650761, 24.774265] // Near Riyadh
      },
      categories: ['Outdoor', 'Group-traveler'],
      pictureUrls: ['https://example.com/pic4.jpg'],
      isActivity: true,
      featured: true,
      country: 'Saudi Arabia'
    });
  });
  
  afterEach(async () => {
    await Destination.deleteMany({});
  });
  
  describe('GET /api/destinations', () => {
    test('Should return all destinations', async () => {
      const response = await request(app).get('/api/destinations');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
      
      // Check if the destinations include our test destinations
      const names = response.body.map(d => d.name);
      expect(names).toContain('Historical Site');
      expect(names).toContain('Adventure Park');
      expect(names).toContain('Cultural Center');
    });
    
    test('Should filter destinations by featured flag', async () => {
      const response = await request(app)
        .get('/api/destinations')
        .query({ featured: 'true' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Check if featured destinations are correctly filtered
      const featuredDestinations = response.body.filter(d => d.featured === true);
      expect(featuredDestinations.length).toBeGreaterThan(0);
      
      // All returned destinations should be featured
      response.body.forEach(destination => {
        expect(destination.featured).toBe(true);
      });
    });
    
    test('Should filter destinations by country', async () => {
      const response = await request(app)
        .get('/api/destinations')
        .query({ country: 'Saudi Arabia' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All returned destinations should be in Saudi Arabia
      response.body.forEach(destination => {
        expect(destination.country).toBe('Saudi Arabia');
      });
    });
    
    test('Should limit the number of returned destinations', async () => {
      const response = await request(app)
        .get('/api/destinations')
        .query({ limit: '2' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);
    });
  });
  
  describe('GET /api/destinations/nearby', () => {
    test('Should return destinations near a location', async () => {
      const response = await request(app)
        .get('/api/destinations/nearby')
        .query({ 
          lat: '24.713552', 
          lng: '46.675296',
          radius: '10' // 10km radius
        });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should include the historical destination which is in Riyadh
      const names = response.body.map(d => d.name);
      expect(names).toContain('Historical Site');
    });
    
    test('Should return 400 when lat/lng are missing', async () => {
      const response = await request(app)
        .get('/api/destinations/nearby')
        .query({ radius: '10' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Latitude and longitude are required');
    });
  });
  
  describe('GET /api/destinations/schema-options', () => {
    test('Should return schema options with enum values', async () => {
      const response = await request(app).get('/api/destinations/schema-options');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(response.body).toHaveProperty('types');
      expect(response.body).toHaveProperty('categories');
      
      // Verify the schema options contain expected values
      expect(response.body.cities).toContain('Riyadh');
      expect(response.body.types).toContain('Historical');
      expect(response.body.categories).toContain('Family-friendly');
    });
  });
  
  describe('GET /api/destinations/:id', () => {
    test('Should return a single destination by ID', async () => {
      const response = await request(app).get(`/api/destinations/${historicalDestination._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', historicalDestination._id.toString());
      expect(response.body.name).toBe('Historical Site');
    });
    
    test('Should return 404 for non-existent destination', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/destinations/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Destination not found');
    });
  });
  
  describe('POST /api/destinations', () => {
    test('Should create a new destination with valid data', async () => {
      const newDestinationData = {
        name: 'New Test Destination',
        description: 'A new destination for testing',
        locationCity: 'Taif',
        type: 'Experiences',
        cost: 75,
        coordinates: {
          type: 'Point',
          coordinates: [40.416775, 21.267578] // Taif coordinates
        },
        categories: ['Outdoor', 'Budget'],
        pictureUrls: ['https://example.com/pic5.jpg']
      };
      
      const response = await request(app)
        .post('/api/destinations')
        .send(newDestinationData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('New Test Destination');
      expect(response.body.locationCity).toBe('Taif');
      
      // Verify it was saved to the database
      const savedDestination = await Destination.findById(response.body._id);
      expect(savedDestination).toBeTruthy();
      expect(savedDestination.name).toBe('New Test Destination');
    });
    
    test('Should reject creating destination with missing required fields', async () => {
      const invalidData = {
        name: 'Incomplete Destination',
        // Missing required fields
      };
      
      const response = await request(app)
        .post('/api/destinations')
        .send(invalidData);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Missing required fields');
      expect(response.body.details).toContain('description');
      expect(response.body.details).toContain('locationCity');
      expect(response.body.details).toContain('type');
      expect(response.body.details).toContain('cost');
    });
  });
  
  describe('PUT /api/destinations/:id', () => {
    test('Should update a destination with valid data', async () => {
      const updateData = {
        name: 'Updated Historical Site',
        description: 'Updated historical destination',
        locationCity: 'Riyadh',
        type: 'Historical',
        cost: 120
      };
      
      const response = await request(app)
        .put(`/api/destinations/${historicalDestination._id}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Historical Site');
      expect(response.body.cost).toBe(120);
      
      // Verify it was updated in the database
      const updatedDestination = await Destination.findById(historicalDestination._id);
      expect(updatedDestination.name).toBe('Updated Historical Site');
    });
    
    test('Should return 404 for non-existent destination', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/destinations/${fakeId}`)
        .send({ name: 'Updated Name', description: 'Updated description', locationCity: 'Riyadh', type: 'Historical', cost: 100 });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Destination not found');
    });
  });
  
  describe('DELETE /api/destinations/:id', () => {
    test('Should delete a destination', async () => {
      const response = await request(app)
        .delete(`/api/destinations/${historicalDestination._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Destination deleted successfully');
      
      // Verify it was deleted from the database
      const deletedDestination = await Destination.findById(historicalDestination._id);
      expect(deletedDestination).toBeFalsy();
    });
    
    test('Should return 404 for non-existent destination', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(`/api/destinations/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Destination not found');
    });
  });
  
  // Activity endpoints tests
  describe('GET /api/activities', () => {
    test('Should return all activities', async () => {
      const response = await request(app).get('/api/activities');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should only include the activity destination
      const activities = response.body.filter(d => d.isActivity === true);
      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0].name).toBe('Desert Safari');
    });
    
    test('Should filter activities by search term', async () => {
      const response = await request(app)
        .get('/api/activities')
        .query({ search: 'safari' });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Should find our desert safari activity
      const names = response.body.map(d => d.name);
      expect(names).toContain('Desert Safari');
    });
  });
  
  describe('GET /api/activities/:id', () => {
    test('Should return a single activity by ID', async () => {
      const response = await request(app).get(`/api/activities/${activityDestination._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', activityDestination._id.toString());
      expect(response.body.name).toBe('Desert Safari');
      expect(response.body.isActivity).toBe(true);
    });
    
    test('Should return 404 for non-activity destination', async () => {
      // Try to get a regular destination via activity endpoint
      const response = await request(app).get(`/api/activities/${historicalDestination._id}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Activity not found');
    });
  });
  
  describe('POST /api/activities', () => {
    test('Should create a new activity', async () => {
      const newActivityData = {
        name: 'Camel Riding',
        description: 'Experience traditional camel riding',
        locationCity: 'Riyadh',
        type: 'Adventure',
        cost: 150,
        coordinates: {
          type: 'Point',
          coordinates: [46.700, 24.750]
        },
        categories: ['Outdoor', 'Family-friendly']
      };
      
      const response = await request(app)
        .post('/api/activities')
        .send(newActivityData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe('Camel Riding');
      expect(response.body.isActivity).toBe(true);
      
      // Verify it was saved to the database
      const savedActivity = await Destination.findById(response.body._id);
      expect(savedActivity).toBeTruthy();
      expect(savedActivity.isActivity).toBe(true);
    });
  });
  
  describe('PUT /api/activities/:id', () => {
    test('Should update an activity', async () => {
      const updateData = {
        name: 'Updated Desert Safari',
        cost: 250
      };
      
      const response = await request(app)
        .put(`/api/activities/${activityDestination._id}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Desert Safari');
      expect(response.body.cost).toBe(250);
      expect(response.body.isActivity).toBe(true);
    });
    
    test('Should return 404 for non-activity destination', async () => {
      // Try to update a regular destination via activity endpoint
      const response = await request(app)
        .put(`/api/activities/${historicalDestination._id}`)
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Activity not found');
    });
  });
  
  describe('DELETE /api/activities/:id', () => {
    test('Should delete an activity', async () => {
      const response = await request(app)
        .delete(`/api/activities/${activityDestination._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Activity deleted successfully');
      
      // Verify it was deleted from the database
      const deletedActivity = await Destination.findById(activityDestination._id);
      expect(deletedActivity).toBeFalsy();
    });
    
    test('Should return 404 for non-activity destination', async () => {
      // Try to delete a regular destination via activity endpoint
      const response = await request(app)
        .delete(`/api/activities/${historicalDestination._id}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Activity not found');
    });
  });
});
