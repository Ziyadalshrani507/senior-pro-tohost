import React, { useState, useEffect } from 'react';
import { useItinerary } from '../../../context/ItineraryContext';
import { FaCalendarAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './Steps.css';

const DurationStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useItinerary();
  const [selectedDuration, setSelectedDuration] = useState(formData.duration || 3);
  const [animateValue, setAnimateValue] = useState(false);

  // Apply changes and animation when slider or buttons are used
  const handleDurationChange = (value) => {
    setSelectedDuration(value);
    setAnimateValue(true);
    updateFormData({ duration: value });
  };

  // Reset animation state after it completes
  useEffect(() => {
    if (animateValue) {
      const timer = setTimeout(() => setAnimateValue(false), 600);
      return () => clearTimeout(timer);
    }
  }, [animateValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  // Predefined duration options
  const durationOptions = [1, 2, 3, 4, 5, 7];

  return (
    <div className="step-container duration-step">
      <div className="step-header">
        <h2><FaCalendarAlt className="step-icon" /> How many days is your trip?</h2>
        <p>Select the duration of your stay</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="duration-card">
          <div className="duration-display">
            <div className={`duration-value ${animateValue ? 'pulse' : ''}`}>{selectedDuration}</div>
            <div className="duration-label">days</div>
          </div>
          
          <div className="duration-slider-container">
            <input
              type="range"
              min="1"
              max="14"
              value={selectedDuration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value))}
              className="enhanced-slider"
            />
            <div className="slider-markers">
              <span>1</span>
              <span>7</span>
              <span>14</span>
            </div>
          </div>
          
          <div className="duration-options-container">
            <p className="options-label">Quick selection</p>
            <div className="duration-options">
              {durationOptions.map((days) => (
                <button
                  key={days}
                  type="button"
                  className={`duration-option ${selectedDuration === days ? 'selected' : ''}`}
                  onClick={() => handleDurationChange(days)}
                >
                  {days}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="navigation-buttons">
          <button type="button" onClick={prevStep} className="prev-button">
            <FaArrowLeft /> Back
          </button>
          <button type="submit" className="next-button">
            Next <FaArrowRight />
          </button>
        </div>
      </form>
    </div>
  );
};

export default DurationStep;
