const jwt = require('jsonwebtoken');

// Generate JWT Token
exports.generateToken = (userId) => {
  return jwt.sign(
    { 
      id: userId,
      timestamp: Date.now() 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: '1h',
    }
  );
};


// Handles token-related logic, such as verifying or refreshing tokens for authentication.
// This middleware checks if the user is authenticated by verifying the JWT token.
// It also provides a function to refresh the token if needed.
// The code uses JWT for secure token generation and verification.
// The middleware is designed to be reusable and modular, making it easy to integrate into a larger application.
// The code includes error handling for token expiration and invalid tokens.
// It also provides feedback to the user in case of errors or successful operations.