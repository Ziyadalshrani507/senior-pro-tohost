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
  
  const handleCardClick = () => {
    if (onClick) {
      onClick(item._id);
    } else if (item._id && detailsPath) {
      navigate(`${detailsPath}/${item._id}`);
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
            onLikeToggle={onLikeToggle ? 
              (isLiked, likeCount) => onLikeToggle(item._id, isLiked, likeCount) : 
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
                (item.description?.length > 60 ? 
                  `${item.description.substring(0, 60)}...` : 
                  item.description) : 
                'No description available'
              }
            </p>
            
            {/* Display rating regardless of type */}
            <div className="card-rating">
              {(() => {
                // Handle ALL possible rating formats
                let ratingValue = 0;
                
                // Check for rating as an object with average property
                if (typeof item?.rating === 'object' && item?.rating?.average !== undefined) {
                  ratingValue = parseFloat(item.rating.average);
                }
                // Check for direct rating as a number
                else if (typeof item?.rating === 'number') {
                  ratingValue = parseFloat(item.rating);
                }
                // Check for rating as a string that can be parsed to a number
                else if (typeof item?.rating === 'string' && !isNaN(parseFloat(item.rating))) {
                  ratingValue = parseFloat(item.rating);
                }
                // If no valid rating is found, check for children properties
                else if (typeof item?.rating === 'object') {
                  // Some items might have nested rating structures
                  const possibleValues = Object.values(item.rating).filter(v => !isNaN(parseFloat(v)));
                  if (possibleValues.length > 0) {
                    ratingValue = parseFloat(possibleValues[0]);
                  }
                }
                
                return (
                  <>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={`star ${ratingValue >= star ? 'filled' : 'empty'}`}>
                        ★
                      </span>
                    ))}
                    <span className="rating-value">{ratingValue.toFixed(1)}</span>
                  </>
                );
              })()}
            </div>

            {/* Display location/city below rating if available */}
            {(item?.locationCity || item?.city) && (
              <p className="location">{item.locationCity || item.city}</p>
            )}
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
