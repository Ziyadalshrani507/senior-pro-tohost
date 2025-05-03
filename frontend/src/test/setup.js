import { expect, afterEach, vi, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom';
import './safeguards';

// Set NODE_ENV to test to ensure we're in a test environment
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  console.log('🔒 Test environment initialized - No real database connections will be made');
});

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Mock window.matchMedia
// This is important for components that use media queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock axios to prevent actual API calls during tests
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Clean up after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
