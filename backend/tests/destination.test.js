const mongoose = require('mongoose');
const Destination = require('../Models/Destination');
const { createTestDocument } = require('./utils/db-utils');

describe('Destination Model Tests', () => {
  // Test that the model correctly validates data
  test('should validate a destination with required fields', async () => {
    const validDestination = {
      name: 'Test Destination',
      description: 'A test description',
      locationCity: 'Riyadh',
      type: 'Historical',
      cost: 100,
      coordinates: {
        coordinates: [45.123, 23.456]
      }
    };

    const destination = await createTestDocument(Destination, validDestination);
    expect(destination.name).toBe('Test Destination');
    expect(destination.locationCity).toBe('Riyadh');
    expect(destination.type).toBe('Historical');
    expect(destination.cost).toBe(100);
    expect(destination._id).toBeDefined();
  });

  // Test that model validation rejects invalid data
  test('should not validate a destination with missing required fields', async () => {
    const invalidDestination = {
      name: 'Test Destination'
      // Missing required fields
    };

    let error;
    try {
      await createTestDocument(Destination, invalidDestination);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('ValidationError');
  });

  // Test that the memory database is fresh for each test
  test('should have an empty database at the start of this test', async () => {
    const count = await Destination.countDocuments();
    expect(count).toBe(0);
  });
});
