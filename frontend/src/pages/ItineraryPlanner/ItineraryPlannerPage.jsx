import React, { useState, useEffect } from 'react';
import { ItineraryProvider } from '../../context/ItineraryContext';
import { useAuth } from '../../context/AuthContext';
import ItineraryForm from '../../components/ItineraryPlanner/ItineraryForm';
import LoginPromptModal from '../../components/LoginPromptModal/LoginPromptModal';
import './ItineraryPlannerPage.css';

const ItineraryPlannerPage = () => {
  const { user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [contentVisible, setContentVisible] = useState(true);

  // Check if user is authenticated when component mounts
  useEffect(() => {
    // Only show the login prompt if the user is not authenticated
    if (!user) {
      setShowLoginPrompt(true);
    }
  }, [user]);

  // Close the login prompt modal
  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
    // Show the form content even if not logged in
    // This allows users to still browse the UI
    setContentVisible(true);
  };

  return (
    <div className="itinerary-planner-page">
      <div className="itinerary-planner-header">
        <h1>AI Travel Planner</h1>
        <p>Create your perfect trip with our personalized itinerary generator</p>
      </div>
      
      {/* Show login prompt if user is not authenticated */}
      <LoginPromptModal 
        isOpen={showLoginPrompt} 
        onClose={handleCloseLoginPrompt}
        message="Please log in to create and save personalized travel itineraries."
        title="Sign in to create your itinerary"
      />
      
      {contentVisible && (
        <ItineraryProvider>
          <ItineraryForm />
        </ItineraryProvider>
      )}
    </div>
  );
};

export default ItineraryPlannerPage;
