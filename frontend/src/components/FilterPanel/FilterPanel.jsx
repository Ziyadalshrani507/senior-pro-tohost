import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import './FilterPanel.css';

const FilterPanel = ({ 
  type,
  filters,
  schemaOptions,
  onFilterChange,
  onResetFilters 
}) => {
  const renderDestinationFilters = () => (
    <>
      <div className="filter-group">
        <label>City</label>
        <select 
          value={filters.city || ''} 
          onChange={(e) => onFilterChange('city', e.target.value)}
        >
          <option value="">All Cities</option>
          {schemaOptions.cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Popularity</label>
        <select 
          value={filters.popularity || ''} 
          onChange={(e) => onFilterChange('popularity', e.target.value)}
        >
          <option value="">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </>
  );

  const renderRestaurantFilters = () => (
    <>
      <div className="filter-group">
        <label>Cuisine Type</label>
        <select 
          value={filters.cuisine || ''} 
          onChange={(e) => onFilterChange('cuisine', e.target.value)}
        >
          <option value="">All Cuisines</option>
          {schemaOptions.cuisines?.map(cuisine => (
            <option key={cuisine} value={cuisine}>{cuisine}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Price Range</label>
        <select 
          value={filters.priceRange || ''} 
          onChange={(e) => onFilterChange('priceRange', e.target.value)}
        >
          <option value="">All Prices</option>
          <option value="$">$</option>
          <option value="$$">$$</option>
          <option value="$$$">$$$</option>
          <option value="$$$$">$$$$</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Rating</label>
        <select 
          value={filters.rating || ''} 
          onChange={(e) => onFilterChange('rating', e.target.value)}
        >
          <option value="">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Location</label>
        <select 
          value={filters.locationCity || ''} 
          onChange={(e) => onFilterChange('locationCity', e.target.value)}
        >
          <option value="">All Locations</option>
          {schemaOptions.cities?.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
    </>
  );

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3><FaFilter /> Filters</h3>
        <button className="reset-btn" onClick={onResetFilters}>
          <FaTimes /> Reset
        </button>
      </div>
      
      <div className="filter-content">
        {type === 'destinations' ? renderDestinationFilters() : renderRestaurantFilters()}
        
        <div className="filter-group">
          <label>Sort By</label>
          <select 
            value={filters.sortBy || 'name'} 
            onChange={(e) => onFilterChange('sortBy', e.target.value)}
          >
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            {type === 'restaurants' && <option value="price">Price</option>}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
