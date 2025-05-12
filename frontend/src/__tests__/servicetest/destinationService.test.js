import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import getApiBaseUrl from '../../utils/apiBaseUrl';

// Import safeguards to prevent real API calls
import '../../test/safeguards';

// Mock axios
vi.mock('axios');

// Mock destination service functions
const destinationService = {
  // Get all destinations
  getAllDestinations: async () => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/destinations`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching destinations');
    }
  },
  
  // Get destination by ID
  getDestinationById: async (id) => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/destinations/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching destination');
    }
  },
  
  // Get destinations by filters
  getDestinationsByFilter: async (filters) => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/destinations/filter`, { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error filtering destinations');
    }
  },
  
  // Get popular destinations
  getPopularDestinations: async () => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/destinations/popular`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching popular destinations');
    }
  }
};

describe('Destination Service', () => {
  beforeEach(() => {
    axios.get.mockClear();
    console.log('🔒 Test environment initialized - No real API calls will be made');
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('fetches all destinations successfully', async () => {
    // Mock data
    const destinations = [
      { _id: '1', name: 'AlUla', description: 'Historic site', locationCity: 'AlUla', rating: 4.8 },
      { _id: '2', name: 'Edge of the World', description: 'Scenic cliff', locationCity: 'Riyadh', rating: 4.9 }
    ];
    
    // Set up mock response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Destinations fetched successfully',
        data: destinations
      }
    });
    
    // Call service function
    const result = await destinationService.getAllDestinations();
    
    // Assertions
    expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations`);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].name).toBe('AlUla');
    expect(result.data[1].name).toBe('Edge of the World');
  });
  
  it('handles error when fetching all destinations', async () => {
    // Set up mock error response
    axios.get.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Server error occurred'
        }
      }
    });
    
    // Assertions
    await expect(destinationService.getAllDestinations()).rejects.toThrow('Server error occurred');
    expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations`);
  });
  
  it('fetches destination by ID successfully', async () => {
    // Mock data
    const destination = {
      _id: '1',
      name: 'AlUla',
      description: 'Historic site with ancient tombs',
      locationCity: 'AlUla',
      images: ['image1.jpg', 'image2.jpg'],
      rating: 4.8,
      category: 'Historical',
      priceRange: 'Medium',
      openingHours: '9:00 AM - 5:00 PM',
      contactInfo: {
        phone: '+966 123 456 789',
        email: 'info@alula.sa',
        website: 'www.alula.sa'
      }
    };
    
    // Set up mock response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Destination fetched successfully',
        data: destination
      }
    });
    
    // Call service function
    const result = await destinationService.getDestinationById('1');
    
    // Assertions
    expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations/1`);
    expect(result.success).toBe(true);
    expect(result.data._id).toBe('1');
    expect(result.data.name).toBe('AlUla');
    expect(result.data.rating).toBe(4.8);
  });
  
  it('handles error when fetching destination by invalid ID', async () => {
    // Set up mock error response
    axios.get.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Destination not found'
        }
      }
    });
    
    // Assertions
    await expect(destinationService.getDestinationById('999')).rejects.toThrow('Destination not found');
    expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations/999`);
  });
  
  it('fetches destinations by filter successfully', async () => {
    // Mock data
    const filteredDestinations = [
      { _id: '1', name: 'AlUla', locationCity: 'AlUla', category: 'Historical', rating: 4.8 }
    ];
    
    // Filter parameters
    const filters = {
      category: 'Historical',
      minRating: 4.5,
      maxPrice: 'Medium'
    };
    
    // Set up mock response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Filtered destinations fetched successfully',
        data: filteredDestinations
      }
    });
    
    // Call service function
    const result = await destinationService.getDestinationsByFilter(filters);
    
    // Assertions
    expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations/filter`, { params: filters });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].category).toBe('Historical');
    expect(result.data[0].rating).toBe(4.8);
  });
  
  it('handles zero results from filter', async () => {
    // Filter parameters for zero results
    const filters = {
      category: 'NonExistent',
      minRating: 5.0
    };
    
    // Set up mock response with empty array
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'No destinations match the criteria',
        data: []
      }
    });
    
    // Call service function
    const result = await destinationService.getDestinationsByFilter(filters);
    
    // Assertions
    expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations/filter`, { params: filters });
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(0);
    expect(result.message).toBe('No destinations match the criteria');
  });
  
  it('fetches popular destinations successfully', async () => {
    // Mock data
    const popularDestinations = [
      { _id: '1', name: 'AlUla', locationCity: 'AlUla', rating: 4.8, popularity: 98 },
      { _id: '2', name: 'Edge of the World', locationCity: 'Riyadh', rating: 4.9, popularity: 95 }
    ];
    
    // Set up mock response
    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'Popular destinations fetched successfully',
        data: popularDestinations
      }
    });
    
    // Call service function
    const result = await destinationService.getPopularDestinations();
    
    // Assertions
    expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations/popular`);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].popularity).toBe(98);
    expect(result.data[1].popularity).toBe(95);
  });
});
