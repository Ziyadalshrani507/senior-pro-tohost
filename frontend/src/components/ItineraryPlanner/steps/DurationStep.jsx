import React from 'react';
import { useItinerary } from '../../../context/ItineraryContext';
import './Steps.css';

const DurationStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useItinerary();

  const handleChange = (e) => {
    updateFormData({ duration: parseInt(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>How many days is your trip?</h2>
      <p>Select the duration of your stay</p>
      
      <form onSubmit={handleSubmit}>
        <div className="duration-slider">
          <input
            type="range"
            min="1"
            max="14"
            value={formData.duration}
            onChange={handleChange}
          />
          <div className="duration-value">{formData.duration} days</div>
        </div>
        
        <div className="duration-options">
          {[1, 3, 5, 7, 10, 14].map((days) => (
            <button
              key={days}
              type="button"
              className={`duration-option ${formData.duration === days ? 'selected' : ''}`}
              onClick={() => updateFormData({ duration: days })}
            >
              {days} days
            </button>
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
    </div>
  );
};

export default DurationStep;
