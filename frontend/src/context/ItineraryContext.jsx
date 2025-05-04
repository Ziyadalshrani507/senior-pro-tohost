import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/apiBaseUrl';
import { toast } from 'react-toastify';

const ItineraryContext = createContext();

export const useItinerary = () => useContext(ItineraryContext);

export const ItineraryProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    city: '',
    duration: 3,
    interests: [],
    foodPreferences: {
      cuisines: [],
      categories: []
    },
    budget: 'Medium',
    travelersType: 'Solo'
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [userItineraries, setUserItineraries] = useState([]);

  // Update form data
  const updateFormData = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Navigate between steps
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  
  // Reset the form
  const resetForm = () => {
    setFormData({
      city: '',
      duration: 3,
      interests: [],
      foodPreferences: {
        cuisines: [],
        categories: []
      },
      budget: 'Medium',
      travelersType: 'Solo'
    });
    setCurrentStep(1);
    setGeneratedItinerary(null);
    setError(null);
  };

  // Generate itinerary
  const generateItinerary = async () => {
    setIsGenerating(true);
    setError(null);
    
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to generate an itinerary');
      setIsGenerating(false);
      return null;
    }
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      console.log('Using API base URL:', apiBaseUrl);
      console.log('Using auth token:', token.substring(0, 10) + '...');
      console.log('Sending form data:', formData);
      
      // Ensure we're using the correct endpoint with /api prefix if needed
      const endpoint = apiBaseUrl.includes('/api') 
        ? `${apiBaseUrl}/itinerary/generate` 
        : `${apiBaseUrl}/api/itinerary/generate`;
      
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Itinerary response:', response.data);
      setGeneratedItinerary(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error generating itinerary:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to generate itinerary');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };



  // Fetch user itineraries
  const fetchUserItineraries = async () => {
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      setUserItineraries([]);
      return;
    }

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/itinerary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Filter out any temporary or expired itineraries
        const savedItineraries = response.data.data.filter(itinerary => 
          !itinerary.isTemporary && !itinerary.expiresAt
        );
        setUserItineraries(savedItineraries);
      } else {
        setUserItineraries([]);
      }
    } catch (error) {
      console.error('Error fetching user itineraries:', error);
      setUserItineraries([]);
    }
  };

  // Fetch a single itinerary
  const fetchItinerary = async (id) => {
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to view this itinerary');
      return null;
    }
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.get(`${apiBaseUrl}/itinerary/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      setError(error.response?.data?.message || 'Failed to fetch itinerary');
      return null;
    }
  };

  // Update an itinerary
  const updateItinerary = async (id, data) => {
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to update this itinerary');
      return null;
    }
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.put(`${apiBaseUrl}/itinerary/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating itinerary:', error);
      setError(error.response?.data?.message || 'Failed to update itinerary');
      return null;
    }
  };

  // Delete an itinerary
  const deleteItinerary = async (id) => {
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to delete this itinerary');
      return false;
    }
    
    try {
      // Optimistically update UI first
      setUserItineraries(prevItineraries => 
        prevItineraries.filter(itinerary => itinerary._id !== id)
      );

      const apiBaseUrl = getApiBaseUrl();
      const response = await axios.delete(`${apiBaseUrl}/itinerary/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        return true;
      } else {
        // If delete failed, revert the UI
        await fetchUserItineraries();
        return false;
      }
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      setError(error.response?.data?.message || 'Failed to delete itinerary');
      // If delete failed, revert the UI
      await fetchUserItineraries();
      return false;
    }
  };

  // Save a temporary itinerary to user account
  const saveItinerary = async (itineraryId, customName = null) => {
    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to save this itinerary');
      return null;
    }
    
    try {
      const apiBaseUrl = getApiBaseUrl();
      // Prepare data for saving
      const saveData = {
        itineraryId: itineraryId,
      };
      
      // Add custom name if provided
      if (customName) {
        saveData.name = customName;
      }
      
      const response = await axios.post(`${apiBaseUrl}/itinerary/save`, saveData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update our local state if saving was successful
      if (response.data.success) {
        setUserItineraries(prev => [response.data.data, ...prev]);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      setError(error.response?.data?.message || 'Failed to save itinerary');
      return null;
    }
  };

  return (
    <ItineraryContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        nextStep,
        prevStep,
        generateItinerary,
        generatedItinerary,
        isGenerating,
        error,
        resetForm,
        userItineraries,
        fetchUserItineraries,
        fetchItinerary,
        updateItinerary,
        deleteItinerary,
        saveItinerary
      }}
    >
      {children}
    </ItineraryContext.Provider>
  );
};
