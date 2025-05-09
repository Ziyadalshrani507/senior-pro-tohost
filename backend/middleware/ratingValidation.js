const xss = require('xss');

const validateRating = (req, res, next) => {
  const { itemType, rating, comment } = req.body;

  // Validate itemType
  if (!['destination', 'restaurant', 'hotel'].includes(itemType)) {
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



// : Validates rating data in requests to ensure it meets required criteria before proceeding.
// : This includes checking the item type, rating value, and comment length.
// : It also sanitizes the comment to prevent XSS attacks.
// : The validation functions are used as middleware in the rating-related routes.
// : The code uses the xss library to sanitize user input, ensuring that any potentially harmful scripts are removed.
// : The validateRating function checks that the item type is one of the allowed values,
// : that the rating is an integer between 1 and 5, and that the comment is at least 10 characters long.
// : If any validation fails, an appropriate error message is returned to the client.
// : The validateRatingUpdate function performs similar checks but allows for partial updates,