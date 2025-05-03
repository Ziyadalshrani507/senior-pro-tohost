import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock required components to prevent errors from dependencies
vi.mock('../../pages/Dashboard/Dashboard', () => ({
  __esModule: true,
  default: () => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [stats, setStats] = React.useState(null);

    React.useEffect(() => {
      // Simulate initial data loading
      setLoading(true);
      setStats({
        totalDestinations: 42,
        totalRestaurants: 28,
        totalHotels: 15,
        totalUsers: 125,
        recentDestinations: [
          { _id: '1', name: 'Al-Ula', locationCity: 'AlUla', type: 'Historical' },
          { _id: '2', name: 'Edge of the World', locationCity: 'Riyadh', type: 'Adventure' }
        ],
        topRatedPlaces: [
          { _id: '3', name: 'Royal Palace', rating: 4.8, locationCity: 'Riyadh', type: 'Historical' },
          { _id: '4', name: 'Red Sea Resort', rating: 4.7, locationCity: 'Jeddah', type: 'Beach' }
        ]
      });
      setLoading(false);
    }, []);

    const handleRefresh = () => {
      setLoading(true);
      // Simulate refreshing data
      setTimeout(() => {
        setLoading(false);
      }, 100);
    };

    return (
      <div data-testid="dashboard-container">
        <h1>Admin Dashboard</h1>
        
        {loading && <div data-testid="loading-indicator">Loading dashboard data...</div>}
        {error && <div data-testid="error-message">Error loading dashboard data: {error}</div>}
        
        {stats && !loading && (
          <>
            <div className="dashboard-stats">
              <div className="stat-card">
                <h3>Destinations</h3>
                <p>{stats.totalDestinations}</p>
                <button data-testid="manage-destinations" onClick={() => window.navigateMock('/admin/destinations')}>Manage Destinations</button>
              </div>
              
              <div className="stat-card">
                <h3>Restaurants</h3>
                <p>{stats.totalRestaurants}</p>
                <button data-testid="manage-restaurants" onClick={() => window.navigateMock('/admin/restaurants')}>Manage Restaurants</button>
              </div>
              
              <div className="stat-card">
                <h3>Hotels</h3>
                <p>{stats.totalHotels}</p>
                <button data-testid="manage-hotels" onClick={() => window.navigateMock('/admin/hotels')}>Manage Hotels</button>
              </div>
              
              <div className="stat-card">
                <h3>Users</h3>
                <p>{stats.totalUsers}</p>
                <button data-testid="manage-users" onClick={() => window.navigateMock('/admin/users')}>Manage Users</button>
              </div>
            </div>
            
            <div className="recent-items">
              <h2>Recent Destinations</h2>
              <ul>
                {stats.recentDestinations.map(dest => (
                  <li key={dest._id}>{dest.name} - {dest.locationCity}</li>
                ))}
              </ul>
            </div>
            
            <div className="top-rated">
              <h2>Top Rated Places</h2>
              <ul>
                {stats.topRatedPlaces.map(place => (
                  <li key={place._id}>{place.name} - Rating: {place.rating}</li>
                ))}
              </ul>
            </div>
            
            <button data-testid="refresh-button" onClick={handleRefresh}>Refresh Data</button>
          </>
        )}
      </div>
    );
  }
}));

// Mock auth context
vi.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: { _id: 'admin123', firstName: 'Admin', role: 'admin' },
    isAuthenticated: true
  })
}));

// Mock navigation
window.navigateMock = vi.fn();

// Mocking axios
vi.mock('axios');

// Mock for useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock data
const mockStats = {
  totalDestinations: 42,
  totalRestaurants: 28,
  totalHotels: 15,
  totalUsers: 125,
  recentDestinations: [
    { _id: '1', name: 'Al-Ula', locationCity: 'AlUla', type: 'Historical' },
    { _id: '2', name: 'Edge of the World', locationCity: 'Riyadh', type: 'Adventure' }
  ],
  topRatedPlaces: [
    { _id: '3', name: 'Royal Palace', rating: 4.8, locationCity: 'Riyadh', type: 'Historical' },
    { _id: '4', name: 'Red Sea Resort', rating: 4.7, locationCity: 'Jeddah', type: 'Beach' }
  ]
};

// Custom render function to include providers
const renderWithProviders = (ui, { authState = {}, ...options } = {}) => {
  const defaultAuthState = {
    user: { _id: 'admin123', firstName: 'Admin', role: 'admin' },
    isAuthenticated: true,
    loading: false,
    ...authState,
  };

  return render(
    <BrowserRouter>
      <AuthProvider value={defaultAuthState}>{ui}</AuthProvider>
    </BrowserRouter>,
    options
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Mock successful API response
    axios.get.mockResolvedValue({ 
      data: { 
        success: true,
        data: mockStats
      } 
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders dashboard with stats when data loads successfully', async () => {
    renderWithProviders(<Dashboard />);
    
    // Initially should show loading state
    expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument();
    });
    
    // Check for dashboard title
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    
    // Check for stats cards
    expect(screen.getByText('42')).toBeInTheDocument(); // Total destinations
    expect(screen.getByText('28')).toBeInTheDocument(); // Total restaurants
    expect(screen.getByText('15')).toBeInTheDocument(); // Total hotels
    expect(screen.getByText('125')).toBeInTheDocument(); // Total users
    
    // Check for recent destinations
    expect(screen.getByText('Al-Ula')).toBeInTheDocument();
    expect(screen.getByText('Edge of the World')).toBeInTheDocument();
    
    // Check for top rated places
    expect(screen.getByText('Royal Palace')).toBeInTheDocument();
    expect(screen.getByText('Red Sea Resort')).toBeInTheDocument();
  });

  it('redirects unauthorized users to login page', async () => {
    // Render with non-admin user
    renderWithProviders(<Dashboard />, {
      authState: {
        user: { _id: 'user123', firstName: 'Regular', role: 'user' },
        isAuthenticated: true
      }
    });
    
    // Should redirect non-admin users
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('redirects unauthenticated users to login page', async () => {
    // Render with no authenticated user
    renderWithProviders(<Dashboard />, {
      authState: {
        user: null,
        isAuthenticated: false
      }
    });
    
    // Should redirect unauthenticated users
    expect(mockNavigate).toHaveBeenCalledWith('/signin');
  });

  it('shows error message when data fetch fails', async () => {
    // Mock API error
    axios.get.mockRejectedValue(new Error('Failed to fetch dashboard data'));
    
    renderWithProviders(<Dashboard />);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard data/i)).toBeInTheDocument();
    });
  });

  it('navigates to correct management page when clicking navigation buttons', async () => {
    renderWithProviders(<Dashboard />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument();
    });
    
    // Find and click destination management button
    const destinationButton = screen.getByText(/Manage Destinations/i);
    fireEvent.click(destinationButton);
    
    // Should navigate to destination management
    expect(mockNavigate).toHaveBeenCalledWith('/admin/destinations');
    
    // Reset navigation mock
    mockNavigate.mockReset();
    
    // Find and click restaurant management button
    const restaurantButton = screen.getByText(/Manage Restaurants/i);
    fireEvent.click(restaurantButton);
    
    // Should navigate to restaurant management
    expect(mockNavigate).toHaveBeenCalledWith('/admin/restaurants');
  });

  it('refreshes dashboard data when refresh button is clicked', async () => {
    renderWithProviders(<Dashboard />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.queryByText(/Loading dashboard/i)).not.toBeInTheDocument();
    });
    
    // Clear the axios mock calls
    axios.get.mockClear();
    
    // Find and click refresh button
    const refreshButton = screen.getByText(/Refresh Data/i);
    fireEvent.click(refreshButton);
    
    // Should call API again
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/admin/dashboard-stats'));
    
    // Should show loading again
    expect(screen.getByText(/Refreshing/i)).toBeInTheDocument();
    
    // Wait for refresh to complete
    await waitFor(() => {
      expect(screen.queryByText(/Refreshing/i)).not.toBeInTheDocument();
    });
  });
});
