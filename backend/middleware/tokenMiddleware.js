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
