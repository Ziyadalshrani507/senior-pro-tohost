import React, { useState, useEffect } from 'react';
import { FaStar, FaThumbsUp, FaEdit, FaTrash, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Rating.css';

const Rating = ({ itemId, itemType }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [userRatings, setUserRatings] = useState([]);
  const [allRatings, setAllRatings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(null);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    }
  });
  const { user, token } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (itemId && itemType) {
      fetchRatings();
      fetchStats();
    }
  }, [itemId, itemType, currentPage]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/ratings/stats/${itemType}/${itemId}`);
      if (!response.ok) throw new Error('Failed to fetch rating stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching rating stats:', error);
    }
  };

  const fetchRatings = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/ratings/${itemType}/${itemId}?page=${currentPage}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      setAllRatings(data.ratings);
      setTotalPages(data.totalPages);
      
      if (user && data.ratings) {
        const userReviews = data.ratings.filter(r => r.userId && r.userId._id === user._id);
        setUserRatings(userReviews);
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setError('Failed to load ratings. Please try again later.');
    }
  };

  const handleRatingSubmit = async () => {
    if (!user || !token) {
      setError('Please log in to rate');
      return;
    }

    if (!comment || comment.trim().length < 10) {
      setError('Please write a review of at least 10 characters');
      return;
    }

    try {
      setError(null);
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
          comment,
          visitDate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }
      
      setRating(0);
      setComment('');
      setVisitDate('');
      await Promise.all([fetchRatings(), fetchStats()]);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(error.message || 'Error submitting rating. Please try again.');
    }
  };

  const handleRatingUpdate = async (ratingId) => {
    if (!user || !token) {
      setError('Please log in to update your rating');
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating,
          comment,
          visitDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update rating');
      }

      setIsEditing(null);
      setRating(0);
      setComment('');
      setVisitDate('');
      await Promise.all([fetchRatings(), fetchStats()]);
    } catch (error) {
      console.error('Error updating rating:', error);
      setError('Failed to update rating. Please try again.');
    }
  };

  const handleRatingDelete = async (ratingId) => {
    if (!user || !token || !window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setError(null);
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete rating');
      }

      await Promise.all([fetchRatings(), fetchStats()]);
    } catch (error) {
      console.error('Error deleting rating:', error);
      setError('Failed to delete rating. Please try again.');
    }
  };

  const renderStars = (value, isInteractive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <FaStar
          key={index}
          className={`star ${(isInteractive ? hover || rating : value) >= starValue ? 'filled' : ''}`}
          onClick={() => isInteractive && setRating(starValue)}
          onMouseEnter={() => isInteractive && setHover(starValue)}
          onMouseLeave={() => isInteractive && setHover(0)}
        />
      );
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="rating-container">
      <div className="rating-stats">
        <div className="average-rating">
          <div className="rating-value">{stats.average.toFixed(1)}</div>
          <div className="rating-count">{stats.total} reviews</div>
        </div>
        <div className="rating-distribution">
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="rating-bar">
              <div className="rating-bar-label">
                {renderStars(stars)}
              </div>
              <div className="rating-bar-track">
                <div
                  className="rating-bar-fill"
                  style={{
                    width: `${stats.total ? (stats.distribution[stars] / stats.total) * 100 : 0}%`
                  }}
                />
              </div>
              <div className="rating-bar-count">{stats.distribution[stars]}</div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!user ? (
        <div className="rating-form">
          <h3>Please log in to write a review</h3>
        </div>
      ) : (
        <div className="rating-form">
          <h3>{isEditing ? 'Edit your review' : 'Write a review'}</h3>
          <div className="star-rating">
            {renderStars(0, true)}
          </div>
          <div className="form-group">
            <label htmlFor="visitDate">Visit Date</label>
            <input
              type="date"
              id="visitDate"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label htmlFor="comment">Your Review</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              minLength={10}
            />
          </div>
          <button
            className="submit-button"
            onClick={() => isEditing ? handleRatingUpdate(isEditing) : handleRatingSubmit()}
            disabled={!rating || !comment.trim() || comment.trim().length < 10}
          >
            {isEditing ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      )}

      <div className="reviews-list">
        {allRatings.map((review) => (
          <div key={review._id} className="review-card">
            <div className="review-header">
              <div className="review-user">
                <div className="user-avatar">
                  <FaUser />
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {review.userId?.username || 'Anonymous'}
                  </span>
                  <span className="review-date">
                    <FaCalendarAlt />
                    {formatDate(review.visitDate || review.createdAt)}
                  </span>
                </div>
              </div>
              <div className="review-rating">
                {renderStars(review.rating)}
              </div>
            </div>
            <div className="review-content">
              {review.comment}
            </div>
            {user && user._id === review.userId?._id && (
              <div className="review-actions">
                <button
                  className="action-button edit-button"
                  onClick={() => {
                    setIsEditing(review._id);
                    setRating(review.rating);
                    setComment(review.comment);
                    setVisitDate(review.visitDate?.split('T')[0] || '');
                  }}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="action-button delete-button"
                  onClick={() => handleRatingDelete(review._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rating;
