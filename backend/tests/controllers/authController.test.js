const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../Models/User');
const auth = require('../../Controllers/authController');
const { generateToken } = require('../../middleware/tokenMiddleware');

// Mock the User model and bcrypt functionality
jest.mock('../../Models/User');
jest.mock('bcryptjs');
jest.mock('../../middleware/tokenMiddleware', () => ({
  generateToken: jest.fn()
}));

// Set up a minimal express app for testing
const app = express();
app.use(express.json());
app.post('/api/auth/signup', auth.signup);
app.post('/api/auth/signin', auth.signin);

describe('Auth Controller Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock behavior
    generateToken.mockReturnValue('test-token');
  });
  
  describe('Signup Tests', () => {
    test('Signup with valid data should create user and return 201', async () => {
      // Mock User.findOne to simulate that the user doesn't exist yet
      User.findOne.mockResolvedValue(null);
      
      // Mock User.create to return a created user
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        gender: 'Male',
        role: 'user',
        profilePicture: 'default.jpg'
      };
      User.create.mockResolvedValue(mockUser);
      
      // Valid request body
      const signupData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        gender: 'Male'
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);
      
      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.token).toBe('test-token');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.firstName).toBe('Test');
      expect(response.body.user.lastName).toBe('User');
      expect(response.body.user.email).toBe('test@example.com');
      
      // Verify User.create was called with correct data
      expect(User.create).toHaveBeenCalledWith({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123',
        gender: 'Male'
      });
      
      // Verify token was generated
      expect(generateToken).toHaveBeenCalledWith(mockUser._id);
    });
    
    test('Signup with existing email should return 400', async () => {
      // Mock User.findOne to simulate user already exists
      User.findOne.mockResolvedValue({
        email: 'existing@example.com',
        _id: new mongoose.Types.ObjectId()
      });
      
      // Request body with existing email
      const signupData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        gender: 'Male'
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
      
      // Verify User.create was not called
      expect(User.create).not.toHaveBeenCalled();
    });
    
    test('Signup with mismatched passwords should return 400', async () => {
      // Request body with mismatched passwords
      const signupData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword',
        gender: 'Male'
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/auth/signup')
        .send(signupData);
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Passwords do not match');
      
      // Verify database was not queried and user not created
      expect(User.findOne).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
    });
  });
  
  describe('Signin Tests', () => {
    test('Signin with valid credentials should return 200 and user data', async () => {
      // Mock User.findOne to simulate finding the user
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        gender: 'Male',
        role: 'user',
        profilePicture: 'default.jpg',
        comparePassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);
      
      // Valid login credentials
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/auth/signin')
        .send(loginData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged in successfully');
      expect(response.body.token).toBe('test-token');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.firstName).toBe('Test');
      expect(response.body.user.email).toBe('test@example.com');
      
      // Verify password was compared
      expect(mockUser.comparePassword).toHaveBeenCalledWith('Password123');
      
      // Verify token was generated
      expect(generateToken).toHaveBeenCalledWith(mockUser._id);
    });
    
    test('Signin with non-existent email should return 401', async () => {
      // Mock User.findOne to simulate user not found
      User.findOne.mockResolvedValue(null);
      
      // Login with non-existent email
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Password123'
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/auth/signin')
        .send(loginData);
      
      // Assertions
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
      
      // Verify generateToken was not called
      expect(generateToken).not.toHaveBeenCalled();
    });
    
    test('Signin with incorrect password should return 401', async () => {
      // Mock User.findOne to simulate finding the user
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        email: 'test@example.com',
        // Mock comparePassword to return false (incorrect password)
        comparePassword: jest.fn().mockResolvedValue(false)
      };
      User.findOne.mockResolvedValue(mockUser);
      
      // Login with incorrect password
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };
      
      // Make the request
      const response = await request(app)
        .post('/api/auth/signin')
        .send(loginData);
      
      // Assertions
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
      
      // Verify password was compared
      expect(mockUser.comparePassword).toHaveBeenCalledWith('WrongPassword');
      
      // Verify generateToken was not called
      expect(generateToken).not.toHaveBeenCalled();
    });
  });
});
