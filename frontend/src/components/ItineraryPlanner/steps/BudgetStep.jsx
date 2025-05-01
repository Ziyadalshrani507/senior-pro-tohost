import React from 'react';
import { useItinerary } from '../../../context/ItineraryContext';
import './Steps.css';

const BudgetStep = () => {
  const { formData, updateFormData, nextStep, prevStep } = useItinerary();

  const budgetOptions = [
    { id: 'Low', label: 'Budget', description: 'Economy options, public transport', icon: '💰' },
    { id: 'Medium', label: 'Moderate', description: 'Mid-range hotels, some nice restaurants', icon: '💰💰' },
    { id: 'Luxury', label: 'Luxury', description: 'High-end hotels, fine dining', icon: '💰💰💰' }
  ];

  const handleSelect = (budget) => {
    updateFormData({ budget });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-container">
      <h2>What is your budget?</h2>
      <p>Select a budget level for your trip</p>
      
      <form onSubmit={handleSubmit}>
        <div className="budget-options">
          {budgetOptions.map((option) => (
            <div
              key={option.id}
              className={`budget-card ${formData.budget === option.id ? 'selected' : ''}`}
              onClick={() => handleSelect(option.id)}
            >
              <div className="budget-icon">{option.icon}</div>
              <h3>{option.label}</h3>
              <p>{option.description}</p>
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
    </div>
  );
};

export default BudgetStep;
