const { validateSignup, validateSignin, validateActivity } = require('../../../middleware/validationMiddleware');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock request, response, and next function for each test
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('validateSignup', () => {
    test('should call next() for valid signup data', () => {
      // Set valid data
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        gender: 'male'
      };

      validateSignup(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 when required fields are missing', () => {
      // Missing lastName
      req.body = {
        firstName: 'John',
        email: 'john.doe@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        gender: 'male'
      };

      validateSignup(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'All fields are required' });
    });

    test('should return 400 when passwords do not match', () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        confirmPassword: 'differentPassword',
        gender: 'male'
      };

      validateSignup(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Passwords do not match' });
    });

    test('should return 400 for invalid email format', () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
        confirmPassword: 'password123',
        gender: 'male'
      };

      validateSignup(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Please enter a valid email' });
    });

    test('should return 400 for password less than 8 characters', () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'short',
        confirmPassword: 'short',
        gender: 'male'
      };

      validateSignup(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Password must be at least 8 characters long' });
    });

    test('should return 400 for invalid gender value', () => {
      req.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        gender: 'other' // Not in the allowed values
      };

      validateSignup(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gender must be either male or female there is no third one' });
    });
  });

  describe('validateSignin', () => {
    test('should call next() for valid signin data', () => {
      req.body = {
        email: 'john.doe@example.com',
        password: 'password123'
      };

      validateSignin(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 when email is missing', () => {
      req.body = {
        password: 'password123'
      };

      validateSignin(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });

    test('should return 400 when password is missing', () => {
      req.body = {
        email: 'john.doe@example.com'
      };

      validateSignin(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
    });

    test('should return 400 for invalid email format', () => {
      req.body = {
        email: 'invalid-email',
        password: 'password123'
      };

      validateSignin(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Please enter a valid email' });
    });
  });

  describe('validateActivity', () => {
    test('should call next() for valid activity data', () => {
      req.body = {
        name: 'Desert Safari',
        description: 'Exciting desert safari experience',
        locationCity: 'Riyadh',
        type: 'Adventure',
        cost: 200,
        categories: ['Outdoor', 'Family-friendly']
      };

      validateActivity(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 when required fields are missing', () => {
      // Missing name
      req.body = {
        description: 'Exciting desert safari experience',
        locationCity: 'Riyadh',
        type: 'Adventure'
      };

      validateActivity(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Required fields are missing' });
    });

    test('should return 400 for invalid city', () => {
      req.body = {
        name: 'Desert Safari',
        description: 'Exciting desert safari experience',
        locationCity: 'InvalidCity', // Not in allowed cities
        type: 'Adventure',
        cost: 200
      };

      validateActivity(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid city' });
    });

    test('should return 400 for invalid activity type', () => {
      req.body = {
        name: 'Desert Safari',
        description: 'Exciting desert safari experience',
        locationCity: 'Riyadh',
        type: 'InvalidType', // Not in allowed types
        cost: 200
      };

      validateActivity(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid activity type' });
    });

    test('should return 400 for negative cost', () => {
      req.body = {
        name: 'Desert Safari',
        description: 'Exciting desert safari experience',
        locationCity: 'Riyadh',
        type: 'Adventure',
        cost: -50 // Negative cost
      };

      validateActivity(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cost must be zero or a positive number' });
    });

    test('should return 400 for invalid categories', () => {
      req.body = {
        name: 'Desert Safari',
        description: 'Exciting desert safari experience',
        locationCity: 'Riyadh',
        type: 'Adventure',
        cost: 200,
        categories: ['Outdoor', 'InvalidCategory'] // Contains invalid category
      };

      validateActivity(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid categories' });
    });

    test('should handle non-array categories', () => {
      req.body = {
        name: 'Desert Safari',
        description: 'Exciting desert safari experience',
        locationCity: 'Riyadh',
        type: 'Adventure',
        cost: 200,
        categories: 'Outdoor' // Not an array
      };

      validateActivity(req, res, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid categories' });
    });
  });
});
