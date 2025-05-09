const express = require('express');
const router = express.Router();

// Special route only available in test environment
// This provides a way for Cypress to verify it's connected to the test server
router.get('/test-environment-check', (req, res) => {
  const isTestEnv = process.env.IS_CYPRESS_TEST === 'true';
  const isMemoryDb = !!process.env.MONGODB_URI && 
                    (process.env.MONGODB_URI.includes('mongodb-memory-server') || 
                     process.env.MONGODB_URI.includes('127.0.0.1:'));
  
  // If we're not in test environment, force a clear error
  if (!isTestEnv || !isMemoryDb) {
    return res.status(403).json({
      isTestEnvironment: false,
      error: 'CRITICAL SAFETY ERROR: This appears to be the production environment',
      message: 'Tests have been blocked to protect your real database'
    });
  }
  
  return res.json({
    isTestEnvironment: true,
    memoryDbUri: process.env.MONGODB_URI.split('@')[1], // Show only the non-credentialed part
    testMode: process.env.NODE_ENV
  });
});

module.exports = router;


//Routes used for testing purposes.
//
// These routes are specifically designed for end-to-end testing with Cypress.
// They provide endpoints to check the test environment and to verify the connection to the test server.
// The routes are protected to ensure they are only accessible in the test environment.
// The routes include a test environment check that verifies the connection to the test server
// and returns relevant information about the test environment.
// The routes are designed to be secure and to prevent accidental access in production environments.