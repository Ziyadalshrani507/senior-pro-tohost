import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignIn from '../../pages/SignIn/SignIn';

// Import safeguards to prevent real API calls
import '../../test/safeguards';

// Log safety message
console.log('✅ Database safeguards activated: All database operations are safely mocked');
console.log('🔒 Test environment initialized - No real database connections will be made');

// Mock hooks and function returns
const mockNavigate = vi.fn();
const mockLogin = vi.fn();

// Mock fetch globally
global.fetch = vi.fn();

// We need to mock all components and hooks used in the SignIn component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    // The Link component is already in the actual module so we don't need to mock it
  };
});

// Mock the auth context with the correct path
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false
  })
}));

// Helper function to render SignIn with needed wrappers
const renderSignIn = () => {
  // Using the real BrowserRouter from the mocked react-router-dom module
  const { BrowserRouter } = require('react-router-dom');
  return render(
    <BrowserRouter>
      <SignIn />
    </BrowserRouter>
  );
};

describe('SignIn Component (Real Implementation)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    global.fetch = vi.fn();
    vi.useFakeTimers();
    console.log('🔒 Test environment initialized - No real API calls will be made');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the sign in form correctly', () => {
    renderSignIn();
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
  });

  it('handles successful sign in', () => {
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: { id: '123', email: 'test@example.com' },
        token: 'test-token'
      })
    });

    renderSignIn();
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'Password123' } 
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/signin', 
      expect.objectContaining({
        method: 'POST',
        credentials: 'include'
      })
    );
  });

  it('handles login failure', () => {
    // Mock a failed login response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: 'Invalid credentials'
      })
    });
    
    renderSignIn();
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/email address/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'WrongPassword123' } 
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check fetch was called
    expect(global.fetch).toHaveBeenCalled();
  });

  it('can enter form values', () => {
    renderSignIn();
    
    // Get inputs
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Fill in form fields
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    // Check values were set
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('Password123');
  });

  // NEW TESTS FOR FORM VALIDATION

  it('prevents API calls with empty form fields', () => {
    renderSignIn();
    
    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Mark fields as touched to trigger validation
    fireEvent.focus(emailInput);
    fireEvent.blur(emailInput);
    
    // Try to submit the empty form
    fireEvent.click(submitButton);
    
    // Verify no API call was made with empty fields
    expect(global.fetch).not.toHaveBeenCalled();
    
    // Check validation state
    // The form's submit handler should prevent submission when validation fails
    expect(submitButton).toBeDisabled();
  });

  it('prevents submission with invalid email format', () => {
    renderSignIn();
    
    // Fill in form with invalid email
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.blur(passwordInput);
    
    // Try to submit form
    fireEvent.click(submitButton);
    
    // Check for validation error
    expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    
    // Fetch should not be called when email is invalid
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('prevents submission with invalid password format', () => {
    renderSignIn();
    
    // Fill in form with invalid password
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.blur(emailInput);
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.blur(passwordInput);
    
    // Try to submit form
    fireEvent.click(submitButton);
    
    // Check for validation error
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    
    // Fetch should not be called when password is invalid
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('enables submit button only when form is valid', () => {
    renderSignIn();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Initially, button should not be disabled because fields haven't been touched
    expect(submitButton).not.toBeDisabled();
    
    // Enter invalid data
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    expect(submitButton).toBeDisabled();
    
    // Fix email, but keep password invalid
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    fireEvent.blur(emailInput);
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.blur(passwordInput);
    expect(submitButton).toBeDisabled();
    
    // Fix password too
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.blur(passwordInput);
    expect(submitButton).not.toBeDisabled();
  });

  it('submits form data correctly on multiple clicks', () => {
    // Mock successful responses for multiple calls
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: '123', email: 'test@example.com' },
        token: 'test-token'
      })
    });
    
    renderSignIn();
    
    // Fill form with valid data
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    
    // Submit form multiple times rapidly
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    
    // Verify fetch was called with the correct data
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123'
      }),
    });
  });
});
