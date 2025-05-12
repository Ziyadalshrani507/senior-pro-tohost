import React, { useState, useEffect } from 'react';
import { useItinerary } from '../../../context/ItineraryContext';
import axios from 'axios';
import { getApiBaseUrl } from '../../../utils/apiBaseUrl';
import './Steps.css';

const DestinationStep = () => {
  const { formData, updateFormData, nextStep } = useItinerary();
  const [cities, setCities] = useState([]);
  const [cityImages, setCityImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const citiesPerPage = 6;


  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Get all destinations from the API using the baseUrl utility
        const apiBaseUrl = getApiBaseUrl();
        const response = await axios.get('/destinations');
        
        if (response.data && response.data.length > 0) {
          // Create a map of cities to their image URLs
          const imageMap = {};
          const allCities = [];
          
          // Process all destinations
          response.data.forEach(destination => {
            if (destination.locationCity) {
              allCities.push(destination.locationCity);
              
              // Get image URL from destination if available
              if (destination.pictureUrls && destination.pictureUrls.length > 0) {
                // If we already have an image for this city, only replace it if this one is better
                if (!imageMap[destination.locationCity]) {
                  imageMap[destination.locationCity] = destination.pictureUrls[0];
                }
              }
            }
          });
          
          // Remove duplicates from cities
          const uniqueCities = [...new Set(allCities.filter(city => city))];
          
          if (uniqueCities.length > 0) {
            setCities(uniqueCities);
            setCityImages(imageMap);
          } else {
            setError('No cities found in the database');
          }
        } else {
          // No data available
          setError('No destination data available');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError('Failed to load cities');
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleSelect = (city) => {
    updateFormData({ 
      city: city,
      destinationName: city 
    });
    nextStep();
  };

  if (loading) return <div className="loading">Loading destinations...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="step-container">
      <h2>Where do you want to go?</h2>
      <p>Select a city for your trip</p>
      
      <div className="step-destinations-grid">
        {cities && cities.length > 0 ? (
          // Display only the cities for the current page
          cities
            .slice(currentPage * citiesPerPage, (currentPage + 1) * citiesPerPage)
            .map((city) => (
              <div 
                key={city}
                className={`step-destination-card ${formData.city === city ? 'selected' : ''}`}
                onClick={() => handleSelect(city)}
              >
                <div className="step-destination-image">
                  <img 
                      src={cityImages[city] || `/assets/saudi-landmark.jpg`} 
                      alt={city} 
                      loading="lazy"
                    />
                </div>
                <h3>{city}</h3>
                <p>Saudi Arabia</p>
              </div>
            ))
        ) : loading ? (
          <div className="loading-container">
            <div className="loading-container-spinner"></div>
            <p>Loading cities...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <div className="no-destinations">
            <p>No cities available. Please check back later.</p>
          </div>
        )}
      </div>
      
      {/* Pagination controls always shown if cities exist */}
      {cities && cities.length > 0 && (
        <div className="pagination-controls">
          <button 
            className="pagination-button prev"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            type="button"
          >
            <i className="bi bi-chevron-left"></i> Previous
          </button>
          
          <span className="page-indicator">
            Page {currentPage + 1} of {Math.max(1, Math.ceil(cities.length / citiesPerPage))}
          </span>
          
          <button 
            className="pagination-button next"
            onClick={() => setCurrentPage(prev => Math.min(Math.ceil(cities.length / citiesPerPage) - 1, prev + 1))}
            disabled={currentPage >= Math.ceil(cities.length / citiesPerPage) - 1 || cities.length <= citiesPerPage}
            type="button"
          >
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default DestinationStep;
