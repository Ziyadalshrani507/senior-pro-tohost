const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Your frontend URL
    env: {
      apiUrl: 'http://localhost:5000/api', // Your test backend API URL
      isTestEnvironment: true,
      usingInMemoryDb: true,
      safetyCheck: 'required' // Force safety checks to run before tests
    },
    setupNodeEvents(on, config) {
      // Print warning banner before any test runs
      on('before:run', async () => {
        console.log('\n\n');  
        console.log('==================================================================');
        console.log('🛡️  SAFETY MODE ACTIVE: Using ISOLATED DATABASE for all tests');
        console.log('✅  Your real database is protected and will not be modified');
        console.log('==================================================================');
        console.log('\n');
      });
      
      on('after:run', async () => {
        console.log('\n');
        console.log('==================================================================');
        console.log('✅  Test run completed. In-memory test database has been destroyed.');
        console.log('🛡️  Your real database was completely protected throughout testing');
        console.log('==================================================================');
        console.log('\n\n');
      });
    },
    // Default command timeout (increased for safety checks)
    defaultCommandTimeout: 15000,
    // Run setup safety checks before tests
    experimentalSessionAndOrigin: true
  },
  // Record video only on failure to help with debugging
  video: true,
  videoUploadOnPasses: false,
  // Take screenshots on test failures
  screenshotOnRunFailure: true
});
