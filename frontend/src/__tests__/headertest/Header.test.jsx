import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import * as cookieUtils from '../../utils/cookieUtils'; // Import cookieUtils

// Mock the router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
  };
});

// Mock the auth context
vi.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: vi.fn().mockReturnValue({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn()
  })
}));

// Mock the cookie utils
vi.mock('../../utils/cookieUtils', () => ({
  getUserInfo: vi.fn(),
  removeUserCookie: vi.fn()
}));

// Mock the WelcomeBanner component
vi.mock('../../components/Header/WelcomeBanner', () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="welcome-banner">
      <button onClick={props.onClose} data-testid="close-welcome">Close</button>
    </div>
  )
}));

// Mock for useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

// Setup a mock for document.querySelector to handle scrolling test
beforeEach(() => {
  // Mock querySelectorAll to return something we can test with
  document.querySelectorAll = vi.fn().mockImplementation((selector) => {
    if (selector === '.navbar') {
      return [{ classList: { add: vi.fn(), remove: vi.fn() } }];
    }
    return [];
  });
});

// Create a custom render function to include necessary providers
const renderWithProviders = (ui, { authState = {}, ...options } = {}) => {
  // Override the default auth mock with any test-specific values
  vi.mocked(useAuth).mockReturnValue({
    user: null,
    isAuthenticated: false,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...authState,
  });

  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>,
    options
  );
};

describe('Header Component', () => {
  // Clean up after each test
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders without crashing', () => {
    renderWithProviders(<Header />);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  it('shows login and signup links when user is not authenticated', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows user profile and logout when user is authenticated', () => {
    const authState = {
      user: { firstName: 'John', role: 'user' },
      isAuthenticated: true,
    };
    
    renderWithProviders(<Header />, { authState });
    
    expect(screen.getByText('John')).toBeInTheDocument();
    // Due to dropdown, we need to ensure the button is clicked to see the dropdown items
    const userDropdown = screen.getByText('John').closest('button');
    fireEvent.click(userDropdown);
    
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows admin dashboard link for admin users', () => {
    const authState = {
      user: { firstName: 'Admin', role: 'admin' },
      isAuthenticated: true,
    };
    
    renderWithProviders(<Header />, { authState });
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('does not show admin dashboard link for regular users', () => {
    const authState = {
      user: { firstName: 'User', role: 'user' },
      isAuthenticated: true,
    };
    
    renderWithProviders(<Header />, { authState });
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('shows welcome message when userInfo exists', async () => {
    // Setup the mock to return user info
    vi.mocked(cookieUtils.getUserInfo).mockReturnValue({
      firstName: 'John',
      gender: 'male'
    });
    
    // Render with authenticated user
    const authState = {
      user: { firstName: 'John', role: 'user' },
      isAuthenticated: true,
    };
    
    renderWithProviders(<Header />, { authState });
    
    // Verify welcome message is shown
    await waitFor(() => {
      expect(screen.getByTestId('welcome-banner')).toBeInTheDocument();
    });
  });

  it('handles logout correctly', async () => {
    const logoutMock = vi.fn();
    const authState = {
      user: { firstName: 'John', role: 'user' },
      isAuthenticated: true,
      logout: logoutMock,
    };
    
    renderWithProviders(<Header />, { authState });
    
    // Click on user dropdown to see logout option
    const userDropdown = screen.getByText('John').closest('button');
    fireEvent.click(userDropdown);
    
    // Click logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Verify logout was called and navigation happened
    expect(logoutMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });

  it('applies scrolled class when scrolling', async () => {
    renderWithProviders(<Header />);
    
    // Mock window scrollY and fire scroll event
    global.window.scrollY = 100;
    fireEvent.scroll(window);
    
    // Check if navbar with scrolled class appears in the document
    await waitFor(() => {
      const navbar = document.querySelector('.navbar');
      expect(navbar.className).toContain('scrolled');
    });
    
    // Simulate scrolling back to top
    global.window.scrollY = 0;
    fireEvent.scroll(window);
    
    // Check if scrolled class is removed
    await waitFor(() => {
      const navbar = document.querySelector('.navbar');
      expect(navbar.className).not.toContain('scrolled');
    });
  });
});
