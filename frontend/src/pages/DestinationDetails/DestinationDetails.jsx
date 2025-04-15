import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaInfoCircle, 
  FaMapMarked, 
  FaImage,
  FaStar,
  FaMoneyBillWave,
  FaCity
} from 'react-icons/fa';
import Rating from '../../components/Rating/Rating';
import LocationMap from '../../components/LocationMap/LocationMap';
import ImageCarousel from '../../components/ImageCarousel/ImageCarousel';
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
        <div className="error-message">
          <FaInfoCircle /> Destination not found
        </div>
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
            <span>
              <FaMapMarkerAlt /> {destination.locationCity}
            </span>
            {destination.price && (
              <span>
                <FaMoneyBillWave /> {destination.price} SAR
              </span>
            )}
          </div>
        </div>

        <div className="destination-content">
          <div className="content-main">
            <div className="section-card">
              <h2><FaImage /> Gallery</h2>
              <ImageCarousel 
                images={destination.pictureUrls || destination.images || []} 
                altPrefix={destination.name}
              />
            </div>

            <div className="description">
              <h2><FaInfoCircle /> About</h2>
              <p>{destination.description || 'No description available'}</p>
            </div>

            <div className="rating-section">
              <h2><FaStar /> Ratings & Reviews</h2>
              <Rating itemId={destination._id} itemType="destination" />
            </div>
          </div>

          <div className="content-side">
            <div className="map-container">
              <h2><FaMapMarked /> Location</h2>
              <LocationMap coordinates={destination.coordinates?.coordinates} />
            </div>

            <div className="destination-info">
              <h2><FaInfoCircle /> Details</h2>
              <div className="info-item">
                <strong><FaCity /> City:</strong>
                <span>{destination.locationCity}</span>
              </div>
              {destination.price && (
                <div className="info-item">
                  <strong><FaMoneyBillWave /> Price:</strong>
                  <span>{destination.price} SAR</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationDetails;
