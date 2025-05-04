module.exports = {
  // Use a completely separate database for Cypress tests
  MONGODB_URI: "mongodb://localhost:27017/saudi_tourism_e2e_test",
  
  // Test environment flag - can be checked in code to prevent certain operations
  NODE_ENV: "cypress-testing",
  
  // Other configuration values with safe test defaults
  JWT_SECRET: "cypress-test-secret-do-not-use-in-production",
  JWT_EXPIRE: "1h",
  COOKIE_EXPIRE: 1,
  
  // Set this to false to never allow database cleanup in production
  ALLOW_DB_OPERATIONS: true,
  
  // Testing flags
  IS_CYPRESS: true
};
