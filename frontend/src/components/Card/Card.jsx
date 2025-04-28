import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import LikeButton from '../LikeButton/LikeButton';
import './Card.css';

const Card = ({ 
  item, 
  type = 'destination',
  imageKey = 'images',
  fallbackImageKey = 'pictureUrls',
  likesMap = {}, 
  onLoginRequired, 
  onLikeToggle,
  onClick,
  detailsPath,
  renderCustomContent
}) => {
  const navigate = useNavigate();
  
  // Extract city information from item
  const getItemCity = () => {
    if (!item) return null;
    
    // Different item types might store city in different properties
    if (item.locationCity) return item.locationCity;
    if (item.city) return item.city;
    if (item.location?.city) return item.location.city;
    
    return null;
  };
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(item._id);
    } else if (item._id) {
      // New unified route pattern: /:type/:id
      // Convert detailsPath to the proper type for the new routing structure
      // Remove leading slash if present
      const normalizedPath = detailsPath?.startsWith('/') ? detailsPath.substring(1) : detailsPath || type;
      
      navigate(`/${normalizedPath}/${item._id}`);
    }
  };

  // Get the image URL using the provided keys
  const imageUrl = item && (item[imageKey]?.length > 0 ? item[imageKey][0] : 
                  (item[fallbackImageKey]?.length > 0 ? item[fallbackImageKey][0] : null));

  return (
    <div
      className="card"
      onClick={handleCardClick}
    >
      <div className="image-container">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item?.name || 'Image'}
            className="card-image"
            loading="lazy"
            onError={(e) => {
              e.target.parentElement.innerHTML = `
                <div class="no-image-placeholder">
                  <i class="bi bi-image"></i>
                  <span>No Image Available</span>
                </div>
              `;
            }}
          />
        ) : (
          <div className="no-image-placeholder">
            <i className="bi bi-image"></i>
            <span>No Image Available</span>
          </div>
        )}
        {item && item._id && (
          <LikeButton
            placeType={type}
            placeId={item._id}
            initialLikeCount={item.likeCount || 0}
            isInitiallyLiked={likesMap[item._id] || false}
            onLoginRequired={onLoginRequired}
            city={getItemCity()}
            onLikeToggle={onLikeToggle ? 
              (itemId, isLiked, likeCount) => onLikeToggle(itemId, isLiked, likeCount) : 
              undefined
            }
          />
        )}
      </div>
      <div className="card-info">
        {renderCustomContent ? (
          renderCustomContent(item)
        ) : (
          <>
            <h3>{item?.name || 'Untitled'}</h3>
            <p className="card-description">
              {item?.description ? 
                (item.description.length > 70 ? 
                  `${item.description.substring(0, 70)}...` : 
                  item.description) : 
                'No description available'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

Card.propTypes = {
  item: PropTypes.object.isRequired,
  type: PropTypes.string,
  imageKey: PropTypes.string,
  fallbackImageKey: PropTypes.string,
  likesMap: PropTypes.object,
  onLoginRequired: PropTypes.func,
  onLikeToggle: PropTypes.func,
  onClick: PropTypes.func,
  detailsPath: PropTypes.string,
  renderCustomContent: PropTypes.func
};

Card.defaultProps = {
  type: 'destination',
  imageKey: 'images',
  fallbackImageKey: 'pictureUrls',
  likesMap: {},
  onLoginRequired: () => {},
  onLikeToggle: undefined,
  onClick: null,
  detailsPath: '/destinations',
  renderCustomContent: null
};

export default Card;
