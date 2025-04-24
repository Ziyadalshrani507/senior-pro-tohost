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
  FaUtensils
} from 'react-icons/fa';
import Rating from '../../components/Rating/Rating';
import LocationMap from '../../components/LocationMap/LocationMap';
import ImageCarousel from '../../components/ImageCarousel/ImageCarousel';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import './RestaurantDetails.css';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = getApiBaseUrl();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${id}`);
        if (!response.ok) {
          throw new Error('Restaurant not found');
        }
        const data = await response.json();
        setRestaurant(data);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        toast.error('Failed to load restaurant details');
        navigate('/restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="restaurant-details-page">
        <div className="loading">Loading restaurant details...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-details-page">
        <div className="error-message">
          <FaInfoCircle /> Restaurant not found
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-details-page">
      <button className="back-button" onClick={() => navigate('/restaurants')}>
        <FaArrowLeft /> Back to Restaurants
      </button>

      <div className="restaurant-details-container">
        <div className="restaurant-header">
          <h1>{restaurant.name}</h1>
          <div className="restaurant-meta">
            <span>
              <FaMapMarkerAlt /> {restaurant.locationCity}
            </span>
            {restaurant.priceRange && (
              <span>
                <FaMoneyBillWave /> {restaurant.priceRange}
              </span>
            )}
          </div>
        </div>

        <div className="restaurant-content">
          <div className="content-main">
            <div className="section-card">
              <h2><FaImage /> Gallery</h2>
              <ImageCarousel 
                images={restaurant.pictureUrls || restaurant.images || []} 
                altPrefix={restaurant.name}
              />
            </div>

            <div className="description">
              <h2><FaInfoCircle /> About</h2>
              <p>{restaurant.description || 'No description available'}</p>
            </div>

            <div className="rating-section">
              <h2><FaStar /> Ratings & Reviews</h2>
              <Rating itemId={restaurant._id} itemType="restaurant" />
            </div>
          </div>

          <div className="content-side">
            <div className="map-container">
              <h2><FaMapMarked /> Location</h2>
              <LocationMap coordinates={restaurant.coordinates?.coordinates} />
            </div>

            <div className="restaurant-info">
              <h2><FaInfoCircle /> Details</h2>
              <div className="info-item">
                <strong><FaUtensils /> Cuisine:</strong>
                <span>{restaurant.cuisine}</span>
              </div>
              {restaurant.priceRange && (
                <div className="info-item">
                  <strong><FaMoneyBillWave /> Price Range:</strong>
                  <span>{restaurant.priceRange}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;