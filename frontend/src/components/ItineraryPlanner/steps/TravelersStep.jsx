import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useItinerary } from '../../../context/ItineraryContext';
import { getApiBaseUrl } from '../../../utils/apiBaseUrl';
import './Steps.css';

const TravelersStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useItinerary();
  const [travelerOptions, setTravelerOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mapping from destination categories to traveler types with icons
  const categoryToTravelerMap = {
    'Family-friendly': { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    'Solo-traveler': { id: 'Solo', label: 'Solo Traveler', icon: '👤' },
    'Group-traveler': { id: 'Group', label: 'Group of Friends', icon: '👥' },
    // We'll add a Couple option as default since it's common but might not be in categories
    'defaultCouple': { id: 'Couple', label: 'Couple', icon: '👫' }
  };
  
  useEffect(() => {
    const fetchTravelerOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiBaseUrl = getApiBaseUrl();
        const response = await axios.get('/destinations/schema-options');
        
        if (response.data && response.data.categories) {
          const relevantCategories = response.data.categories.filter(category => 
            ['Family-friendly', 'Solo-traveler', 'Group-traveler'].includes(category)
          );
          
          // Map categories to traveler options
          let options = relevantCategories.map(category => 
            categoryToTravelerMap[category]
          );
          
          // Always include Couple option if not already present
          if (!options.find(opt => opt.id === 'Couple')) {
            options.push(categoryToTravelerMap.defaultCouple);
          }
          
          // Sort options by a sensible order: Solo, Couple, Family, Group
          const orderMap = { 'Solo': 1, 'Couple': 2, 'Family': 3, 'Group': 4 };
          options.sort((a, b) => orderMap[a.id] - orderMap[b.id]);
          
          setTravelerOptions(options);
        } else {
          // Fallback options if API doesn't return expected data
          setTravelerOptions([
            { id: 'Solo', label: 'Solo Traveler', icon: '👤' },
            { id: 'Couple', label: 'Couple', icon: '👫' },
            { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
            { id: 'Group', label: 'Group of Friends', icon: '👥' }
          ]);
        }
      } catch (err) {
        console.error('Error fetching traveler options:', err);
        setError('Failed to load traveler options');
        
        // Fallback options if API fails
        setTravelerOptions([
          { id: 'Solo', label: 'Solo Traveler', icon: '👤' },
          { id: 'Couple', label: 'Couple', icon: '👫' },
          { id: 'Family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
          { id: 'Group', label: 'Group of Friends', icon: '👥' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTravelerOptions();
  }, []);

  const handleSelect = (travelersType) => {
    updateFormData({ travelersType });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>Who are you traveling with?</h2>
      <p>Select your travel group</p>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-container-spinner"></div>
          <p>Loading traveler options...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>

        <div className="travelers-options">
          {travelerOptions.map((option) => (
            <div
              key={option.id}
              className={`traveler-card ${formData.travelersType === option.id ? 'selected' : ''}`}
              onClick={() => handleSelect(option.id)}
            >
              <div className="traveler-icon">{option.icon}</div>
              <h3>{option.label}</h3>
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

export default TravelersStep;
