import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUtensils, FaStar } from 'react-icons/fa';
import './RestaurantDetails.css';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

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
        <div className="error-message">Restaurant not found</div>
      </div>
    );
  }

  return (
    <div className="restaurant-details-container">
      {/* Hero Section */}
      <div className="hero-section">
        <img src={restaurant.mainImage} alt={restaurant.name} />
        <div className="hero-overlay"></div>
        <div className="hero-text">{restaurant.name}</div>
      </div>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/restaurants')}>
        <FaArrowLeft /> Back to Restaurants
      </button>

      {/* Restaurant Content */}
      <div className="restaurant-content">
        <h1 className="destination-name">{restaurant.name}</h1>

        {/* Cuisine */}
        <p className="category">
          <FaUtensils /> Cuisine: {restaurant.cuisine}
        </p>

        {/* Price Range */}
        <p className="category">
          <FaUtensils /> Price Range: {restaurant.priceRange || 'Not available'}
        </p>

        {/* Total Rating */}
        <p className="category">
          <FaStar /> Total Rating: {restaurant.rating.toFixed(1)}
        </p>
      </div>

      {/* Rating & Reviews */}
      <div className="rating-reviews">
        <h2>Rating & Reviews</h2>
        <div className="average-rating">
          <h2>
            {restaurant.rating.toFixed(1)} <FaStar />
          </h2>
        </div>
        <div className="rating-breakdown">
          <h3>Rating Breakdown</h3>
          <ul>
            {restaurant.ratingBreakdown &&
              Object.entries(restaurant.ratingBreakdown).map(([stars, count]) => (
                <li key={stars}>
                  {stars} stars: {count} ratings
                </li>
              ))}
          </ul>
          <a href="#add-review" className="add-review-link">
            + Add Review
          </a>
        </div>
      </div>

      {/* Related Restaurants */}
      <div className="related-restaurants">
        <h2>Related Restaurants</h2>
        <div className="related-restaurants-grid">
          {restaurant.relatedRestaurants?.map((related, index) => (
            <div key={index} className="related-restaurant-card">
              <img src={related.image} alt={related.name} />
              <h3>{related.name}</h3>
              <p>{related.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;