import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import './ReviewsSection.css';

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE_URL = getApiBaseUrl();
  const navigate = useNavigate();

  const handleReviewClick = (review) => {
    console.log('Review clicked:', review); // Debug log
    if (!review.itemId?._id) {
      console.warn('No itemId found in review:', review);
      return;
    }
    
    const itemPath = {
      destination: '/destination',
      restaurant: '/restaurant',
      hotel: '/hotel'
    }[review.itemType];

    if (itemPath) {
      const fullPath = `${itemPath}/${review.itemId._id}`;
      console.log('Navigating to:', fullPath); // Debug log
      navigate(fullPath);
    } else {
      console.warn('Unknown item type:', review.itemType);
    }
  };

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        console.log('Fetching reviews from:', `${API_BASE_URL}/ratings/user/ratings`);
        const response = await fetch(`${API_BASE_URL}/ratings/user/ratings`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.status} ${responseText}`);
        }

        const data = JSON.parse(responseText);
        console.log('Parsed reviews data:', data);
        
        if (!data || !data.ratings) {
          console.warn('No ratings data found in response');
          setReviews([]);
          return;
        }

        setReviews(data.ratings);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, [API_BASE_URL]);

  if (loading) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return <div className="no-reviews">No reviews yet</div>;
  }

  return (
    <div className="reviews-section">
      {reviews.map((review) => (
        <div 
          key={review._id} 
          className="review-card" 
          onClick={() => handleReviewClick(review)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleReviewClick(review);
          }}
        >
          <div className="review-header">
            <h3 className="place-name">{review.destinationName}</h3>
            <span className="review-type">{review.itemType}</span>
            <div className="review-stars">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={index < review.rating ? 'star-filled' : 'star-empty'}
                />
              ))}
            </div>
          </div>
          <p className="review-description">{review.comment}</p>
          {review.visitDate && (
            <div className="review-footer">
              <span className="review-date">
                Visited on: {format(new Date(review.visitDate), 'MMMM d, yyyy')}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewsSection;
