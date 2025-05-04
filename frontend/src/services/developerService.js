import { getApiBaseUrl } from '../utils/apiBaseUrl';

const API_BASE_URL = getApiBaseUrl();

// Get the authenticated developer's profile
export const getDeveloperProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/developers/profile/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch developer profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching developer profile:', error);
    throw error;
  }
};

// Get a developer by ID
export const getDeveloperById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/developers/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch developer');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching developer with ID ${id}:`, error);
    throw error;
  }
};

// Create or update developer profile
export const updateDeveloperProfile = async (developerData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/developers/profile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(developerData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update developer profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating developer profile:', error);
    throw error;
  }
};

// Upload developer photo
export const uploadDeveloperPhoto = async (photoFile) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('photo', photoFile);

    const response = await fetch(`${API_BASE_URL}/developers/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload photo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading developer photo:', error);
    throw error;
  }
};

// Get all developers
export const getAllDevelopers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/developers`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch developers');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching all developers:', error);
    throw error;
  }
};