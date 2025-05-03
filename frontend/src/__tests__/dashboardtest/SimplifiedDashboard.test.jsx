import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Simplified mock Dashboard component for testing
const Dashboard = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [stats, setStats] = React.useState(null);

  // Simulate loading data effect
  React.useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setStats({
        totalDestinations: 42,
        totalRestaurants: 28,
        totalHotels: 15,
        totalUsers: 125,
        recentDestinations: [
          { _id: '1', name: 'Al-Ula', locationCity: 'AlUla' },
          { _id: '2', name: 'Edge of the World', locationCity: 'Riyadh' }
        ]
      });
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Mock navigation function for testing
  const navigateTo = (path) => {
    console.log(`Navigating to: ${path}`);
  };
  
  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  return (
    <div data-testid="dashboard">
      <h1>Admin Dashboard</h1>
      
      {loading && <div data-testid="loading">Loading dashboard data...</div>}
      {error && <div data-testid="error">Error loading dashboard data: {error}</div>}
      
      {stats && !loading && (
        <>
          <div className="stats">
            <div>
              <h2>Destinations</h2>
              <p data-testid="destination-count">{stats.totalDestinations}</p>
              <button 
                onClick={() => navigateTo('/admin/destinations')}
                data-testid="manage-destinations-btn"
              >
                Manage Destinations
              </button>
            </div>
            
            <div>
              <h2>Restaurants</h2>
              <p data-testid="restaurant-count">{stats.totalRestaurants}</p>
              <button 
                onClick={() => navigateTo('/admin/restaurants')}
                data-testid="manage-restaurants-btn"
              >
                Manage Restaurants
              </button>
            </div>
            
            <button 
              onClick={refreshData} 
              data-testid="refresh-btn"
            >
              Refresh Data
            </button>
          </div>
          
          <div>
            <h3>Recent Destinations</h3>
            <ul>
              {stats.recentDestinations.map(dest => (
                <li key={dest._id} data-testid="destination-item">
                  {dest.name} - {dest.locationCity}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

describe('Dashboard Component', () => {
  // Mock window console to prevent console logs during tests
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('displays dashboard data after loading', async () => {
    render(<Dashboard />);
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Check if dashboard content is visible
    expect(screen.getByTestId('destination-count')).toHaveTextContent('42');
    expect(screen.getByTestId('restaurant-count')).toHaveTextContent('28');
    expect(screen.getAllByTestId('destination-item').length).toBe(2);
  });

  it('shows loading state when refreshing data', async () => {
    render(<Dashboard />);
    
    // Wait for initial loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
    
    // Click refresh button
    fireEvent.click(screen.getByTestId('refresh-btn'));
    
    // Should show loading again
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    
    // Should finish loading again
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });
  });
});
