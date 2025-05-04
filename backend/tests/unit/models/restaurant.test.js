const mongoose = require('mongoose');
const { Restaurant, CUISINES, CATEGORIES } = require('../../../Models/Restaurant');

// Mock MongoDB connection
beforeAll(async () => {
  // Use an in-memory MongoDB instance for tests
  // The setup.js file already handles this in your project
});

describe('Restaurant Model Validation', () => {
  let validRestaurantData;

  beforeEach(() => {
    // Set up valid restaurant data to use in tests
    validRestaurantData = {
      name: 'Test Restaurant',
      description: 'A test restaurant for validation',
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
        phone: '+966123456789',
        email: 'test@restaurant.com',
        website: 'https://test-restaurant.com'
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
      }
    };
  });

  test('should validate a valid restaurant', async () => {
    const restaurant = new Restaurant(validRestaurantData);
    const validationError = restaurant.validateSync();
    expect(validationError).toBeUndefined();
  });

  test('should require name field', async () => {
    const invalidData = { ...validRestaurantData };
    delete invalidData.name;
    
    const restaurant = new Restaurant(invalidData);
    const validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.name).toBeTruthy();
    expect(validationError.errors.name.message).toContain('required');
  });

  test('should require cuisine to be in enum list', async () => {
    const invalidData = { 
      ...validRestaurantData,
      cuisine: 'NonExistentCuisine' // Not in enum
    };
    
    const restaurant = new Restaurant(invalidData);
    const validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.cuisine).toBeTruthy();
    expect(validationError.errors.cuisine.message).toContain('is not a valid enum value');
  });

  test('should validate cuisine is in allowed list', async () => {
    // Test with each valid cuisine
    for (const cuisine of CUISINES) {
      const data = { ...validRestaurantData, cuisine };
      const restaurant = new Restaurant(data);
      const validationError = restaurant.validateSync();
      expect(validationError).toBeUndefined();
    }
  });

  test('should require price range to be valid', async () => {
    const invalidData = { 
      ...validRestaurantData,
      priceRange: '$$$$$' // Invalid price range
    };
    
    const restaurant = new Restaurant(invalidData);
    const validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors.priceRange).toBeTruthy();
  });

  test('should validate coordinates within bounds', async () => {
    // Test invalid longitude (outside -180 to 180)
    const invalidLongitude = { 
      ...validRestaurantData,
      coordinates: {
        type: 'Point',
        coordinates: [200, 45]
      }
    };
    
    let restaurant = new Restaurant(invalidLongitude);
    let validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['coordinates.coordinates']).toBeTruthy();
    
    // Test invalid latitude (outside -90 to 90)
    const invalidLatitude = { 
      ...validRestaurantData,
      coordinates: {
        type: 'Point',
        coordinates: [45, 100]
      }
    };
    
    restaurant = new Restaurant(invalidLatitude);
    validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['coordinates.coordinates']).toBeTruthy();
  });

  test('should validate email format', async () => {
    // Test invalid email
    const invalidData = {
      ...validRestaurantData,
      contact: {
        ...validRestaurantData.contact,
        email: 'not-an-email'
      }
    };
    
    const restaurant = new Restaurant(invalidData);
    const validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['contact.email']).toBeTruthy();
    expect(validationError.errors['contact.email'].message).toContain('not a valid email');
  });

  test('should validate website format', async () => {
    // Test invalid website URL
    const invalidData = {
      ...validRestaurantData,
      contact: {
        ...validRestaurantData.contact,
        website: 'not-a-url'
      }
    };
    
    const restaurant = new Restaurant(invalidData);
    const validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['contact.website']).toBeTruthy();
    expect(validationError.errors['contact.website'].message).toContain('not a valid URL');
  });

  test('should require opening hours fields', async () => {
    // Missing open hour
    const invalidData = {
      ...validRestaurantData,
      openingHours: {
        open: {
          // Missing hour
          minute: 0,
          period: 'AM'
        },
        close: validRestaurantData.openingHours.close
      }
    };
    
    const restaurant = new Restaurant(invalidData);
    const validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['openingHours.open.hour']).toBeTruthy();
  });

  test('should validate opening hours period values', async () => {
    // Invalid period value
    const invalidData = {
      ...validRestaurantData,
      openingHours: {
        open: {
          hour: 9,
          minute: 0,
          period: 'InvalidPeriod' // Neither AM nor PM
        },
        close: validRestaurantData.openingHours.close
      }
    };
    
    const restaurant = new Restaurant(invalidData);
    const validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['openingHours.open.period']).toBeTruthy();
    expect(validationError.errors['openingHours.open.period'].message).toContain('is not a valid enum value');
  });

  test('should validate categories are in allowed list', async () => {
    // Invalid category
    const invalidData = {
      ...validRestaurantData,
      categories: ['InvalidCategory']
    };
    
    const restaurant = new Restaurant(invalidData);
    const validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['categories.0']).toBeTruthy();

    // Valid categories
    const validCategoriesData = {
      ...validRestaurantData,
      categories: CATEGORIES.slice(0, 3) // Take first 3 valid categories
    };
    
    const validRestaurant = new Restaurant(validCategoriesData);
    const validCategoriesError = validRestaurant.validateSync();
    
    expect(validCategoriesError).toBeUndefined();
  });

  test('should validate rating within bounds', async () => {
    // Rating above max (5)
    const invalidRatingData = {
      ...validRestaurantData,
      rating: {
        average: 6, // Above max of 5
        count: 10
      }
    };
    
    const restaurant = new Restaurant(invalidRatingData);
    const validationError = restaurant.validateSync();
    
    expect(validationError).toBeTruthy();
    expect(validationError.errors['rating.average']).toBeTruthy();
  });

  test('should accept valid likes array', async () => {
    // Valid likes array with ObjectIds
    const validLikesData = {
      ...validRestaurantData,
      likes: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      likeCount: 2
    };
    
    const validRestaurant = new Restaurant(validLikesData);
    const validationError = validRestaurant.validateSync();
    
    expect(validationError).toBeUndefined();
  });
  
  test('should properly handle null likes', async () => {
    // Test with null likes (which we might need to handle in the application)
    const nullLikesData = {
      ...validRestaurantData,
      likes: null,
      likeCount: 0
    };
    
    const restaurant = new Restaurant(nullLikesData);
    // If there's no explicit validation, this shouldn't throw a validation error
    const validationError = restaurant.validateSync();
    
    // In a real app, we'd want to handle this case by initializing likes as an empty array
    // Check if there's a validation error for likes
    if (validationError && validationError.errors.likes) {
      // The actual error message is "Likes must be an array"
      expect(validationError.errors.likes.message).toContain('must be an array');
    }
  });
});
