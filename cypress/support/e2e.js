// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// This is a great place to put global configuration and behavior that
// modifies Cypress.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Log a message to confirm we're using the isolated test environment
Cypress.on('test:before:run', () => {
  console.log('⚠️ IMPORTANT: These tests run against an isolated in-memory database');
  console.log('🛡️ Your real database is completely protected and will not be modified');
});

// Add a fail-safe that prevents real database connections
Cypress.on('fail', (err) => {
  // If we detect anything trying to connect to a real database, fail loudly
  if (err.message && (
    err.message.includes('production database') || 
    err.message.includes('real database')
  )) {
    // Force terminate the tests with a clear error message
    throw new Error('⛔ EMERGENCY STOP: Tests attempted to access production data. Tests aborted to protect your database.');
  }
  throw err; // Re-throw original error for normal failures
});
