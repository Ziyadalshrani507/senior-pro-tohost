import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useItinerary } from '../../../context/ItineraryContext';
import { getApiBaseUrl } from '../../../utils/apiBaseUrl';
import './Steps.css';

const InterestsStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useItinerary();
  const [interestOptions, setInterestOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping for destination types
  const typeIconMap = {
    'Historical': '📜',
    'Adventure': '🧗‍♂️',
    'Cultural': '🏛️',
    'Experiences': '✨',
    'Theater and arts': '🎭',
    'Concerts': '🎸',
    'Sports': '⚽️',
    'Food': '🍽️',
    'Music': '🎶',
    // Fallback icon
    'default': '📍'
  };
  
  useEffect(() => {
    const fetchInterestOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiBaseUrl = getApiBaseUrl();
        const response = await axios.get(`${apiBaseUrl}/destinations/schema-options`);
        
        // Process destination types into interest options
        if (response.data && response.data.types) {
          const processedInterests = response.data.types.map(type => ({
            id: type.toLowerCase().replace(/\s+/g, '_'),
            label: type,
            icon: typeIconMap[type] || typeIconMap.default
          }));
          
          setInterestOptions(processedInterests);
        } else {
          // Fallback options if API doesn't return expected data
          setInterestOptions([
            { id: 'culture', label: 'Culture', icon: '🏛️' },
            { id: 'adventure', label: 'Adventure', icon: '🧗‍♂️' },
            { id: 'food', label: 'Food', icon: '🍽️' },
            { id: 'history', label: 'History', icon: '📜' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching interest options:', err);
        setError('Failed to load interest options');
        
        // Fallback options if API fails
        setInterestOptions([
          { id: 'culture', label: 'Culture', icon: '🏛️' },
          { id: 'adventure', label: 'Adventure', icon: '🧗‍♂️' },
          { id: 'food', label: 'Food', icon: '🍽️' },
          { id: 'history', label: 'History', icon: '📜' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterestOptions();
  }, []);

  const toggleInterest = (interest) => {
    const updatedInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    updateFormData({ interests: updatedInterests });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.interests.length > 0) {
      nextStep();
    } else {
      alert('Please select at least one interest');
    }
  };

  return (
    <div className="step-container">
      <h2>What are your interests?</h2>
      <p>Select the activities you enjoy (choose at least one)</p>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-container-spinner"></div>
          <p>Loading interest options...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>

        <div className="interests-grid">
          {interestOptions.map((option) => (
            <div
              key={option.id}
              className={`interest-card ${formData.interests.includes(option.id) ? 'selected' : ''}`}
              onClick={() => toggleInterest(option.id)}
            >
              <div className="interest-icon">{option.icon}</div>
              <div className="interest-label">{option.label}</div>
            </div>
          ))}
        </div>
        
        <div className="navigation-buttons">
          <button type="button" onClick={prevStep} className="prev-button">
            Back
          </button>
          <button type="submit" className="next-button">
            Next
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default InterestsStep;
