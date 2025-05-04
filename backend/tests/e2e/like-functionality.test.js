const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../Models/User');
const Restaurant = require('../../Models/Restaurant');
const Destination = require('../../Models/Destination');
const Hotel = require('../../Models/Hotel');
const jwt = require('jsonwebtoken');

let mongoServer;
let testUser;
let testUserToken;
let restaurant;
let destination;
let hotel;

beforeAll(async () => {
  // Set up MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create a test user
  testUser = new User({
    firstName: 'Like',
    lastName: 'Tester',
    email: 'like.test@example.com',
    password: 'Password123!',
    gender: 'male'
  });
  await testUser.save();

  // Generate token for the test user
  testUserToken = jwt.sign(
    { id: testUser._id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  // Create test data
  restaurant = new Restaurant({
    name: 'Test Restaurant',
    description: 'A test restaurant for like functionality',
    cuisine: 'Italian',
    priceRange: '$$',
    locationCity: 'Riyadh',
    address: '123 Test Street, Riyadh',
    coordinates: {
      type: 'Point',
      coordinates: [46.675296, 24.713552]
    },
    categories: ['Casual Dining'],
    likes: [],
    likeCount: 0,
    contact: {
      phone: '+966123456789',
      email: 'test@restaurant.com',
      website: 'https://test-restaurant.com'
    },
    openingHours: {
      open: {
        hour: 9,
        minute: 0,
        period: 'AM'
      },
      close: {
        hour: 10,
        minute: 0,
        period: 'PM'
      }
    }
  });
  await restaurant.save();

  destination = new Destination({
    name: 'Test Destination',
    description: 'A test destination for like functionality',
    locationCity: 'Riyadh',
    type: 'Cultural',
    cost: 100,
    coordinates: {
      type: 'Point',
      coordinates: [46.675296, 24.713552]
    },
    categories: ['Family-friendly'],
    likes: [],
    likeCount: 0,
    pictureUrls: ['https://example.com/test.jpg']
  });
  await destination.save();

  hotel = new Hotel({
    name: 'Test Hotel',
    description: 'A test hotel for like functionality',
    locationCity: 'Riyadh',
    address: '456 Test Avenue, Riyadh',
    coordinates: {
      type: 'Point',
      coordinates: [46.675296, 24.713552]
    },
    stars: 5,
    likes: [],
    likeCount: 0,
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa']
  });
  await hotel.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Like Functionality', () => {
  test('Should like a restaurant when not previously liked', async () => {
    const response = await request(app)
      .post(`/api/likes/restaurant/${restaurant._id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.isLiked).toBe(true);
    expect(response.body.likeCount).toBe(1);
    expect(response.body.message).toBe('restaurant liked successfully');

    // Verify in database
    const updatedRestaurant = await Restaurant.findById(restaurant._id);
    expect(updatedRestaurant.likes).toContainEqual(testUser._id.toString());
    expect(updatedRestaurant.likeCount).toBe(1);
  });

  test('Should unlike a restaurant when previously liked', async () => {
    // First like the restaurant
    await request(app)
      .post(`/api/likes/restaurant/${restaurant._id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    // Then unlike it
    const response = await request(app)
      .post(`/api/likes/restaurant/${restaurant._id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.isLiked).toBe(false);
    expect(response.body.likeCount).toBe(0);
    expect(response.body.message).toBe('restaurant unliked successfully');

    // Verify in database
    const updatedRestaurant = await Restaurant.findById(restaurant._id);
    expect(updatedRestaurant.likes).not.toContainEqual(testUser._id.toString());
    expect(updatedRestaurant.likeCount).toBe(0);
  });

  test('Should like a destination when not previously liked', async () => {
    const response = await request(app)
      .post(`/api/likes/destination/${destination._id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.isLiked).toBe(true);
    expect(response.body.likeCount).toBe(1);
    expect(response.body.message).toBe('destination liked successfully');

    // Verify in database
    const updatedDestination = await Destination.findById(destination._id);
    expect(updatedDestination.likes).toContainEqual(testUser._id.toString());
    expect(updatedDestination.likeCount).toBe(1);
  });

  test('Should like a hotel when not previously liked', async () => {
    const response = await request(app)
      .post(`/api/likes/hotel/${hotel._id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.isLiked).toBe(true);
    expect(response.body.likeCount).toBe(1);
    expect(response.body.message).toBe('hotel liked successfully');

    // Verify in database
    const updatedHotel = await Hotel.findById(hotel._id);
    expect(updatedHotel.likes).toContainEqual(testUser._id.toString());
    expect(updatedHotel.likeCount).toBe(1);
  });

  test('Should get user likes successfully', async () => {
    // Make sure we have some likes
    await request(app)
      .post(`/api/likes/restaurant/${restaurant._id}`)
      .set('Authorization', `Bearer ${testUserToken}`);
    
    await request(app)
      .post(`/api/likes/destination/${destination._id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    const response = await request(app)
      .get('/api/likes/user')
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('restaurants');
    expect(response.body).toHaveProperty('destinations');
    expect(response.body).toHaveProperty('hotels');
    
    // Should find at least the restaurant and destination we liked
    expect(response.body.restaurants.length).toBeGreaterThan(0);
    expect(response.body.destinations.length).toBeGreaterThan(0);
  });

  test('Should get place like status successfully', async () => {
    // Make sure restaurant is liked
    await request(app)
      .post(`/api/likes/restaurant/${restaurant._id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    const response = await request(app)
      .get(`/api/likes/restaurant/${restaurant._id}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.isLiked).toBe(true);
    expect(response.body.likeCount).toBeGreaterThan(0);
  });

  test('Should return 404 for non-existent place ID', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const response = await request(app)
      .post(`/api/likes/restaurant/${nonExistentId}`)
      .set('Authorization', `Bearer ${testUserToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not found');
  });

  test('Should require authentication for like operations', async () => {
    const response = await request(app)
      .post(`/api/likes/restaurant/${restaurant._id}`);
      // No auth token provided

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not authorized');
  });
});
