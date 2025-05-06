const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Set up test environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

// Create a MongoDB Memory Server instance
let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect mongoose to the MongoDB Memory Server
  await mongoose.connect(mongoUri, {});
  
  console.log(`MongoDB Memory Server started at ${mongoUri}`);
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect mongoose
  await mongoose.disconnect();
  
  // Stop MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
    console.log('MongoDB Memory Server stopped');
  }
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
