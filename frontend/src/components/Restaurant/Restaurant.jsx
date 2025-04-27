import React from 'react';
import { useNavigate } from 'react-router-dom';
import LikeButton from '../LikeButton/LikeButton';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './Restaurant.css';

const Restaurant = ({ restaurant, onLikeToggle }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!restaurant || !restaurant._id) {
    return null;
  }

  const handleLikeToggle = (isLiked, likeCount) => {
    if (onLikeToggle) {
      onLikeToggle(restaurant._id, isLiked, likeCount);
    }
  };

  // Format price range for display
  const formatPriceRange = (range) => {
    return range || 'Price not available';
  };

  // Format rating for display
  const formatRating = (rating) => {
    if (rating === null || rating === undefined) {
      return 'Not rated yet';
    }
    
    // Handle both number and object formats of rating
    const ratingValue = typeof rating === 'object' && rating.average !== undefined
      ? rating.average
      : parseFloat(rating);
    
    if (isNaN(ratingValue)) {
      return 'Not rated yet';
    }
    
    return (
      <div className="rating">
        {'★'.repeat(Math.floor(ratingValue))}
        {'☆'.repeat(5 - Math.floor(ratingValue))}
        <span className="rating-number">({ratingValue.toFixed(1)})</span>
      </div>
    );
  };

  const handleClick = (e) => {
    // Don't navigate if clicking the like button
    if (e.target.closest('.like-button-container')) {
      return;
    }
    // Using the new unified route structure
    navigate(`/restaurants/${restaurant._id}`);
  };

  const handleLoginRequired = () => {
    toast.info('Please log in to like restaurants');
  };

  return (
    <div className="restaurant-card" onClick={handleClick}>
      {/* Image section - display first image if available */}
      {(restaurant.pictureUrls?.length > 0 || restaurant.images?.length > 0) && (
        <div className="restaurant-image">
          <img 
            src={restaurant.pictureUrls?.[0] || restaurant.images?.[0]} 
            alt={restaurant.name} 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://placehold.co/600x400?text=No+Image';
            }}
          />
        </div>
      )}
      <div className="restaurant-info">
        <div className="restaurant-header">
          <h3>{restaurant.name || 'Unnamed Restaurant'}</h3>
          <div className="like-button-wrapper">
            <LikeButton
              placeType="restaurant"
              placeId={restaurant._id}
              onLoginRequired={handleLoginRequired}
              onLikeToggle={handleLikeToggle}
              initialLikeCount={restaurant.likeCount || 0}
              isInitiallyLiked={restaurant.isLiked || false}
            />
          </div>
        </div>
        {restaurant.cuisine && (
          <p className="cuisine">{restaurant.cuisine}</p>
        )}
        <p className="price-range">{formatPriceRange(restaurant.priceRange)}</p>
        {formatRating(restaurant.rating)}
        <p className="location">{restaurant.locationCity || 'Location not specified'}</p>
        {restaurant.address && (
          <p className="address">{restaurant.address}</p>
        )}
        {restaurant.phone && (
          <p className="phone">
            <a href={`tel:${restaurant.phone}`}>{restaurant.phone}</a>
          </p>
        )}
        {restaurant.website && (
          <p className="website">
            <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
              Visit Website
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Restaurant;
