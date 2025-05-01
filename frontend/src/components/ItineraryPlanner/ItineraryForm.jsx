import React from 'react';
import { useItinerary } from '../../context/ItineraryContext';
import DestinationStep from './steps/DestinationStep';
import DurationStep from './steps/DurationStep';
import InterestsStep from './steps/InterestsStep';
import FoodPreferencesStep from './steps/FoodPreferencesStep';
import BudgetStep from './steps/BudgetStep';
import TravelersStep from './steps/TravelersStep';
import ReviewStep from './steps/ReviewStep';
import './ItineraryForm.css';

const ItineraryForm = () => {
  const { currentStep } = useItinerary();

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <DestinationStep />;
      case 2:
        return <DurationStep />;
      case 3:
        return <InterestsStep />;
      case 4:
        return <FoodPreferencesStep />;
      case 5:
        return <BudgetStep />;
      case 6:
        return <TravelersStep />;
      case 7:
        return <ReviewStep />;
      default:
        return <DestinationStep />;
    }
  };

  return (
    <div className="itinerary-form-container">
      <div className="progress-bar">
        <div 
          className="progress" 
          style={{ width: `${(currentStep / 7) * 100}%` }}
        ></div>
      </div>
      <div className="step-indicators">
        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
          <div 
            key={step} 
            className={`step ${currentStep >= step ? 'active' : ''}`}
          >
            {step}
          </div>
        ))}
      </div>
      {renderStep()}
    </div>
  );
};

export default ItineraryForm;
