const mongoose = require('mongoose');
const Destination = require('../../../Models/Destination');

describe('Destination Model Validation', () => {
  let validDestinationData;

  beforeEach(() => {
    // Set up valid destination data to use in tests
    validDestinationData = {
      name: 'Test Destination',
      description: 'A test destination for validation',
      locationCity: 'Riyadh',
      type: 'Cultural', // Using valid enum value
      cost: 100,
      coordinates: {
        type: 'Point',
        coordinates: [46.675296, 24.713552]
      },
      categories: ['Outdoor'],
      pictureUrls: ['https://example.com/test.jpg']
    };
  });

  test('should validate a valid destination', async () => {
    const destination = new Destination(validDestinationData);
    const validationError = destination.validateSync();
    expect(validationError).toBeUndefined();
  });

  test('should require name field', async () => {
    const invalidData = { ...validDestinationData };
    delete invalidData.name;
    
    const destination = new Destination(invalidData);
    const validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.name).toBeTruthy();
  });

  test('should require description field', async () => {
    const invalidData = { ...validDestinationData };
    delete invalidData.description;
    
    const destination = new Destination(invalidData);
    const validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.description).toBeTruthy();
  });

  test('should require location city to be in enum list', async () => {
    const invalidData = { 
      ...validDestinationData,
      locationCity: 'NonExistentCity' // Not in Saudi cities enum
    };
    
    const destination = new Destination(invalidData);
    const validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.locationCity).toBeTruthy();
    expect(validationError.errors.locationCity.message).toContain('is not a valid enum value');
  });

  test('should validate coordinates within bounds', async () => {
    // Test invalid longitude (outside -180 to 180)
    const invalidLongitude = { 
      ...validDestinationData,
      coordinates: {
        type: 'Point',
        coordinates: [200, 45]
      }
    };
    
    let destination = new Destination(invalidLongitude);
    let validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['coordinates.coordinates']).toBeTruthy();
    
    // Test invalid latitude (outside -90 to 90)
    const invalidLatitude = { 
      ...validDestinationData,
      coordinates: {
        type: 'Point',
        coordinates: [45, 100]
      }
    };
    
    destination = new Destination(invalidLatitude);
    validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['coordinates.coordinates']).toBeTruthy();
  });

  test('should require type field with valid enum value', async () => {
    // Missing type
    let invalidData = { ...validDestinationData };
    delete invalidData.type;
    
    let destination = new Destination(invalidData);
    let validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.type).toBeTruthy();
    
    // Invalid type value
    invalidData = { 
      ...validDestinationData,
      type: 'InvalidType' // Not in enum
    };
    
    destination = new Destination(invalidData);
    validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.type).toBeTruthy();
    expect(validationError.errors.type.message).toContain('is not a valid enum value');
  });

  test('should require cost field with numeric value', async () => {
    // Missing cost
    let invalidData = { ...validDestinationData };
    delete invalidData.cost;
    
    let destination = new Destination(invalidData);
    let validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.cost).toBeTruthy();
    
    // Non-numeric cost
    invalidData = { 
      ...validDestinationData,
      cost: 'not-a-number'
    };
    
    destination = new Destination(invalidData);
    validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.cost).toBeTruthy();
  });

  test('should validate categories are in allowed list', async () => {
    // Invalid category
    const invalidData = {
      ...validDestinationData,
      categories: ['InvalidCategory']
    };
    
    const destination = new Destination(invalidData);
    const validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['categories.0']).toBeTruthy();
    expect(validationError.errors['categories.0'].message).toContain('is not a valid enum value');
  });

  test('should accept multiple valid categories', async () => {
    // Multiple valid categories
    const validData = {
      ...validDestinationData,
      categories: ['Outdoor', 'Family-friendly']
    };
    
    const destination = new Destination(validData);
    const validationError = destination.validateSync();
    
    expect(validationError).toBeUndefined();
  });

  test('should validate rating within bounds', async () => {
    // Rating above max (5)
    const invalidRatingData = {
      ...validDestinationData,
      rating: {
        average: 6, // Above max of 5
        count: 10
      }
    };
    
    const destination = new Destination(invalidRatingData);
    const validationError = destination.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['rating.average']).toBeTruthy();
  });

  test('should accept valid rating data', async () => {
    // Valid rating
    const validRatingData = {
      ...validDestinationData,
      rating: {
        average: 4.5,
        count: 100
      }
    };
    
    const destination = new Destination(validRatingData);
    const validationError = destination.validateSync();
    
    expect(validationError).toBeUndefined();
  });

  test('should accept valid pictureUrls array', async () => {
    // Valid pictureUrls array
    const validData = {
      ...validDestinationData,
      pictureUrls: ['https://example.com/1.jpg', 'https://example.com/2.jpg']
    };
    
    const destination = new Destination(validData);
    const validationError = destination.validateSync();
    
    expect(validationError).toBeUndefined();
  });
  
  test('should handle empty pictureUrls array', async () => {
    // Empty pictureUrls array
    const validData = {
      ...validDestinationData,
      pictureUrls: []
    };
    
    const destination = new Destination(validData);
    const validationError = destination.validateSync();
    
    // An empty array should be valid
    expect(validationError).toBeUndefined();
  });
});
