const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const { generateToken } = require('../middleware/tokenMiddleware');

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Needed for cross-site cookies in production
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/'
};

// Sign Up Controller
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, gender } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      gender
    });

    // Generate token
    const token = generateToken(user._id);

    // Set the cookie with the token
    res.cookie('auth_token', token, cookieOptions);

    res.status(201).json({
      message: 'User created successfully',
      token, // Still include the token in the response for backward compatibility
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Refresh Token Controller
exports.refreshToken = async (req, res) => {
  try {
    // User will be attached to the request by the protect middleware
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }
    
    // Generate a new token
    const newToken = generateToken(user._id);
    
    // Set the cookie with the new token
    res.cookie('auth_token', newToken, cookieOptions);
    
    res.status(200).json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Sign In Controller
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set the cookie with the token
    res.cookie('auth_token', token, cookieOptions);

    res.json({
      message: 'Logged in successfully',
      token, // Still include the token in the response for backward compatibility
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        gender: user.gender,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error signing in', error: error.message });
  }
};

// Sign Out Controller
exports.signout = async (req, res) => {
  try {
    // Clear the auth cookie
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error signing out', error: error.message });
  }
};
