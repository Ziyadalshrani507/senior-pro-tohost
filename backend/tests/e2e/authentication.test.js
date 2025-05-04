const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../Models/User');

let mongoServer;

beforeAll(async () => {
  // Set up MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication Flow', () => {
  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  test('Should allow a user to sign up successfully', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      gender: 'male'
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('firstName', 'Test');
    expect(response.body.user).toHaveProperty('lastName', 'User');
    expect(response.body.user).toHaveProperty('email', 'testuser@example.com');
    expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
  });

  test('Should prevent signup with invalid data', async () => {
    // Missing required fields
    const incompleteData = {
      firstName: 'Test',
      email: 'testuser@example.com',
      password: 'Password123!'
      // Missing lastName, confirmPassword, gender
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(incompleteData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('message');
  });

  test('Should prevent signup with mismatched passwords', async () => {
    const mismatchedPasswords = {
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword!',
      gender: 'male'
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(mismatchedPasswords);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Passwords do not match');
  });

  test('Should allow a user to log in successfully', async () => {
    // First create a user
    const user = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'login@example.com',
      password: 'Password123!',
      gender: 'male'
    });
    await user.save();

    // Now log in
    const loginData = {
      email: 'login@example.com',
      password: 'Password123!'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('firstName', 'Test');
  });

  test('Should show appropriate error for invalid login', async () => {
    const invalidLogin = {
      email: 'wrong@example.com',
      password: 'WrongPassword123!'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(invalidLogin);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid credentials');
  });
});
