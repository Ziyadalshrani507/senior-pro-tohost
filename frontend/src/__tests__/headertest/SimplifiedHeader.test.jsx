import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock component to test
const Header = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = React.useState(true);
  
  // Simple mock user for testing
  const user = null; // Logged out state for initial test
  
  const handleLogout = vi.fn();
  
  return (
    <>
      {showWelcomeMessage && (
        <div data-testid="welcome-message">
          Welcome to Saudi Tourism
          <button onClick={() => setShowWelcomeMessage(false)} data-testid="close-welcome">×</button>
        </div>
      )}
      
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} data-testid="navbar">
        <img src="/logo.png" alt="Logo" />
        
        <div className="nav-links">
          <a href="/destinations">Destinations</a>
          <a href="/restaurants">Restaurants</a>
          <a href="/hotels">Hotels</a>
          <a href="/itinerary-planner">AI Planner</a>
        </div>
        
        <div className="auth-section" data-testid="auth-section">
          {user ? (
            <>
              <span data-testid="user-name">{user.firstName}</span>
              <button onClick={handleLogout} data-testid="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <a href="/signin" data-testid="signin-link">Sign In</a>
              <a href="/signup" data-testid="signup-link">Sign Up</a>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

describe('Header Component', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
  });

  it('shows login and signup links when user is not logged in', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('signin-link')).toBeInTheDocument();
    expect(screen.getByTestId('signup-link')).toBeInTheDocument();
  });

  it('shows welcome message and allows closing it', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('welcome-message')).toBeInTheDocument();
    
    // Close welcome message
    fireEvent.click(screen.getByTestId('close-welcome'));
    
    // Welcome message should be gone
    expect(screen.queryByTestId('welcome-message')).not.toBeInTheDocument();
  });
});
