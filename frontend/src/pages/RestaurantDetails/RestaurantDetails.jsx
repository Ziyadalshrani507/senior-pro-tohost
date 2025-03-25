import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaMapMarkerAlt, FaUtensils, FaStar } from 'react-icons/fa';
import Rating from '../../components/Rating/Rating';
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
        console.log('Restaurant data:', data); // Debug log
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

  // Debug log for image URLs
  console.log('Restaurant picture URLs:', restaurant.pictureUrls);

  return (
    <div className="restaurant-details-container">
      <button className="back-button" onClick={() => navigate('/restaurants')}>
        <FaArrowLeft /> Back to Restaurants
      </button>

      <div className="image-gallery">
        {Array.isArray(restaurant.pictureUrls) && restaurant.pictureUrls.length > 0 ? (
          <div className="gallery-grid">
            {restaurant.pictureUrls.map((url, index) => (
              <div key={index} className="gallery-item">
                <img 
                  src={url} 
                  alt={`${restaurant.name} - ${index + 1}`} 
                  loading="lazy"
                  onError={(e) => {
                    console.error('Image failed to load:', url);
                    e.target.src = '/placeholder-image.jpg'; // You can add a placeholder image
                    e.target.alt = 'Image not available';
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="no-images">No images available</p>
        )}
      </div>

      <div className="restaurant-content">
        <h1 className="destination-name">{restaurant.name}</h1>
        <p className="category">
          <FaUtensils /> {restaurant.cuisine}
        </p>
        <p className="description">{restaurant.description || 'No description available'}</p>

        <div className="rating-reviews">
          <h2>Rating & Reviews</h2>
          <div className="average-rating">
            <h2>{restaurant.rating.toFixed(1)} <FaStar /></h2>
          </div>
          <div className="rating-breakdown">
            <h3>Rating Breakdown</h3>
            <ul>
              {restaurant.ratingBreakdown && Object.entries(restaurant.ratingBreakdown).map(([stars, count]) => (
                <li key={stars}>
                  {stars} stars: {count} ratings
                </li>
              ))}
            </ul>
            <a href="#add-review" className="add-review-link">+ Add Review</a>
          </div>
        </div>
      </div>

      <div className="related-restaurants">
        <h2>Related Destinations based on category</h2>
        <div className="related-restaurants-grid">
          {Array.isArray(restaurant.relatedRestaurants) && restaurant.relatedRestaurants.length > 0 ? (
            restaurant.relatedRestaurants.map((related, index) => (
              <div key={index} className="related-restaurant-card">
                <img src={related.image} alt={related.name} />
                <h3>{related.name}</h3>
                <p>{related.category}</p>
              </div>
            ))
          ) : (
            <p>No related restaurants found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;