import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './DestinationDetails.css';

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const response = await fetch(`/api/destinations/activities/${id}`);
        if (!response.ok) throw new Error('Failed to fetch destination details');
        const data = await response.json();
        setDestination(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching destination:', error);
        toast.error('Failed to load destination details');
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  if (loading) {
    return (
      <div className="destination-details-page">
        <div className="loading">Loading destination details...</div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="destination-details-page">
        <div className="error-message">Destination not found</div>
      </div>
    );
  }

  return (
    <div className="destination-details-page">
      <div className="destination-details-container">
        <button className="back-button" onClick={() => navigate('/destinations')}>
          ← Back to Destinations
        </button>

        <div className="destination-header">
          <h1>{destination.name}</h1>
          <div className="destination-meta">
            <span className="location">📍 {destination.locationCity}</span>
            <span className="type">{destination.type}</span>
            <span className="cost">
              {typeof destination.cost === 'number' 
                ? `${destination.cost} SAR`
                : 'Price not available'}
            </span>
          </div>
        </div>

        <div className="destination-content">
          <div className="main-info">
            <div className="description">
              <h2>About this Destination</h2>
              <p>{destination.description}</p>
            </div>

            {destination.categories && destination.categories.length > 0 && (
              <div className="categories">
                <h2>Categories</h2>
                <div className="categories-list">
                  {destination.categories.map((category, index) => (
                    <span key={index} className="category-tag">{category}</span>
                  ))}
                </div>
              </div>
            )}

            {destination.features && destination.features.length > 0 && (
              <div className="features">
                <h2>Features</h2>
                <ul className="features-list">
                  {destination.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="additional-info">
            {destination.openingHours && (
              <div className="opening-hours">
                <h2>Opening Hours</h2>
                <p>{destination.openingHours}</p>
              </div>
            )}

            {destination.contact && (
              <div className="contact-info">
                <h2>Contact Information</h2>
                {destination.contact.phone && (
                  <p>
                    <strong>Phone:</strong>{' '}
                    <a href={`tel:${destination.contact.phone}`}>
                      {destination.contact.phone}
                    </a>
                  </p>
                )}
                {destination.contact.email && (
                  <p>
                    <strong>Email:</strong>{' '}
                    <a href={`mailto:${destination.contact.email}`}>
                      {destination.contact.email}
                    </a>
                  </p>
                )}
                {destination.contact.website && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a href={destination.contact.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </p>
                )}
              </div>
            )}

            {destination.address && (
              <div className="address">
                <h2>Address</h2>
                <p>{destination.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
