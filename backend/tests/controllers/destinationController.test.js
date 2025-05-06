const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Destination = require('../../Models/Destination');
const destinationController = require('../../Controllers/destinationController');

// Create test user ID for auth
const testUserId = new mongoose.Types.ObjectId();

// Mock auth middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = {
    _id: testUserId,
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  };
  next();
};

// Set up express app for testing
const app = express();
app.use(express.json());

// Apply routes with mock auth where needed
app.get('/api/destinations/search', destinationController.searchDestinations);
app.get('/api/destinations/schema-options', destinationController.getSchemaOptions);
app.get('/api/destinations', destinationController.getDestinations);
app.get('/api/destinations/nearby', destinationController.getNearbyDestinations);
app.get('/api/destinations/:id', destinationController.getDestination);
app.post('/api/destinations', mockAuthMiddleware, destinationController.createDestination);
app.put('/api/destinations/:id', mockAuthMiddleware, destinationController.updateDestination);

describe('Destination Controller Tests', () => {
  const testDestination = {
    name: 'Test Destination',
    description: 'A beautiful test destination',
    locationCity: 'Riyadh', // Using valid enum value
    type: 'Historical', // Using valid enum value
    cost: 50,
    coordinates: {
      type: 'Point',
      coordinates: [46.6753, 24.7136] // Riyadh coordinates
    },
    categories: ['Family-friendly'], // Using valid enum value
    rating: {
      average: 4.5,
      count: 10
    },
    pictureUrls: ['https://example.com/image1.jpg']
  };

  beforeEach(async () => {
    // Clear destinations collection before each test
    await Destination.deleteMany({});
  });

  describe('POST /api/destinations', () => {
    it('should create a new destination with valid data', async () => {
      const response = await request(app)
        .post('/api/destinations')
        .send(testDestination);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(testDestination.name);
      expect(response.body.description).toBe(testDestination.description);
      expect(response.body.locationCity).toBe(testDestination.locationCity);
    });

    it('should fail to create destination with missing required fields', async () => {
      const invalidDestination = {
        name: 'Test Destination'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/destinations')
        .send(invalidDestination);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Missing required fields');
    });
  });

  describe('GET /api/destinations/search', () => {
    beforeEach(async () => {
      await Destination.create(testDestination);
    });

    it('should search destinations by name', async () => {
      const response = await request(app)
        .get('/api/destinations/search')
        .query({ name: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe(testDestination.name);
    });

    it('should return 400 if search name is not provided', async () => {
      const response = await request(app)
        .get('/api/destinations/search');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/destinations', () => {
    beforeEach(async () => {
      await Destination.create(testDestination);
    });

    it('should get all destinations', async () => {
      const response = await request(app)
        .get('/api/destinations');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get nearby destinations within radius', async () => {
      const response = await request(app)
        .get('/api/destinations')
        .query({
          lat: 24.7136,
          lng: 46.6753,
          radius: 10
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter destinations by country', async () => {
      const response = await request(app)
        .get('/api/destinations')
        .query({ country: 'Saudi Arabia' });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/destinations/nearby', () => {
    beforeEach(async () => {
      await Destination.create(testDestination);
    });

    it('should get nearby destinations', async () => {
      const response = await request(app)
        .get('/api/destinations/nearby')
        .query({
          lat: 24.7136,
          lng: 46.6753,
          radius: 5
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 if coordinates are missing', async () => {
      const response = await request(app)
        .get('/api/destinations/nearby')
        .query({ radius: 5 });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/destinations/:id', () => {
    let createdDestination;

    beforeEach(async () => {
      createdDestination = await Destination.create(testDestination);
    });

    it('should get a single destination by ID', async () => {
      const response = await request(app)
        .get(`/api/destinations/${createdDestination._id}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(testDestination.name);
    });

    it('should return 404 for non-existent destination', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/destinations/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/destinations/schema-options', () => {
    it('should return schema options with enum values', async () => {
      const response = await request(app)
        .get('/api/destinations/schema-options');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cities');
      expect(response.body).toHaveProperty('types');
      expect(response.body).toHaveProperty('categories');
      expect(Array.isArray(response.body.cities)).toBe(true);
      expect(Array.isArray(response.body.types)).toBe(true);
      expect(Array.isArray(response.body.categories)).toBe(true);
    });
  });

  describe('PUT /api/destinations/:id', () => {
    let createdDestination;

    beforeEach(async () => {
      createdDestination = await Destination.create(testDestination);
    });

    it('should update a destination', async () => {
      const updateData = {
        name: 'Updated Destination',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/destinations/${createdDestination._id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });

    it('should return 404 for updating non-existent destination', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/destinations/${fakeId}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
    });
  });
});
