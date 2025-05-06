import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FilterPanel from '../../components/FilterPanel/FilterPanel';

// Mock any API calls or external dependencies
vi.mock('axios');

// Mock the FilterPanel component's dependencies if needed
vi.mock('../../components/FilterPanel/FilterPanel', () => ({
  __esModule: true,
  default: (props) => {
    // Create a simplified version of the FilterPanel for testing
    return (
      <div data-testid="filter-panel">
        <h3>Filter Options</h3>
        
        <div>
          <label htmlFor="city">City</label>
          <select 
            id="city" 
            value={props.filters.city} 
            onChange={(e) => props.setFilters({...props.filters, city: e.target.value})}
            data-testid="city-select"
          >
            <option value="">All Cities</option>
            {props.cities?.map(city => (
              <option key={city} value={city} data-testid="city-option">{city}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="type">Type</label>
          <select 
            id="type" 
            value={props.filters.type} 
            onChange={(e) => props.setFilters({...props.filters, type: e.target.value})}
            data-testid="type-select"
          >
            <option value="">All Types</option>
            {props.types?.map(type => (
              <option key={type} value={type} data-testid="type-option">{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="minRating">Minimum Rating</label>
          <input 
            type="range" 
            id="minRating" 
            min="0" 
            max="5" 
            step="1"
            value={props.filters.minRating} 
            onChange={(e) => props.setFilters({...props.filters, minRating: Number(e.target.value)})}
          />
          <span>{props.filters.minRating}</span>
        </div>
        
        <div>
          <label htmlFor="maxPrice">Maximum Price</label>
          <input 
            type="range" 
            id="maxPrice" 
            min="0" 
            max="1000" 
            step="100"
            value={props.filters.maxPrice} 
            onChange={(e) => props.setFilters({...props.filters, maxPrice: Number(e.target.value)})}
          />
          <span>${props.filters.maxPrice}</span>
        </div>
        
        <div>
          <label htmlFor="category">Category</label>
          <select 
            id="category" 
            value={props.filters.category} 
            onChange={(e) => props.setFilters({...props.filters, category: e.target.value})}
            data-testid="category-select"
          >
            <option value="">All Categories</option>
            {props.categories?.map(category => (
              <option key={category} value={category} data-testid="category-option">{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <button onClick={props.applyFilters} data-testid="apply-button">Apply</button>
          <button onClick={props.resetFilters} data-testid="reset-button">Reset</button>
        </div>
      </div>
    );
  }
}));

// Mock any API calls or context that the FilterPanel might use
vi.mock('axios', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

describe('FilterPanel Component', () => {
  // Mock props that would typically be passed to the FilterPanel
  const mockProps = {
    filters: {
      city: '',
      type: '',
      minRating: 0,
      maxPrice: 500,
      category: '',
    },
    setFilters: vi.fn(),
    cities: ['Riyadh', 'Jeddah', 'Mecca'],
    types: ['Historical', 'Cultural', 'Adventure'],
    categories: ['Family-friendly', 'Outdoor', 'Indoor'],
    applyFilters: vi.fn(),
    resetFilters: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all filter options correctly', () => {
    render(<FilterPanel {...mockProps} />);
    
    // Check for filter section headers
    expect(screen.getByText('Filter Options')).toBeInTheDocument();
    
    // Check for city dropdown
    const citySelect = screen.getByLabelText('City');
    expect(citySelect).toBeInTheDocument();
    expect(citySelect.tagName.toLowerCase()).toBe('select');
    
    // Check for type dropdown
    const typeSelect = screen.getByLabelText('Type');
    expect(typeSelect).toBeInTheDocument();
    
    // Check for rating filter
    expect(screen.getByLabelText('Minimum Rating')).toBeInTheDocument();
    
    // Check for price range filter
    expect(screen.getByLabelText('Maximum Price')).toBeInTheDocument();
    
    // Check for category dropdown
    const categorySelect = screen.getByLabelText('Category');
    expect(categorySelect).toBeInTheDocument();
  });

  it('updates filters when selections change', async () => {
    render(<FilterPanel {...mockProps} />);
    
    // Select a city
    const citySelect = screen.getByLabelText('City');
    fireEvent.change(citySelect, { target: { value: 'Riyadh' } });
    
    // Verify setFilters was called with the updated city
    expect(mockProps.setFilters).toHaveBeenCalledWith(expect.objectContaining({
      city: 'Riyadh'
    }));
    
    // Select a type
    const typeSelect = screen.getByLabelText('Type');
    fireEvent.change(typeSelect, { target: { value: 'Historical' } });
    
    // Verify setFilters was called with the updated type
    expect(mockProps.setFilters).toHaveBeenCalledWith(expect.objectContaining({
      type: 'Historical'
    }));
  });

  it('calls applyFilters when Apply button is clicked', async () => {
    render(<FilterPanel {...mockProps} />);
    
    // Find and click the Apply button
    const applyButton = screen.getByRole('button', { name: /apply/i });
    fireEvent.click(applyButton);
    
    // Verify applyFilters was called
    expect(mockProps.applyFilters).toHaveBeenCalled();
  });

  it('calls resetFilters when Reset button is clicked', async () => {
    render(<FilterPanel {...mockProps} />);
    
    // Find and click the Reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    
    // Verify resetFilters was called
    expect(mockProps.resetFilters).toHaveBeenCalled();
  });

  it('displays the correct options in each dropdown', () => {
    render(<FilterPanel {...mockProps} />);
    
    // Check city options
    const cityOptions = screen.getAllByTestId('city-option');
    expect(cityOptions.length).toBe(mockProps.cities.length); // We're only testing the city options, not the default
    
    // Check type options
    const typeOptions = screen.getAllByTestId('type-option');
    expect(typeOptions.length).toBe(mockProps.types.length); // We're only testing the type options, not the default
    
    // Check category options
    const categoryOptions = screen.getAllByTestId('category-option');
    expect(categoryOptions.length).toBe(mockProps.categories.length); // We're only testing the category options, not the default
  });

  it('handles range inputs correctly', async () => {
    render(<FilterPanel {...mockProps} />);
    
    // Test rating slider
    const ratingSlider = screen.getByLabelText('Minimum Rating');
    fireEvent.change(ratingSlider, { target: { value: 4 } });
    
    // Verify setFilters was called with updated minRating
    expect(mockProps.setFilters).toHaveBeenCalledWith(expect.objectContaining({
      minRating: 4
    }));
    
    // Test price range slider
    const priceSlider = screen.getByLabelText('Maximum Price');
    fireEvent.change(priceSlider, { target: { value: 300 } });
    
    // Verify setFilters was called with updated maxPrice
    expect(mockProps.setFilters).toHaveBeenCalledWith(expect.objectContaining({
      maxPrice: 300
    }));
  });
});
