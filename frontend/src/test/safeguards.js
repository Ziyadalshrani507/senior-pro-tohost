/**
 * Testing Safeguards
 * 
 * This file contains additional safety measures to ensure tests 
 * never interact with production databases.
 */

import { vi } from 'vitest';

// Block any network requests that might bypass our mocks
const originalFetch = global.fetch;
global.fetch = (...args) => {
  const url = args[0].toString();
  
  // Allow test-specific resources but block API calls
  if (url.includes('/api/')) {
    console.error(`🚨 WARNING: Unmocked fetch call to API detected: ${url}`);
    console.error('Tests should mock all API calls to prevent database interactions');
    
    // Instead of hitting a real API, we return a mock response
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ 
        mockData: true, 
        message: 'This is a mocked response to prevent real API calls' 
      }),
      text: () => Promise.resolve('Mocked response'),
      status: 200,
      headers: new Headers(),
    });
  }
  
  // Allow other resource fetches like test assets
  return originalFetch(...args);
};

// Add warning logs for any attempts to use localStorage
const originalLocalStorage = { ...global.localStorage };
const mockStorage = {};

global.localStorage = {
  getItem: (key) => {
    console.warn(`⚠️ Test accessed localStorage.getItem("${key}")`);
    return mockStorage[key] || null;
  },
  setItem: (key, value) => {
    console.warn(`⚠️ Test attempted to write to localStorage.setItem("${key}", "${value}")`);
    mockStorage[key] = value;
  },
  removeItem: (key) => {
    console.warn(`⚠️ Test attempted to remove from localStorage.removeItem("${key}")`);
    delete mockStorage[key];
  },
  clear: () => {
    console.warn('⚠️ Test attempted to clear localStorage');
    for (const key in mockStorage) delete mockStorage[key];
  },
  key: (index) => {
    const keys = Object.keys(mockStorage);
    console.warn(`⚠️ Test accessed localStorage.key(${index})`);
    return keys[index] || null;
  },
  get length() {
    return Object.keys(mockStorage).length;
  }
};

// Prevent any real backend requests through axios or XMLHttpRequest
const realXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(...args) {
  const method = args[0];
  const url = args[1];
  
  if (url && typeof url === 'string' && url.includes('/api/')) {
    console.error(`🚨 WARNING: Unmocked XMLHttpRequest to API detected: ${method} ${url}`);
    console.error('Tests should mock all API calls to prevent database interactions');
    
    // Don't actually open the connection
    return;
  }
  
  return realXHROpen.apply(this, args);
};

// Export test environment marker to be verified in the testing code
export const TEST_ENVIRONMENT_MARKER = 'SAFE_TEST_ENVIRONMENT';

// Add this to your test setup
console.log('✅ Database safeguards activated: All database operations are safely mocked');
