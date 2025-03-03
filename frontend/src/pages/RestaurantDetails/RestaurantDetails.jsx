import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaMapMarkerAlt, FaUtensils } from 'react-icons/fa';
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
      
      <div className="restaurant-details">
        <div className="restaurant-header">
          <h1>{restaurant.name}</h1>
          <div className="restaurant-meta">
            <span className="meta-item">
              <FaMapMarkerAlt /> {restaurant.locationCity}
            </span>
            <span className="meta-item">
              <FaUtensils /> {restaurant.cuisine}
            </span>
          </div>
        </div>

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
          <div className="description">
            <h2>About</h2>
            <p>{restaurant.description || 'No description available'}</p>
          </div>
        </div>

        <div className="rating-section">
          <Rating itemId={restaurant._id} itemType="restaurant" />
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
