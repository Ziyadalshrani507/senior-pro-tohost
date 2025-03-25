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
  const [error, setError] = useState(null);

  useEffect(() => {
    if (itemId && itemType) {
      fetchRatings();
    }
  }, [itemId, itemType, currentPage]);

  const fetchRatings = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/ratings/${itemType}/${itemId}?page=${currentPage}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch ratings');
      const data = await response.json();
      setAllRatings(data.ratings);
      setTotalPages(data.totalPages);
      
      // Only filter user ratings if user is logged in
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
      
      // Reset form
      setRating(0);
      setComment('');
      setVisitDate('');
      fetchRatings();
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update rating');
      }

      setIsEditing(null);
      fetchRatings();
    } catch (error) {
      console.error('Error updating rating:', error);
      setError(error.message || 'Error updating rating. Please try again.');
    }
  };

  const handleRatingDelete = async (ratingId) => {
    if (!user || !token) {
      setError('Please log in to delete your rating');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this rating?')) {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete rating');
      }

      fetchRatings();
    } catch (error) {
      console.error('Error deleting rating:', error);
      setError(error.message || 'Error deleting rating. Please try again.');
    }
  };

  if (!itemId || !itemType) {
    return <div className="rating-error">Invalid item information</div>;
  }

  return (
    <div className="rating-container">
      {error && <div className="rating-error">{error}</div>}
      
      {user ? (
        <div className="rating-form">
          <h3>Rate this {itemType}</h3>
          <div className="star-rating">
            {[...Array(5)].map((_, index) => {
              const ratingValue = index + 1;
              return (
                <FaStar
                  key={index}
                  className={ratingValue <= (hover || rating) ? 'star active' : 'star'}
                  onClick={() => setRating(ratingValue)}
                  onMouseEnter={() => setHover(ratingValue)}
                  onMouseLeave={() => setHover(0)}
                />
              );
            })}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review (minimum 10 characters)"
            className="rating-comment"
          />
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="rating-date"
          />
          <button onClick={isEditing ? () => handleRatingUpdate(isEditing) : handleRatingSubmit}>
            {isEditing ? 'Update Rating' : 'Submit Rating'}
          </button>
        </div>
      ) : (
        <div className="login-prompt">
          Please log in to rate this {itemType}
        </div>
      )}

      <div className="ratings-list">
        <h3>Reviews</h3>
        {allRatings.length > 0 ? (
          <>
            {allRatings.map((r) => (
              <div key={r._id} className="rating-item">
                <div className="rating-header">
                  <div className="rating-stars">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={index < r.rating ? 'star active' : 'star'}
                      />
                    ))}
                  </div>
                  {user && r.userId && r.userId._id === user._id && (
                    <div className="rating-actions">
                      <FaEdit onClick={() => {
                        setIsEditing(r._id);
                        setRating(r.rating);
                        setComment(r.comment);
                        setVisitDate(r.visitDate);
                      }} />
                      <FaTrash onClick={() => handleRatingDelete(r._id)} />
                    </div>
                  )}
                </div>
                <p className="rating-comment">{r.comment}</p>
                {r.visitDate && (
                  <div className="rating-date">
                    <FaCalendarAlt /> {new Date(r.visitDate).toLocaleDateString()}
                  </div>
                )}
                <div className="rating-user">
                  By: {r.userId ? r.userId.firstName : 'Anonymous'}
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="pagination">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={currentPage === index + 1 ? 'active' : ''}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <p>No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
};

export default Rating;
