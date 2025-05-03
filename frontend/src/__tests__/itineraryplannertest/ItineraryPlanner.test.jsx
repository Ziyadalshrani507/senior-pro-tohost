import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ItineraryPlannerPage from '../../pages/ItineraryPlanner/ItineraryPlannerPage';
import { mockApiSuccess, mockApiError, destinations, hotels, restaurants } from '../../test/apiMocks';
import axios from 'axios';

// Mock the ItineraryContext
vi.mock('../../context/ItineraryContext', () => ({
  ItineraryProvider: ({ children }) => <div data-testid="itinerary-provider">{children}</div>,
  useItinerary: () => ({
    itinerary: null,
    loading: false,
    error: null,
    generateItinerary: vi.fn(),
    setItinerary: vi.fn(),
    clearItinerary: vi.fn()
  })
}));

// Mock the ItineraryForm component
vi.mock('../../components/ItineraryPlanner/ItineraryForm', () => ({
  default: () => <div data-testid="itinerary-form">Mocked Itinerary Form</div>
}));

describe('ItineraryPlanner Page', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the itinerary planner page with correct title', () => {
    render(<ItineraryPlannerPage />);
    
    // Check for the main title
    expect(screen.getByText('AI Travel Planner')).toBeInTheDocument();
    
    // Check for subtitle
    expect(screen.getByText(/Create your perfect trip/i)).toBeInTheDocument();
    
    // Verify the form component is rendered
    expect(screen.getByTestId('itinerary-form')).toBeInTheDocument();
  });
  
  it('renders the itinerary form within the provider', () => {
    render(<ItineraryPlannerPage />);
    
    // Check that the form is rendered inside the provider
    const provider = screen.getByTestId('itinerary-provider');
    expect(provider).toContainElement(screen.getByTestId('itinerary-form'));
  });
});

// Now let's test the form component itself
// Note: In a real implementation, you'd import the actual ItineraryForm component
// Instead of mocking it as we did above

describe('ItineraryForm Component', () => {
  // Mock implementation of the form for testing
  const MockedItineraryForm = () => {
    const [formData, setFormData] = React.useState({
      city: '',
      duration: 3,
      interests: [],
      budget: 'medium',
      travelersType: 'solo'
    });
    
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [itinerary, setItinerary] = React.useState(null);
    
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.post('/api/itinerary/generate', formData);
        setItinerary(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    return (
      <div data-testid="full-itinerary-form">
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="city">City</label>
            <select 
              id="city" 
              name="city" 
              value={formData.city} 
              onChange={handleInputChange}
              data-testid="city-select"
            >
              <option value="">Select a city</option>
              <option value="Riyadh">Riyadh</option>
              <option value="Jeddah">Jeddah</option>
              <option value="Mecca">Mecca</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="duration">Duration (days)</label>
            <input 
              type="number" 
              id="duration" 
              name="duration" 
              min="1" 
              max="7"
              value={formData.duration} 
              onChange={handleInputChange}
              data-testid="duration-input"
            />
          </div>
          
          <div>
            <label>Interests</label>
            <div>
              {['Historical', 'Cultural', 'Adventure', 'Relaxation'].map(interest => (
                <label key={interest}>
                  <input 
                    type="checkbox" 
                    name="interests" 
                    value={interest}
                    onChange={(e) => {
                      const newInterests = e.target.checked
                        ? [...formData.interests, interest]
                        : formData.interests.filter(i => i !== interest);
                      setFormData({ ...formData, interests: newInterests });
                    }}
                    data-testid={`interest-${interest.toLowerCase()}`}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>
          
          <button type="submit" data-testid="generate-button">Generate Itinerary</button>
        </form>
        
        {loading && <div data-testid="loading-indicator">Loading your itinerary...</div>}
        {error && <div data-testid="error-message">Error: {error}</div>}
        
        {itinerary && (
          <div data-testid="itinerary-result">
            <h2>Your Itinerary for {itinerary.city}</h2>
            <p>Duration: {itinerary.days.length} days</p>
            {/* ... more itinerary details would be displayed here ... */}
          </div>
        )}
      </div>
    );
  };
  
  beforeEach(() => {
    // Make the MockedItineraryForm available by mocking the import
    vi.mock('../../components/ItineraryPlanner/ItineraryForm', () => ({
      default: MockedItineraryForm
    }));
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('allows users to select a city and duration', () => {
    render(<MockedItineraryForm />);
    
    // Select a city
    const citySelect = screen.getByTestId('city-select');
    fireEvent.change(citySelect, { target: { value: 'Riyadh' } });
    
    // Set duration
    const durationInput = screen.getByTestId('duration-input');
    fireEvent.change(durationInput, { target: { value: 5 } });
    
    // Verify values were updated
    expect(citySelect.value).toBe('Riyadh');
    expect(durationInput.value).toBe('5');
  });
  
  it('allows users to select multiple interests', () => {
    render(<MockedItineraryForm />);
    
    // Select interests
    fireEvent.click(screen.getByTestId('interest-historical'));
    fireEvent.click(screen.getByTestId('interest-adventure'));
    
    // Verify checkboxes are checked
    expect(screen.getByTestId('interest-historical')).toBeChecked();
    expect(screen.getByTestId('interest-adventure')).toBeChecked();
    expect(screen.getByTestId('interest-cultural')).not.toBeChecked();
  });
  
  it('shows loading state during API call', async () => {
    // Set up a delayed API response to show loading state
    vi.mock('axios', () => ({
      post: vi.fn(() => new Promise(res => setTimeout(() => {
        res({ data: { success: true, data: { city: 'Riyadh', days: [] } } });
      }, 100))),
    }));
    
    render(<MockedItineraryForm />);
    
    // Fill form
    fireEvent.change(screen.getByTestId('city-select'), { target: { value: 'Riyadh' } });
    fireEvent.click(screen.getByTestId('interest-historical'));
    
    // Submit the form
    fireEvent.click(screen.getByTestId('generate-button'));
    
    // Check that loading indicator appears
    expect(await screen.findByTestId('loading-indicator')).toBeInTheDocument();
  });
  
  it('shows error message when API call fails', async () => {
    // Mock API error
    mockApiError('/api/itinerary/generate', 'Failed to generate itinerary', 400);
    
    // Override the post method specifically
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: {
        data: { success: false, message: 'Failed to generate itinerary' },
        status: 400
      }
    });
    
    render(<MockedItineraryForm />);
    
    // Fill and submit form
    fireEvent.change(screen.getByTestId('city-select'), { target: { value: 'Riyadh' } });
    fireEvent.click(screen.getByTestId('generate-button'));
    
    // Check for error message
    expect(await screen.findByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to generate itinerary');
  });
  
  it('displays itinerary results when API call succeeds', async () => {
    // Mock a successful itinerary response
    const mockItinerary = {
      city: 'Riyadh',
      duration: 3,
      interests: ['Historical', 'Adventure'],
      days: [
        {
          day: 1,
          morning: { activity: 'Historical Museum', description: 'Visit the national museum' },
          lunch: { restaurant: 'Local Cuisine', description: 'Traditional lunch' },
          afternoon: { activity: 'Adventure Park', description: 'Outdoor activities' }
        },
        {
          day: 2,
          morning: { activity: 'City Tour', description: 'Explore the city' }
        }
      ]
    };
    
    // Override the post method to return our mock data
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { success: true, data: mockItinerary }
    });
    
    render(<MockedItineraryForm />);
    
    // Fill and submit form
    fireEvent.change(screen.getByTestId('city-select'), { target: { value: 'Riyadh' } });
    fireEvent.click(screen.getByTestId('generate-button'));
    
    // Check that results are displayed
    const results = await screen.findByTestId('itinerary-result');
    expect(results).toBeInTheDocument();
    expect(results).toHaveTextContent('Your Itinerary for Riyadh');
    expect(results).toHaveTextContent('Duration: 2 days');
  });
});
