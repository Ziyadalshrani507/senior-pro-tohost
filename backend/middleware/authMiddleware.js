const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// Protect routes - Authentication
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check if token exists in cookies
    else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Clear the invalid cookie if it exists
        if (req.cookies && req.cookies.auth_token) {
          res.clearCookie('auth_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
          });
        }
        return res.status(401).json({ message: 'Token expired, please login again' });
      }
      if (error.name === 'JsonWebTokenError') {
        // Clear the invalid cookie if it exists
        if (req.cookies && req.cookies.auth_token) {
          res.clearCookie('auth_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
          });
        }
        return res.status(401).json({ message: 'Invalid token, please login again' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin middleware
exports.admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no user found' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  
  next();
};



// Provides functions to protect routes by verifying JWT tokens and to restrict access to admin users only.
// The protect function checks for a token in the request headers or cookies, verifies it, and attaches the user to the request object.
// The admin function checks if the authenticated user has an admin role.
//
// This middleware is essential for securing routes and ensuring that only authorized users can access certain functionalities.
// It uses JWT for authentication and role-based access control to restrict certain routes to admin users only.
// The middleware functions are designed to be reusable and can be applied to any route that requires authentication or admin access.
// The protect function checks for a token in the request headers or cookies, verifies it, and attaches the user to the request object.
// The admin function checks if the authenticated user has an admin rolE