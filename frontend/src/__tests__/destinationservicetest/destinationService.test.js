import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { mockApiSuccess, mockApiError, destinations } from '../../test/apiMocks';
import getApiBaseUrl from '../../utils/apiBaseUrl';

// You'd normally import your actual service
// For demonstration, we'll create a simple version of what your destination service might look like
const destinationService = {
  getAllDestinations: async (filters = {}) => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/destinations`, { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getDestinationById: async (id) => {
    try {
      const response = await axios.get(`${getApiBaseUrl()}/destinations/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  likeDestination: async (id) => {
    try {
      const response = await axios.post(`${getApiBaseUrl()}/destinations/${id}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

describe('Destination Service', () => {
  // Reset all mocks after each test
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  describe('getAllDestinations', () => {
    it('should fetch all destinations successfully', async () => {
      // Set up the mock to return our pre-defined test data
      mockApiSuccess(`${getApiBaseUrl()}/destinations`, destinations);
      
      // Call the service method
      const result = await destinationService.getAllDestinations();
      
      // Verify the result contains our test data
      expect(result.success).toBe(true);
      expect(result.data).toEqual(destinations);
      
      // Verify axios.get was called with the correct URL
      expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations`, { params: {} });
    });
    
    it('should apply filters when provided', async () => {
      // Set up the mock
      mockApiSuccess(`${getApiBaseUrl()}/destinations`, [destinations[0]]);
      
      // Call with filters
      const filters = { city: 'AlUla', type: 'Historical' };
      await destinationService.getAllDestinations(filters);
      
      // Verify correct params were passed
      expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations`, { 
        params: filters 
      });
    });
    
    it('should handle API errors gracefully', async () => {
      // Set up the mock to return an error
      mockApiError(`${getApiBaseUrl()}/destinations`, 'Failed to fetch destinations');
      
      // Expect the service to throw the error
      await expect(destinationService.getAllDestinations()).rejects.toEqual(
        expect.objectContaining({
          success: false,
          message: 'Failed to fetch destinations'
        })
      );
    });
  });
  
  describe('getDestinationById', () => {
    it('should fetch a single destination by ID', async () => {
      const destination = destinations[0];
      
      // Set up the mock
      mockApiSuccess(`${getApiBaseUrl()}/destinations/${destination._id}`, destination);
      
      // Call the service method
      const result = await destinationService.getDestinationById(destination._id);
      
      // Verify results
      expect(result.success).toBe(true);
      expect(result.data).toEqual(destination);
      
      // Verify correct URL was called
      expect(axios.get).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations/${destination._id}`);
    });
    
    it('should handle not found errors', async () => {
      const nonExistentId = 'non-existent-id';
      
      // Set up the mock to return a 404 error
      mockApiError(`${getApiBaseUrl()}/destinations/${nonExistentId}`, 'Destination not found', 404);
      
      // Expect the service to throw the error
      await expect(destinationService.getDestinationById(nonExistentId)).rejects.toEqual(
        expect.objectContaining({
          success: false,
          message: 'Destination not found'
        })
      );
    });
  });
  
  describe('likeDestination', () => {
    it('should like a destination successfully', async () => {
      const destinationId = destinations[0]._id;
      
      // Set up the mock
      mockApiSuccess(`${getApiBaseUrl()}/destinations/${destinationId}/like`, { liked: true });
      
      // Call the service method
      const result = await destinationService.likeDestination(destinationId);
      
      // Verify results
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ liked: true });
      
      // Verify correct URL and method were called
      expect(axios.post).toHaveBeenCalledWith(`${getApiBaseUrl()}/destinations/${destinationId}/like`);
    });
    
    it('should handle unauthorized errors when liking without authentication', async () => {
      const destinationId = destinations[0]._id;
      
      // Set up the mock to return a 401 error
      mockApiError(`${getApiBaseUrl()}/destinations/${destinationId}/like`, 'Authentication required', 401);
      
      // Expect the service to throw the error
      await expect(destinationService.likeDestination(destinationId)).rejects.toEqual(
        expect.objectContaining({
          success: false,
          message: 'Authentication required'
        })
      );
    });
  });
});
