import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Rating.css';

const Rating = ({ itemId, itemType }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [userRating, setUserRating] = useState(null);
  const [allRatings, setAllRatings] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    if (itemId && itemType) {
      fetchRatings();
    }
  }, [itemId, itemType]);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings/${itemType}/${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      setAllRatings(data);
      
      if (user) {
        const userRating = data.find(r => r.userId._id === user._id);
        if (userRating) {
          setRating(userRating.rating);
          setComment(userRating.comment || '');
          setUserRating(userRating);
        }
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleRatingSubmit = async () => {
    if (!user || !token) {
      alert('Please log in to rate');
      return;
    }

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId,
          itemType,
          rating,
          comment
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }
      
      fetchRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.message || 'Error submitting rating. Please try again.');
    }
  };

  const handleRatingDelete = async () => {
    if (!userRating || !token) return;

    try {
      const response = await fetch(`/api/ratings/${userRating._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete rating');
      }

      setRating(0);
      setComment('');
      setUserRating(null);
      fetchRatings();
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert(error.message || 'Error deleting rating. Please try again.');
    }
  };

  const averageRating = allRatings.length > 0
    ? allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length
    : 0;

  return (
    <div className="rating-container">
      <div className="rating-summary">
        <div className="average-rating">
          <span className="rating-number">{averageRating.toFixed(1)}</span>
          <div className="stars">
            {[...Array(5)].map((_, index) => (
              <FaStar
                key={index}
                className={index < Math.round(averageRating) ? 'star-filled' : 'star-empty'}
              />
            ))}
          </div>
          <span className="rating-count">({allRatings.length} ratings)</span>
        </div>
      </div>

      {user ? (
        <div className="user-rating">
          <h4>Your Rating</h4>
          <div className="stars-input">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <FaStar
                  key={index}
                  className={ratingValue <= (hover || rating) ? 'star-filled' : 'star-empty'}
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                />
              );
            })}
          </div>
          <textarea
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
          />
          <div className="rating-actions">
            <button 
              onClick={handleRatingSubmit} 
              disabled={!rating}
              className={!rating ? 'disabled' : ''}
            >
              {userRating ? 'Update Rating' : 'Submit Rating'}
            </button>
            {userRating && (
              <button onClick={handleRatingDelete} className="delete-rating">
                Delete Rating
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="login-prompt">
          <p>Please log in to leave a rating</p>
        </div>
      )}

      <div className="all-ratings">
        <h4>All Reviews</h4>
        {allRatings.length > 0 ? (
          allRatings.map((rating) => (
            <div key={rating._id} className="rating-item">
              <div className="rating-header">
                <span className="user-name">{rating.userId.name}</span>
                <div className="stars">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={index < rating.rating ? 'star-filled' : 'star-empty'}
                    />
                  ))}
                </div>
              </div>
              {rating.comment && <p className="rating-comment">{rating.comment}</p>}
              <span className="rating-date">
                {new Date(rating.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p className="no-ratings">No reviews yet. Be the first to rate!</p>
        )}
      </div>
    </div>
  );
};

export default Rating;
