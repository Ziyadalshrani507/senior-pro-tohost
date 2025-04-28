import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './LikeButton.css';
import { addLikedCity } from '../../utils/cookieUtils';

import { getApiBaseUrl } from '../../utils/apiBaseUrl';
const API_BASE_URL = getApiBaseUrl();

const LikeButton = ({ 
  placeType, 
  placeId, 
  onLoginRequired, 
  onLikeToggle,
  initialLikeCount = 0,
  isInitiallyLiked = false,
  city = null // New prop to track the city of the liked item
}) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [error, setError] = useState(null);

  // Fetch initial like state
  useEffect(() => {
    const fetchLikeState = async () => {
      if (!user || !token || !placeId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/likes/${placeType}/${placeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) return;

        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      } catch (error) {
        console.error('Error fetching like state:', error);
      }
    };

    fetchLikeState();
  }, [user, token, placeId, placeType]);

  // Update internal state when props change
  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  const handleLikeClick = async (e) => {
    e.stopPropagation(); // Prevent click from bubbling to parent

    if (!token) {
      onLoginRequired();
      return;
    }

    setError(null);

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likeCount;
    const newIsLiked = !isLiked;
    const newLikeCount = likeCount + (newIsLiked ? 1 : -1);

    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);
    
    // Notify parent of optimistic update
    onLikeToggle?.(placeId, newIsLiked, newLikeCount);

    try {
      const response = await fetch(`${API_BASE_URL}/likes/${placeType}/${placeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: newIsLiked ? 'like' : 'unlike' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle like');
      }

      const data = await response.json();
      
      // Update with actual server state
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
      
      // Add city to liked cities cookie if this is a like action and city is provided
      if (data.isLiked && city) {
        addLikedCity(city);
      }
      
      // Notify parent of server state
      onLikeToggle?.(placeId, data.isLiked, data.likeCount);
      
      // Show success message
      toast.success(data.message);
    } catch (error) {
      // Revert optimistic update
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      
      // Notify parent of reversion
      onLikeToggle?.(placeId, previousLiked, previousCount);
      
      setError(error.message);
      toast.error(error.message || 'Failed to toggle like');
    }
  };

  return (
    <div className="like-button-container">
      <button 
        className={`like-button ${isLiked ? 'liked' : ''}`}
        onClick={handleLikeClick}
        aria-label={isLiked ? 'Unlike' : 'Like'}
        title={isLiked ? 'Unlike' : 'Like'}
      >
        {isLiked ? <FaHeart /> : <FaRegHeart />}
        <span className="like-count">{likeCount}</span>
      </button>
    </div>
  );
};

LikeButton.defaultProps = {
  onLoginRequired: () => {},
  onLikeToggle: () => {},
  initialLikeCount: 0,
  isInitiallyLiked: false
};

export default LikeButton;
