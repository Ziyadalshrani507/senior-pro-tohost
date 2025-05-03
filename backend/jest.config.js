module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: ['/node_modules/'],
  
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>'],
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/'],
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
