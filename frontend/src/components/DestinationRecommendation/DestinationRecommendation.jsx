import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLastDestination } from '../../utils/cookieUtils';
import './DestinationRecommendation.css';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const DestinationRecommendation = () => {
  const [lastDestination, setLastDestination] = useState('');
  const [recommendedDestination, setRecommendedDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = getApiBaseUrl();

  useEffect(() => {
    // Get the last searched destination from the cookie
    const destination = getLastDestination();
    if (destination) {
      setLastDestination(destination);
      fetchRecommendedDestination(destination);
    }
  }, []);

  const fetchRecommendedDestination = async (searchTerm) => {
    if (!searchTerm) return;
    
    setLoading(true);
    try {
      // Search for destinations matching the last search term
      const response = await fetch(`${API_BASE_URL}/destinations?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to fetch destination');
      
      const data = await response.json();
      
      // If we have results, show the first one as a recommendation
      if (data && data.length > 0) {
        setRecommendedDestination(data[0]);
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  // If no last destination or no recommendations found, don't render anything
  if (!lastDestination || !recommendedDestination) {
    return null;
  }

  return (
    <div className="destination-recommendation">
      <div className="recommendation-content">
        <div className="recommendation-text">
          <h3>Based on your last search: "{lastDestination}"</h3>
          <h4>We recommend: {recommendedDestination.name}</h4>
          <p>{recommendedDestination.description?.substring(0, 120)}...</p>
          <Link 
            to={`/destinations/${recommendedDestination._id}`} 
            className="view-destination-btn"
          >
            View Destination
          </Link>
        </div>
        {recommendedDestination.pictureUrls && recommendedDestination.pictureUrls[0] && (
          <div className="recommendation-image">
            <img 
              src={recommendedDestination.pictureUrls[0]} 
              alt={recommendedDestination.name} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationRecommendation;