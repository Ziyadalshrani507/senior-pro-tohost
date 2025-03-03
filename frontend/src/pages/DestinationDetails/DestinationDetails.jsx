import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import Rating from '../../components/Rating/Rating';
import './DestinationDetails.css';

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const response = await fetch(`/api/destinations/${id}`);
        if (!response.ok) {
          throw new Error('Destination not found');
        }
        const data = await response.json();
        setDestination(data);
        console.log('Destination data:', data); // Debug log
      } catch (error) {
        console.error('Error fetching destination:', error);
        toast.error('Failed to load destination details');
        navigate('/destinations');
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id, navigate]);

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
      <button className="back-button" onClick={() => navigate('/destinations')}>
        <FaArrowLeft /> Back to Destinations
      </button>

      <div className="destination-details-container">
        <div className="destination-header">
          <h1>{destination.name}</h1>
          <div className="destination-meta">
            <span className="location">
              <FaMapMarkerAlt /> {destination.locationCity}
            </span>
            <span className="type">
              <FaTag /> {destination.type}
            </span>
          </div>
        </div>

        <div className="image-gallery">
          {destination.pictureUrls && destination.pictureUrls.length > 0 ? (
            <div className="gallery-grid">
              {destination.pictureUrls.map((url, index) => (
                <div key={index} className="gallery-item">
                  <img src={url} alt={`${destination.name} - ${index + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          ) : (
            <p className="no-images">No images available</p>
          )}
        </div>

        <div className="destination-content">
          <div className="description">
            <h2>About</h2>
            <p>{destination.description || 'No description available'}</p>
          </div>
        </div>

        <div className="rating-section">
          <Rating itemId={destination._id} itemType="destination" />
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
