const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const { generateItinerary } = require('../../Controllers/itineraryController');
const Itinerary = require('../../Models/Itinerary');
const Destination = require('../../Models/Destination');
const Hotel = require('../../Models/Hotel');
const { Restaurant } = require('../../Models/Restaurant');
const { protect } = require('../../middleware/authMiddleware');
const openaiConfig = require('../../config/openai');

// Mock the openai configuration
jest.mock('../../config/openai', () => ({
  createCompletion: jest.fn(),
  createChatCompletion: jest.fn()
}));

// Mock the auth middleware
jest.mock('../../middleware/authMiddleware', () => ({
  protect: jest.fn()
}));

// Configure the auth middleware mock behavior before each test
const configureMocks = () => {
  // Set up auth middleware behavior
  const { protect } = require('../../middleware/authMiddleware');
  protect.mockImplementation((req, res, next) => {
    req.user = { _id: new mongoose.Types.ObjectId(), role: 'user' };
    next();
  });
};

// Set up a minimal express app for testing
const app = express();
app.use(express.json());
app.post('/api/itinerary/generate', protect, generateItinerary);

let server;

beforeAll(() => {
  server = app.listen(0);
});

afterAll(async () => {
  await new Promise(resolve => server.close(resolve));
});

describe('Itinerary Controller Tests', () => {
  
  // Mock data
  const mockUser = { _id: new mongoose.Types.ObjectId(), role: 'user' };
  const mockDestinations = [
    { name: 'Historical Museum', description: 'An interesting museum about local history', locationCity: 'Riyadh', type: 'Historical' },
    { name: 'Adventure Park', description: 'Exciting outdoor activities', locationCity: 'Riyadh', type: 'Adventure' }
  ];
  const mockHotels = [
    { name: 'Luxury Hotel', priceRange: '$$$', locationCity: 'Riyadh' },
    { name: 'Budget Inn', priceRange: '$', locationCity: 'Riyadh' }
  ];
  const mockRestaurants = [
    { name: 'Fine Dining', cuisine: 'International', locationCity: 'Riyadh' },
    { name: 'Local Cuisine', cuisine: 'Saudi Arabian', locationCity: 'Riyadh' }
  ];
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up auth middleware mock behavior
    configureMocks();
    
    // Mock the Mongoose models
    Destination.find = jest.fn().mockReturnThis();
    Destination.distinct = jest.fn().mockResolvedValue(['Historical', 'Adventure', 'Cultural']);
    Destination.limit = jest.fn().mockResolvedValue(mockDestinations);
    
    Hotel.find = jest.fn().mockReturnThis();
    Hotel.limit = jest.fn().mockResolvedValue(mockHotels);
    
    Restaurant.find = jest.fn().mockReturnThis();
    Restaurant.limit = jest.fn().mockResolvedValue(mockRestaurants);
    
    Itinerary.prototype.save = jest.fn().mockResolvedValue(true);
  });
  
  test('POST /api/itinerary/generate with valid input returns 201 Created and a complete itinerary', async () => {
    // Mock the OpenAI completion to return a valid itinerary response
    const mockItineraryResponse = {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              hotel: { 
                place: 'Luxury Hotel', 
                description: 'A perfect luxury hotel for your stay' 
              },
              days: [
                {
                  day: 1,
                  morning: { 
                    activity: 'Historical Museum', 
                    description: 'Start your day with a cultural experience' 
                  },
                  lunch: { 
                    restaurant: 'Local Cuisine', 
                    description: 'Enjoy authentic local flavors' 
                  },
                  afternoon: { 
                    activity: 'Adventure Park', 
                    description: 'Experience exciting outdoor activities' 
                  },
                  dinner: { 
                    restaurant: 'Fine Dining', 
                    description: 'End your day with a fine dining experience' 
                  },
                  notes: 'Make sure to stay hydrated during the day'
                }
              ]
            })
          }
        }]
      }
    };
    
    openaiConfig.createChatCompletion.mockResolvedValue(mockItineraryResponse);
    
    // Valid request body
    const requestBody = {
      city: 'Riyadh',
      duration: 1,
      interests: ['Historical', 'Adventure'],
      budget: 'Luxury',
      travelersType: 'Solo'
    };
    
    // Make the request
    const response = await request(app)
      .post('/api/itinerary/generate')
      .send(requestBody);
    
    // Assertions
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.city).toBe('Riyadh');
    expect(response.body.data.days).toHaveLength(1);
    expect(response.body.data.hotel).toBeDefined();
    expect(response.body.data.hotel.place).toBe('Luxury Hotel');
  });

  test('POST /api/itinerary/generate with missing required fields returns 400 Bad Request', async () => {
    // Test with missing city
    const missingCityBody = {
      // city is missing
      duration: 3,
      interests: ['Historical', 'Adventure'],
      budget: 'Medium',
      travelersType: 'Couple'
    };
    
    const response1 = await request(app)
      .post('/api/itinerary/generate')
      .send(missingCityBody);
    
    // Assertions for missing city
    expect(response1.status).toBe(400);
    expect(response1.body.success).toBe(false);
    expect(response1.body.message).toContain('Missing required fields');
    
    // Test with missing interests
    const missingInterestsBody = {
      city: 'Riyadh',
      duration: 3,
      // interests is missing
      budget: 'Medium',
      travelersType: 'Couple'
    };
    
    const response2 = await request(app)
      .post('/api/itinerary/generate')
      .send(missingInterestsBody);
    
    // Assertions for missing interests
    expect(response2.status).toBe(400);
    expect(response2.body.success).toBe(false);
    expect(response2.body.message).toContain('Missing required fields');
    
    // Test with empty request body
    const response3 = await request(app)
      .post('/api/itinerary/generate')
      .send({});
    
    // Assertions for empty body
    expect(response3.status).toBe(400);
    expect(response3.body.success).toBe(false);
    expect(response3.body.message).toContain('Missing required fields');
  });

  test('Itinerary includes correct destination, days, and interests', async () => {
    // Mock the OpenAI completion to return a specific itinerary response
    const mockItineraryResponse = {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              hotel: { 
                place: 'Luxury Hotel', 
                description: 'A perfect hotel for your interests in Historical sites and Adventure activities' 
              },
              days: [
                {
                  day: 1,
                  morning: { 
                    activity: 'Historical Museum', 
                    description: 'Start with this historical landmark' 
                  },
                  lunch: { 
                    restaurant: 'Local Cuisine', 
                    description: 'Traditional lunch' 
                  },
                  afternoon: { 
                    activity: 'Adventure Park', 
                    description: 'Exciting adventure activities' 
                  },
                  dinner: { 
                    restaurant: 'Fine Dining', 
                    description: 'Fine dining experience' 
                  },
                  notes: 'Day focused on historical and adventure activities'
                },
                {
                  day: 2,
                  morning: { 
                    activity: 'Historical Museum', 
                    description: 'More historical exploration' 
                  },
                  lunch: { 
                    restaurant: 'Fine Dining', 
                    description: 'Upscale lunch' 
                  },
                  afternoon: { 
                    activity: 'Adventure Park', 
                    description: 'More adventure' 
                  },
                  dinner: { 
                    restaurant: 'Local Cuisine', 
                    description: 'Traditional dinner' 
                  },
                  notes: 'Continue exploring history and adventure'
                }
              ]
            })
          }
        }]
      }
    };
    
    openaiConfig.createChatCompletion.mockResolvedValue(mockItineraryResponse);
    
    // Create request with specific duration and interests
    const requestBody = {
      city: 'Riyadh',
      duration: 2, // 2 days
      interests: ['Historical', 'Adventure'],
      budget: 'Luxury',
      travelersType: 'Family'
    };
    
    // Make the request
    const response = await request(app)
      .post('/api/itinerary/generate')
      .send(requestBody);
    
    // Assertions for correct content
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    
    const itinerary = response.body.data;
    
    // Verify city matches request
    expect(itinerary.city).toBe('Riyadh');
    
    // Verify correct number of days based on duration
    expect(itinerary.days).toHaveLength(2);
    
    // Verify interests are included
    expect(itinerary.interests).toEqual(expect.arrayContaining(['Historical', 'Adventure']));
    
    // Verify budget is correct
    expect(itinerary.budget).toBe('Luxury');
    
    // Verify traveler type is correct
    expect(itinerary.travelersType).toBe('Family');
    
    // Verify day structure is correct
    expect(itinerary.days[0]).toHaveProperty('day', 1);
    expect(itinerary.days[0]).toHaveProperty('morning.activity');
    expect(itinerary.days[0]).toHaveProperty('lunch.restaurant');
    expect(itinerary.days[0]).toHaveProperty('afternoon.activity');
    expect(itinerary.days[0]).toHaveProperty('dinner.restaurant');
    
    // Verify hotel information is included
    expect(itinerary.hotel).toHaveProperty('place');
    expect(itinerary.hotel).toHaveProperty('description');
    expect(itinerary.hotel.description).toContain('Historical');
    expect(itinerary.hotel.description).toContain('Adventure');
  });
});
