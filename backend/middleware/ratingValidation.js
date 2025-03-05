const xss = require('xss');

const validateRating = (req, res, next) => {
  const { itemType, rating, comment } = req.body;

  // Validate itemType
  if (!['destination', 'restaurant'].includes(itemType)) {
    return res.status(400).json({ message: 'Invalid item type' });
  }

  // Validate rating
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
  }

  // Validate and sanitize comment
  if (!comment || comment.trim().length < 10) {
    return res.status(400).json({ message: 'Review must be at least 10 characters long' });
  }

  // Sanitize comment
  req.body.comment = xss(comment.trim());

  next();
};

const validateRatingUpdate = (req, res, next) => {
  const { rating, comment } = req.body;

  // Validate rating if provided
  if (rating !== undefined) {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }
  }

  // Validate and sanitize comment if provided
  if (comment !== undefined) {
    if (comment.trim().length < 10) {
      return res.status(400).json({ message: 'Review must be at least 10 characters long' });
    }
    req.body.comment = xss(comment.trim());
  }

  next();
};

module.exports = {
  validateRating,
  validateRatingUpdate
};
