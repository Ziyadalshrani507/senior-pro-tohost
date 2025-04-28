import React, { useState, useEffect } from 'react';
import './Tours.css';
import captionImage from './caption.jpg';
import DestinationRecommendation from '../../components/DestinationRecommendation/DestinationRecommendation';
import { getLastDestination } from '../../utils/cookieUtils';

const Tours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasLastDestination, setHasLastDestination] = useState(false);

  useEffect(() => {
    // Check if there's a last searched destination
    const lastDestination = getLastDestination();
    setHasLastDestination(!!lastDestination);
    
    const fetchTours = async () => {
      try {
        const response = await fetch('/api/tours');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTours(data);
      } catch (error) {
        console.error('Error fetching tours:', error);
        setError('Failed to load tours. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  return (
    <div className="tours-page">
      <div className="hero-section">
        <h1>Explore Our Tours</h1>
        <p>Handpicked routes and adventures across our regions</p>
        <img src={captionImage} alt="Tours Hero" className="hero-image" />
      </div>

      {/* Display destination recommendation if user has a previous search */}
      <DestinationRecommendation />

      {loading && <p>Loading tours...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && tours.map((tour, index) => (
        <section key={tour.id} className={`tour-section ${index % 2 === 0 ? 'image-left' : 'image-right'}`}>
          <div className="tour-content">
            <h2>{tour.title}</h2>
            <p>{tour.description}</p>
            <div className="tour-meta">
              <p><strong>Level:</strong> {tour.level}</p>
              <p><strong>Duration:</strong> {tour.duration}</p>
              <p><strong>Length:</strong> {tour.length}</p>
            </div>
            <button className="cta-button">Route Coordinates</button>
          </div>
          <div className="tour-image">
            <img src={tour.image} alt={tour.title} />
          </div>
        </section>
      ))}

      <div className="cta-banner">
        <h2>Plan a Tour With Us</h2>
        <button className="cta-button">Talk to Our Experts</button>
      </div>
    </div>
  );
};

export default Tours;