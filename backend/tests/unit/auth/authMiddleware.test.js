const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect, admin } = require('../../../middleware/authMiddleware');
const User = require('../../../Models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../../Models/User');

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request, response, and next function
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      clearCookie: jest.fn()
    };
    next = jest.fn();
  });

  describe('protect middleware', () => {
    test('should return 401 if no token is provided', async () => {
      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should extract token from Authorization header', async () => {
      const token = 'test-token';
      req.headers.authorization = `Bearer ${token}`;
      
      // Mock successful token verification
      const userId = new mongoose.Types.ObjectId();
      jwt.verify.mockReturnValue({ id: userId });
      
      // Mock user found
      const mockUser = { _id: userId, name: 'Test User' };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      
      await protect(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should extract token from cookies', async () => {
      const token = 'cookie-token';
      req.cookies.auth_token = token;
      
      // Mock successful token verification
      const userId = new mongoose.Types.ObjectId();
      jwt.verify.mockReturnValue({ id: userId });
      
      // Mock user found
      const mockUser = { _id: userId, name: 'Test User' };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });
      
      await protect(req, res, next);
      
      expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    test('should return 401 if user is not found', async () => {
      const token = 'test-token';
      req.headers.authorization = `Bearer ${token}`;
      
      // Mock successful token verification but user not found
      const userId = new mongoose.Types.ObjectId();
      jwt.verify.mockReturnValue({ id: userId });
      
      // Mock user not found
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      
      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, user not found' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for expired token', async () => {
      const token = 'expired-token';
      req.headers.authorization = `Bearer ${token}`;
      req.cookies.auth_token = token;
      
      // Mock token expired error
      const error = new Error('Token expired');
      error.name = 'TokenExpiredError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });
      
      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token expired, please login again' });
      expect(res.clearCookie).toHaveBeenCalledWith('auth_token', expect.any(Object));
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 for invalid token', async () => {
      const token = 'invalid-token';
      req.headers.authorization = `Bearer ${token}`;
      
      // Mock invalid token error
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';
      jwt.verify.mockImplementation(() => {
        throw error;
      });
      
      await protect(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token, please login again' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('admin middleware', () => {
    test('should allow admin users to access protected routes', () => {
      // Mock admin user
      req.user = { role: 'admin' };
      
      admin(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 403 for non-admin users', () => {
      // Mock regular user
      req.user = { role: 'user' };
      
      admin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized as admin' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 401 if no user in request', () => {
      // No user attached to request
      req.user = null;
      
      admin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized, no user found' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
