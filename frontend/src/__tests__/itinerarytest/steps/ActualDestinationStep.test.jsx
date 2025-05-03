import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DestinationStep from '../../../components/ItineraryPlanner/steps/DestinationStep';
import axios from 'axios';
import { getApiBaseUrl } from '../../../utils/apiBaseUrl';

// Import safeguards to prevent real API calls
import '../../../test/safeguards';

// Mock the API base URL to ensure we're not hitting a real API
vi.mock('../../../utils/apiBaseUrl', () => ({
  getApiBaseUrl: vi.fn().mockReturnValue('http://test-api')
}));

// Mock axios
vi.mock('axios');

// Mock the Itinerary Context
const mockUpdateFormData = vi.fn();
const mockNextStep = vi.fn();

vi.mock('../../../context/ItineraryContext', () => ({
  useItinerary: () => ({
    formData: { city: '' },
    updateFormData: mockUpdateFormData,
    nextStep: mockNextStep
  })
}));

describe('DestinationStep Component (Actual Implementation)', () => {
  const mockDestinationsData = [
    {
      _id: '1',
      name: 'AlUla Historic District',
      locationCity: 'AlUla',
      description: 'Ancient city with well-preserved tombs',
      pictureUrls: ['https://example.com/alula1.jpg', 'https://example.com/alula2.jpg']
    },
    {
      _id: '2',
      name: 'Kingdom Centre Tower',
      locationCity: 'Riyadh',
      description: 'Iconic skyscraper in the capital',
      pictureUrls: ['https://example.com/riyadh1.jpg']
    },
    {
      _id: '3',
      name: 'Al-Balad',
      locationCity: 'Jeddah',
      description: 'Historic district with traditional architecture',
      pictureUrls: ['https://example.com/jeddah1.jpg']
    },
    {
      _id: '4',
      name: 'The Prophet\'s Mosque',
      locationCity: 'Madinah',
      description: 'Sacred mosque in Madinah',
      pictureUrls: ['https://example.com/madinah1.jpg']
    },
    {
      _id: '5',
      name: 'Abraj Al-Bait',
      locationCity: 'Makkah',
      description: 'Clock tower complex',
      pictureUrls: ['https://example.com/makkah1.jpg']
    },
    {
      _id: '6',
      name: 'Elephant Rock',
      locationCity: 'AlUla',
      description: 'Natural rock formation',
      pictureUrls: ['https://example.com/alula3.jpg']
    },
    {
      _id: '7',
      name: 'Edge of the World',
      locationCity: 'Riyadh',
      description: 'Dramatic cliff offering stunning views',
      pictureUrls: ['https://example.com/riyadh2.jpg']
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    console.log('🔒 Test environment initialized - No real API calls will be made');
    
    // Default mock for successful API response
    axios.get.mockResolvedValue({
      data: mockDestinationsData
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Don't resolve the axios promise yet
    axios.get.mockReturnValue(new Promise(() => {}));
    
    render(<DestinationStep />);
    
    // Should show loading state
    expect(screen.getByText('Loading destinations...')).toBeInTheDocument();
  });

  it('shows error message when API call fails', async () => {
    // Mock API failure
    axios.get.mockRejectedValueOnce(new Error('API failure'));
    
    render(<DestinationStep />);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to load cities')).toBeInTheDocument();
    });
    
    // Verify the API was called correctly
    expect(axios.get).toHaveBeenCalledWith('http://test-api/destinations');
  });

  it('displays available cities after successful API call', async () => {
    render(<DestinationStep />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.queryByText('Loading destinations...')).not.toBeInTheDocument();
    });
    
    // The cities should be displayed - we expect 5 unique cities from our mock data
    expect(screen.getByText('AlUla')).toBeInTheDocument();
    expect(screen.getByText('Riyadh')).toBeInTheDocument();
    expect(screen.getByText('Jeddah')).toBeInTheDocument();
    expect(screen.getByText('Madinah')).toBeInTheDocument();
    expect(screen.getByText('Makkah')).toBeInTheDocument();
    
    // Verify the API was called correctly
    expect(axios.get).toHaveBeenCalledWith('http://test-api/destinations');
  });

  it('navigates to next step when a city is selected', async () => {
    render(<DestinationStep />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.queryByText('Loading destinations...')).not.toBeInTheDocument();
    });
    
    // Click on Riyadh city card
    fireEvent.click(screen.getByText('Riyadh'));
    
    // Should call updateFormData with the correct city
    expect(mockUpdateFormData).toHaveBeenCalledWith({ 
      city: 'Riyadh',
      destinationName: 'Riyadh'
    });
    
    // Should proceed to the next step
    expect(mockNextStep).toHaveBeenCalled();
  });

  it('shows pagination controls when there are multiple pages of cities', async () => {
    // Create mock data with more cities to trigger pagination
    const manyDestinations = Array(20).fill(0).map((_, i) => ({
      _id: `${i+10}`,
      name: `Destination ${i+1}`,
      locationCity: `City${i+1}`,
      description: `Description ${i+1}`,
      pictureUrls: [`https://example.com/city${i+1}.jpg`]
    }));
    
    // Mock API response with many cities
    axios.get.mockResolvedValueOnce({
      data: manyDestinations
    });
    
    render(<DestinationStep />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.queryByText('Loading destinations...')).not.toBeInTheDocument();
    });
    
    // Should show pagination controls
    expect(screen.getByText('Page 1 of', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    
    // Previous button should be disabled on first page
    const prevButton = screen.getByText('Previous').closest('button');
    expect(prevButton).toBeDisabled();
    
    // Next button should be enabled
    const nextButton = screen.getByText('Next').closest('button');
    expect(nextButton).not.toBeDisabled();
    
    // Click next page
    fireEvent.click(nextButton);
    
    // Should update page indicator
    expect(screen.getByText('Page 2 of', { exact: false })).toBeInTheDocument();
  });

  it('shows error message when API returns empty array', async () => {
    // Mock empty API response
    axios.get.mockResolvedValueOnce({
      data: []
    });
    
    render(<DestinationStep />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.queryByText('Loading destinations...')).not.toBeInTheDocument();
    });
    
    // Should show error message based on the actual component behavior
    expect(screen.getByText('No destination data available')).toBeInTheDocument();
  });
});
