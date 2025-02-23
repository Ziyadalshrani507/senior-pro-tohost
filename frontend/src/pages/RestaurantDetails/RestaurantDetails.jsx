import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './RestaurantDetails.css';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await fetch(`/api/restaurants/${id}`);
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
      <div className="restaurant-details-container">
        <div className="loading">Loading restaurant details...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-details-container">
        <div className="error">Restaurant not found</div>
      </div>
    );
  }

  return (
    <div className="restaurant-details-container">
      <button className="back-button" onClick={() => navigate('/restaurants')}>
        ← Back to Restaurants
      </button>
      
      <div className="restaurant-details">
        <h1>{restaurant.name}</h1>
        
        <div className="details-grid">
          <div className="detail-section">
            <h2>Basic Information</h2>
            {restaurant.cuisine && (
              <p className="detail-item">
                <span className="label">Cuisine:</span>
                <span className="value">{restaurant.cuisine}</span>
              </p>
            )}
            <p className="detail-item">
              <span className="label">Price Range:</span>
              <span className="value">{restaurant.priceRange || 'Not specified'}</span>
            </p>
            {restaurant.rating !== null && (
              <p className="detail-item">
                <span className="label">Rating:</span>
                <span className="value">
                  <span className="stars">
                    {'★'.repeat(Math.floor(restaurant.rating))}
                    {'☆'.repeat(5 - Math.floor(restaurant.rating))}
                  </span>
                  <span className="rating-number">({restaurant.rating})</span>
                </span>
              </p>
            )}
          </div>

          <div className="detail-section">
            <h2>Location & Contact</h2>
            <p className="detail-item">
              <span className="label">City:</span>
              <span className="value">{restaurant.locationCity}</span>
            </p>
            {restaurant.address && (
              <p className="detail-item">
                <span className="label">Address:</span>
                <span className="value">{restaurant.address}</span>
              </p>
            )}
            {restaurant.phone && (
              <p className="detail-item">
                <span className="label">Phone:</span>
                <span className="value">
                  <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
                </span>
              </p>
            )}
            {restaurant.website && (
              <p className="detail-item">
                <span className="label">Website:</span>
                <span className="value">
                  <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
