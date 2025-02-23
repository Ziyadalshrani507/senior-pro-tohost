import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Restaurant.css';

const Restaurant = ({ restaurant }) => {
  const navigate = useNavigate();

  if (!restaurant) {
    return null;
  }

  // Format price range for display
  const formatPriceRange = (range) => {
    return range || 'Price not available';
  };

  // Format rating for display
  const formatRating = (rating) => {
    if (rating === null || rating === undefined) {
      return 'Not rated yet';
    }
    return (
      <div className="rating">
        {'★'.repeat(Math.floor(rating))}
        {'☆'.repeat(5 - Math.floor(rating))}
        <span className="rating-number">({rating})</span>
      </div>
    );
  };

  const handleClick = () => {
    navigate(`/restaurants/${restaurant._id}`);
  };

  return (
    <div className="restaurant-card" onClick={handleClick}>
      <div className="restaurant-image">
        {restaurant.images && restaurant.images.length > 0 && (
          <img src={restaurant.images[0]} alt={restaurant.name} />
        )}
      </div>
      <div className="restaurant-info">
        <h3>{restaurant.name || 'Unnamed Restaurant'}</h3>
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
