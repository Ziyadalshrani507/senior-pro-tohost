// Special server script for Cypress E2E testing
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Load test configuration instead of .env
const cypressConfig = require('./config/cypress.env');

// Apply Cypress environment variables to process.env
Object.keys(cypressConfig).forEach(key => {
  process.env[key] = cypressConfig[key];
});

// Set an environment flag to identify this as a test environment
process.env.IS_CYPRESS_TEST = 'true';

// Import the regular server app
const app = require('./server');

// Add test-only routes for Cypress environment verification
const testRoutes = require('./Routes/testRoutes');
app.use('/api', testRoutes);

// Function to check if we're actually in a Cypress test environment
function isCypressTest() {
  return process.env.IS_CYPRESS_TEST === 'true';
}

// Add safety checks to prevent running this in production
if (!isCypressTest()) {
  console.error('ERROR: This script should only be run for Cypress testing!');
  process.exit(1);
}

// Store reference to the in-memory MongoDB instance
let mongoServer;

// CRITICAL SAFETY CHECK: This function verifies this is a test environment
function ensureTestEnvironment() {
  // TRIPLE-CHECK that we're in test mode
  if (!isCypressTest()) {
    console.error('EMERGENCY SAFETY STOP: Not in a Cypress test environment');
    process.exit(1);
  }

  // SAFETY: Check any existing MongoDB URI for risk of connecting to a real DB
  if (process.env.MONGODB_URI && 
      !process.env.MONGODB_URI.includes('mongodb-memory-server') &&
      !process.env.MONGODB_URI.includes('127.0.0.1') &&
      !process.env.MONGODB_URI.includes('localhost')) {
    console.error('EMERGENCY SAFETY STOP: Detected possible production MongoDB URI');
    console.error('Tests will NOT run to protect your database');
    process.exit(1);
  }

  console.log('✅ Safety check passed - using isolated test environment only');
}

// Setup MongoDB in-memory server (like in your regular tests)
async function setupInMemoryMongoDB() {
  // First run the safety check
  ensureTestEnvironment();
  
  console.log('Setting up in-memory MongoDB for Cypress tests');
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // SAFETY: Forcibly override the MongoDB URI to ONLY use the in-memory server
  process.env.MONGODB_URI = mongoUri;
  
  // EXTRA SAFETY: Ensure we can never connect to production
  process.env.MONGODB_PRODUCTION_BLOCKED = 'true';
  
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  
  // EXTRA SAFETY: Intercept mongoose.connect to prevent real DB connections
  const originalConnect = mongoose.connect;
  mongoose.connect = function(uri, ...args) {
    // Only allow connections to our in-memory DB
    if (!uri.includes('mongodb-memory-server')) {
      console.error('🚨 EMERGENCY SAFETY STOP: Blocked attempt to connect to a non-test database');
      console.error('Connection attempt blocked to protect your real data');
      return Promise.reject(new Error('Connection blocked for safety'));
    }
    return originalConnect.apply(this, [uri, ...args]);
  };
  
  await mongoose.connect(mongoUri, mongooseOpts);
  
  console.log(`✅ MongoDB Memory Server started at ${mongoUri}`);
  console.log('🛡️  Your real database is protected - all operations are in-memory only');
  return mongoUri;
}

// Initialize the test database with seed data
async function seedTestDatabase() {
  console.log('Seeding test database with sample data...');
  
  try {
    // Import your models
    const User = require('./Models/User');
    const Destination = require('./Models/Destination');
    const Restaurant = require('./Models/Restaurant');
    const Hotel = require('./Models/Hotel');
    
    // Create a test admin user
    const testAdmin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'Password123!',
      gender: 'male',
      role: 'admin'
    });
    await testAdmin.save();
    
    // Create a test regular user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'user@test.com',
      password: 'Password123!',
      gender: 'male',
      role: 'user'
    });
    await testUser.save();
    
    // Create sample destinations
    const destinations = [
      {
        name: 'Test Cultural Site',
        description: 'A test cultural destination for Cypress testing',
        locationCity: 'Riyadh',
        type: 'Cultural',
        cost: 50,
        coordinates: {
          type: 'Point',
          coordinates: [46.675296, 24.713552]
        },
        categories: ['Family-friendly', 'Outdoor'],
        pictureUrls: ['https://example.com/test.jpg']
      },
      {
        name: 'Test Adventure Site',
        description: 'A test adventure destination for Cypress testing',
        locationCity: 'Jeddah',
        type: 'Adventure',
        cost: 150,
        coordinates: {
          type: 'Point',
          coordinates: [39.173956, 21.485811]
        },
        categories: ['Outdoor'],
        pictureUrls: ['https://example.com/test2.jpg']
      }
    ];
    
    await Destination.insertMany(destinations);
    
    // Create sample restaurants
    const restaurants = [
      {
        name: 'Test Italian Restaurant',
        description: 'A test Italian restaurant for Cypress testing',
        cuisine: 'Italian',
        priceRange: '$$',
        locationCity: 'Riyadh',
        address: '123 Test Street, Riyadh',
        coordinates: {
          type: 'Point',
          coordinates: [46.675296, 24.713552]
        },
        categories: ['Casual Dining'],
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
      }
    ];
    
    await Restaurant.insertMany(restaurants);
    
    // Create sample hotels
    const hotels = [
      {
        name: 'Test Luxury Hotel',
        description: 'A test luxury hotel for Cypress testing',
        locationCity: 'Riyadh',
        address: '456 Test Avenue, Riyadh',
        coordinates: {
          type: 'Point',
          coordinates: [46.675296, 24.713552]
        },
        stars: 5,
        amenities: ['Free WiFi', 'Swimming Pool', 'Spa']
      }
    ];
    
    await Hotel.insertMany(hotels);
    
    console.log('Test database seeded successfully');
  } catch (error) {
    console.error('Error seeding test database:', error);
    throw error;
  }
}

// Clean up the test database after tests complete
async function cleanupDatabase() {
  if (mongoServer) {
    console.log('Cleaning up in-memory MongoDB');
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('MongoDB Memory Server stopped');
  }
}

// Add cleanup handlers
process.on('SIGTERM', cleanupDatabase);
process.on('SIGINT', cleanupDatabase);

// Start the test server with in-memory database
async function startTestServer() {
  try {
    // Setup the in-memory MongoDB
    await setupInMemoryMongoDB();
    
    // Seed the database with test data
    await seedTestDatabase();
    
    // Start the server on a specific port
    const PORT = process.env.CYPRESS_PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Cypress test server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting test server:', error);
    process.exit(1);
  }
}

// Start the test server
startTestServer();
