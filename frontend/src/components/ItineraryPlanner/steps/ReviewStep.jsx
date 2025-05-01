import React from 'react';
import { useItinerary } from '../../../context/ItineraryContext';
import { useNavigate } from 'react-router-dom';
import './Steps.css';

const ReviewStep = () => {
  const { 
    formData, 
    prevStep, 
    generateItinerary, 
    isGenerating,
    error 
  } = useItinerary();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await generateItinerary();
    if (result) {
      navigate(`/itinerary/${result._id}`);
    }
  };

  // Get interest labels for display
  const getInterestLabels = () => {
    const interestMap = {
      'culture': 'Culture',
      'adventure': 'Adventure',
      'relaxation': 'Relaxation',
      'food': 'Food',
      'shopping': 'Shopping',
      'nature': 'Nature',
      'nightlife': 'Nightlife',
      'history': 'History'
    };
    
    return formData.interests.map(id => interestMap[id] || id).join(', ');
  };

  return (
    <div className="step-container">
      <h2>Review Your Trip Details</h2>
      <p>Please review your travel preferences before generating your itinerary</p>
      
      <div className="review-summary">
        <div className="review-item">
          <span>Destination:</span>
          <span className="review-value">{formData.destinationName || 'Selected destination'}</span>
        </div>
        <div className="review-item">
          <span>Duration:</span>
          <span className="review-value">{formData.duration} days</span>
        </div>
        <div className="review-item">
          <span>Interests:</span>
          <span className="review-value">{getInterestLabels()}</span>
        </div>
        <div className="review-item">
          <span>Budget:</span>
          <span className="review-value">{formData.budget}</span>
        </div>
        <div className="review-item">
          <span>Travel Group:</span>
          <span className="review-value">{formData.travelersType}</span>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="navigation-buttons">
        <button type="button" onClick={prevStep} className="prev-button">
          Back
        </button>
        <button 
          onClick={handleSubmit} 
          className="generate-button"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="button-spinner"></span>
              Generating...
            </>
          ) : (
            'Generate My Trip'
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
