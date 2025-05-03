import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

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
  useAuth: () => ({
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

// Mock the Header component to avoid dependencies on external components
vi.mock('../../components/Header/Header', () => ({
  __esModule: true,
  default: () => {
    const [scrolled, setScrolled] = React.useState(false);
    const [showWelcomeMessage, setShowWelcomeMessage] = React.useState(false);
    
    // Mock user data
    const mockUser = null; // Simulate logged out state
    
    // Mock close welcome message handler
    const closeWelcome = () => setShowWelcomeMessage(false);
    
    return (
      <>
        {showWelcomeMessage && (
          <div className="welcome-banner" data-testid="welcome-banner">
            <div className="container">
              Happy to have you again!
              <button 
                className="close-welcome" 
                onClick={closeWelcome}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
          </div>
        )}
        <nav className={`navbar navbar-expand-lg navbar-light fixed-top ${scrolled ? 'scrolled' : ''}`} data-testid="navbar">
          <div className="container-fluid px-3">
            <a className="navbar-brand ms-0 ps-0" href="/">
              <img src="/logo.png" alt="Logo" className="navbar-logo" />
            </a>
            
            <button 
              className="navbar-toggler" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <a className="nav-link" href="/destinations">
                    <i className="bi bi-geo-alt"></i> Destinations
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/restaurants">
                    <i className="bi bi-shop"></i> Restaurants
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/hotels">
                    <i className="bi bi-building"></i> Hotels
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/itinerary-planner">
                    <i className="bi bi-robot"></i> AI Planner
                  </a>
                </li>
              </ul>
              
              <div className="auth-buttons me-0 pe-0">
                {mockUser ? (
                  <div className="nav-item dropdown" data-testid="user-dropdown">
                    <button 
                      className="user-dropdown" 
                      data-bs-toggle="dropdown"
                    >
                      <i className="bi bi-person-circle"></i> 
                      <span>{mockUser.firstName}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <a className="dropdown-item" href="/profile">
                          <i className="bi bi-person-badge"></i> My Profile
                        </a>
                      </li>
                      <li>
                        <button className="dropdown-item" data-testid="logout-button">
                          <i className="bi bi-box-arrow-right"></i> Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <div className="auth-buttons">
                    <a href="/signin" className="auth-btn btn-outline">Sign In</a>
                    <a href="/signup" className="auth-btn btn-filled">Sign Up</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  }
}));

// Note: cookieUtils is already mocked above, no need to duplicate

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

// Create a custom render function to include necessary providers
const renderWithProviders = (ui, { authState = {}, ...options } = {}) => {
  // Create a properly mocked auth context
  vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      ...authState,
    }),
    AuthProvider: ({ children }) => children
  }))

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
    cookieUtils.getUserInfo.mockReturnValue({
      firstName: 'John',
      gender: 'male'
    });
    
    renderWithProviders(<Header />);
    
    // Check for welcome message with appropriate gender title
    expect(screen.getByText(/Happy to have you again Mr. John!/)).toBeInTheDocument();
    
    // Test closing the welcome message
    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);
    
    // Verify the message is no longer displayed
    await waitFor(() => {
      expect(screen.queryByText(/Happy to have you again Mr. John!/)).not.toBeInTheDocument();
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
    
    // Get navbar element
    const navbar = document.querySelector('.navbar');
    expect(navbar).not.toHaveClass('scrolled');
    
    // Simulate scroll event
    const scrollEvent = new Event('scroll');
    global.window.scrollY = 30; // Set scrollY above the threshold
    global.window.dispatchEvent(scrollEvent);
    
    // Verify the scrolled class is applied
    await waitFor(() => {
      expect(navbar).toHaveClass('scrolled');
    });
  });
});
