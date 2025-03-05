import React, { useState, useEffect } from 'react';
import { FaStar, FaThumbsUp, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa';
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
  const { user, token } = useAuth();

  useEffect(() => {
    if (itemId && itemType) {
      fetchRatings();
    }
  }, [itemId, itemType, currentPage]);

  const fetchRatings = async () => {
    try {
      const response = await fetch(`/api/ratings/${itemType}/${itemId}?page=${currentPage}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      setAllRatings(data.ratings);
      setTotalPages(data.totalPages);
      
      if (user) {
        const userReviews = data.ratings.filter(r => r.userId._id === user._id);
        setUserRatings(userReviews);
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

    if (!comment || comment.trim().length < 10) {
      alert('Please write a review of at least 10 characters');
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
          comment,
          visitDate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }
      
      // Reset form
      setRating(0);
      setComment('');
      setVisitDate('');
      fetchRatings();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.message || 'Error submitting rating. Please try again.');
    }
  };

  const handleRatingUpdate = async (ratingId) => {
    if (!token) return;

    try {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update rating');
      }

      setIsEditing(null);
      setRating(0);
      setComment('');
      setVisitDate('');
      fetchRatings();
    } catch (error) {
      console.error('Error updating rating:', error);
      alert(error.message || 'Error updating rating. Please try again.');
    }
  };

  const handleRatingDelete = async (ratingId) => {
    if (!token || !window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete rating');
      }

      fetchRatings();
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert(error.message || 'Error deleting rating. Please try again.');
    }
  };

  const handleLikeToggle = async (ratingId) => {
    if (!user || !token) {
      alert('Please log in to like reviews');
      return;
    }

    try {
      const response = await fetch(`/api/ratings/${ratingId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle like');
      }

      fetchRatings();
    } catch (error) {
      console.error('Error toggling like:', error);
      alert(error.message || 'Error toggling like. Please try again.');
    }
  };

  const startEditing = (rating) => {
    setIsEditing(rating._id);
    setRating(rating.rating);
    setComment(rating.comment);
    setVisitDate(rating.visitDate ? rating.visitDate.split('T')[0] : '');
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setRating(0);
    setComment('');
    setVisitDate('');
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
          <span className="rating-count">({allRatings.length} reviews)</span>
        </div>
      </div>

      {user && (
        <div className="user-rating">
          <h4>{isEditing ? 'Edit Your Review' : 'Write a Review'}</h4>
          <div className="rating-form">
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
            <div className="form-group">
              <label>
                <FaCalendarAlt /> Visit Date:
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </label>
            </div>
            <textarea
              placeholder="Share your experience (minimum 10 characters)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={4}
            />
            <div className="rating-actions">
              <button 
                onClick={isEditing ? () => handleRatingUpdate(isEditing) : handleRatingSubmit}
                disabled={!rating || !comment || comment.trim().length < 10}
                className={(!rating || !comment || comment.trim().length < 10) ? 'disabled' : ''}
              >
                {isEditing ? 'Update Review' : 'Submit Review'}
              </button>
              {isEditing && (
                <button onClick={cancelEditing} className="cancel-edit">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="all-ratings">
        <h4>Reviews</h4>
        {allRatings.length > 0 ? (
          <>
            {allRatings.map((rating) => (
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
                <p className="rating-comment">{rating.comment}</p>
                <div className="rating-footer">
                  <span className="rating-date">
                    {new Date(rating.createdAt).toLocaleDateString()}
                    {rating.isEdited && <span className="edited-tag">(edited)</span>}
                    {rating.visitDate && (
                      <span className="visit-date">
                        Visited: {new Date(rating.visitDate).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                  <div className="rating-actions">
                    <button 
                      onClick={() => handleLikeToggle(rating._id)}
                      className={`like-button ${rating.likes.includes(user?._id) ? 'liked' : ''}`}
                    >
                      <FaThumbsUp /> {rating.likes.length}
                    </button>
                    {user && rating.userId._id === user._id && (
                      <>
                        <button onClick={() => startEditing(rating)} className="edit-button">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleRatingDelete(rating._id)} className="delete-button">
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {rating.status === 'flagged' && (
                  <div className="review-status">
                    This review has been flagged for moderation.
                  </div>
                )}
              </div>
            ))}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="no-ratings">No reviews yet. Be the first to share your experience!</p>
        )}
      </div>
    </div>
  );
};

export default Rating;
