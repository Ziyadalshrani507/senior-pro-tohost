/**
 * API Mocking Utilities for Tests
 * 
 * This module provides consistent utilities for mocking API responses
 * in a way that completely prevents real database interactions.
 */

import { vi } from 'vitest';
import axios from 'axios';

/**
 * Mock a successful API response
 * @param {string} endpoint - The API endpoint path (e.g., '/api/destinations')
 * @param {*} responseData - The mock data to return
 * @param {number} status - HTTP status code for the response
 */
export const mockApiSuccess = (endpoint, responseData, status = 200) => {
  // Format the response to match your API's standard format
  const response = {
    success: true,
    message: 'Operation successful',
    data: responseData,
    status,
  };
  
  // Create a resolved promise that axios.get would return
  const mockedResponse = { 
    data: response, 
    status,
    headers: {},
  };
  
  // Use vi.mocked to ensure axios.get calls with this endpoint return our mock data
  vi.mocked(axios.get).mockImplementation((url) => {
    if (url.includes(endpoint)) {
      return Promise.resolve(mockedResponse);
    }
    console.warn(`Unmocked axios.get call to ${url}`);
    return Promise.resolve({ data: { mockData: true } });
  });
  
  // Also mock post, put, delete methods the same way
  vi.mocked(axios.post).mockImplementation((url) => {
    if (url.includes(endpoint)) {
      return Promise.resolve(mockedResponse);
    }
    console.warn(`Unmocked axios.post call to ${url}`);
    return Promise.resolve({ data: { mockData: true } });
  });
  
  return mockedResponse;
};

/**
 * Mock a failed API response
 * @param {string} endpoint - The API endpoint path
 * @param {string} errorMessage - Error message to return
 * @param {number} status - HTTP error status code
 */
export const mockApiError = (endpoint, errorMessage = 'API Error', status = 400) => {
  // Format the response to match your API's standard error format
  const response = {
    success: false,
    message: errorMessage,
    errors: [{ message: errorMessage }],
    status,
  };
  
  // Create a rejected promise that axios would return
  const error = {
    response: {
      data: response,
      status,
    },
    message: errorMessage,
  };
  
  // Mock axios methods to reject with this error for the specified endpoint
  vi.mocked(axios.get).mockImplementation((url) => {
    if (url.includes(endpoint)) {
      return Promise.reject(error);
    }
    console.warn(`Unmocked axios.get call to ${url}`);
    return Promise.resolve({ data: { mockData: true } });
  });
  
  // Also mock post, put, delete methods
  vi.mocked(axios.post).mockImplementation((url) => {
    if (url.includes(endpoint)) {
      return Promise.reject(error);
    }
    console.warn(`Unmocked axios.post call to ${url}`);
    return Promise.resolve({ data: { mockData: true } });
  });
  
  return error;
};

/**
 * Create common mock data for testing
 */
export const mockData = {
  // User data
  users: [
    { _id: 'user1', firstName: 'Sarah', lastName: 'Ahmed', email: 'sarah@example.com', role: 'user' },
    { _id: 'user2', firstName: 'Ahmed', lastName: 'Khaled', email: 'ahmed@example.com', role: 'user' },
    { _id: 'admin1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com', role: 'admin' },
  ],
  
  // Destinations
  destinations: [
    { 
      _id: 'dest1', 
      name: 'Al-Ula', 
      description: 'Historic site with ancient tombs',
      type: 'Historical',
      locationCity: 'AlUla',
      pictureUrls: ['https://example.com/alula.jpg'],
      rating: { average: 4.8, count: 120 },
      likes: ['user1', 'user2'],
      likeCount: 2
    },
    { 
      _id: 'dest2', 
      name: 'Edge of the World', 
      description: 'Dramatic cliff views',
      type: 'Adventure',
      locationCity: 'Riyadh',
      pictureUrls: ['https://example.com/edge.jpg'],
      rating: { average: 4.9, count: 85 },
      likes: ['user1'],
      likeCount: 1
    }
  ],
  
  // Restaurants
  restaurants: [
    {
      _id: 'rest1',
      name: 'Arabic Flavors',
      description: 'Traditional Saudi cuisine',
      cuisine: 'Saudi',
      priceRange: '$$',
      locationCity: 'Riyadh',
      rating: { average: 4.5, count: 78 },
      likes: ['user2'],
      likeCount: 1
    },
    {
      _id: 'rest2',
      name: 'Ocean Treasures',
      description: 'Fresh seafood restaurant',
      cuisine: 'Seafood',
      priceRange: '$$$',
      locationCity: 'Jeddah',
      rating: { average: 4.7, count: 92 },
      likes: [],
      likeCount: 0
    }
  ],
  
  // Hotels
  hotels: [
    {
      _id: 'hotel1',
      name: 'Royal Palace Hotel',
      description: 'Luxury hotel in downtown',
      priceRange: '$$$$',
      locationCity: 'Riyadh',
      rating: { average: 4.8, count: 112 },
      amenities: ['Pool', 'Spa', 'Gym']
    },
    {
      _id: 'hotel2',
      name: 'Desert Oasis Resort',
      description: 'Peaceful retreat outside the city',
      priceRange: '$$$',
      locationCity: 'AlUla',
      rating: { average: 4.6, count: 65 },
      amenities: ['Pool', 'Restaurant', 'WiFi']
    }
  ],
  
  // Itineraries
  itineraries: [
    {
      _id: 'itin1',
      city: 'Riyadh',
      days: 2,
      budget: 'Luxury',
      interests: ['Historical', 'Cultural'],
      travelersType: 'Family',
      hotel: { place: 'Royal Palace Hotel', description: 'Luxury accommodation' },
      days: [
        {
          day: 1,
          morning: { activity: 'Historical Museum Visit', description: 'Explore the national museum' },
          lunch: { restaurant: 'Arabic Flavors', description: 'Traditional lunch' },
          afternoon: { activity: 'Shopping at Kingdom Centre', description: 'Luxury shopping' },
          dinner: { restaurant: 'Fine dining experience', description: 'Gourmet dinner' }
        }
      ]
    }
  ]
};

// Export predefined mock data for easy use in tests
export const { users, destinations, restaurants, hotels, itineraries } = mockData;
