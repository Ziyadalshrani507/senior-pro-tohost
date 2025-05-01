import React from 'react';
import { ItineraryProvider } from '../../context/ItineraryContext';
import ItineraryForm from '../../components/ItineraryPlanner/ItineraryForm';
import './ItineraryPlannerPage.css';

const ItineraryPlannerPage = () => {
  return (
    <div className="itinerary-planner-page">
      <div className="itinerary-planner-header">
        <h1>AI Travel Planner</h1>
        <p>Create your perfect trip with our personalized itinerary generator</p>
      </div>
      
      <ItineraryProvider>
        <ItineraryForm />
      </ItineraryProvider>
    </div>
  );
};

export default ItineraryPlannerPage;
