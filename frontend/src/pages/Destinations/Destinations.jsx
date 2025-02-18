import React, { useState, useEffect, useRef } from 'react';
import './Destinations.css';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);
  const [filters, setFilters] = useState({
    cities: [],
    types: [],
    categories: [],
    priceRange: {
      min: '',
      max: ''
    }
  });
  const [schemaOptions, setSchemaOptions] = useState({
    cities: [],
    types: [],
    categories: []
  });
  const [groupedDestinations, setGroupedDestinations] = useState({});

  // Close filters when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch schema options for filters
  useEffect(() => {
    const fetchSchemaOptions = async () => {
      try {
        const response = await fetch('/api/destinations/schema-options');
        if (!response.ok) throw new Error('Failed to fetch schema options');
        const data = await response.json();
        setSchemaOptions(data);
      } catch (error) {
        console.error('Error fetching schema options:', error);
      }
    };
    fetchSchemaOptions();
  }, []);

  // Fetch destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations/activities');
        if (!response.ok) throw new Error('Failed to fetch destinations');
        const data = await response.json();
        setDestinations(data);
      } catch (error) {
        console.error('Error fetching destinations:', error);
      }
    };
    fetchDestinations();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...destinations];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(dest => 
        dest.name.toLowerCase().includes(term) ||
        dest.description.toLowerCase().includes(term)
      );
    }

    // Apply city filter
    if (filters.cities.length > 0) {
      filtered = filtered.filter(dest => filters.cities.includes(dest.locationCity));
    }

    // Apply type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(dest => filters.types.includes(dest.type));
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(dest => 
        dest.categories?.some(cat => filters.categories.includes(cat))
      );
    }

    // Apply price range filter
    if (filters.priceRange.min !== '') {
      filtered = filtered.filter(dest => dest.cost >= Number(filters.priceRange.min));
    }
    if (filters.priceRange.max !== '') {
      filtered = filtered.filter(dest => dest.cost <= Number(filters.priceRange.max));
    }

    // Group by city
    const grouped = filtered.reduce((acc, dest) => {
      const city = dest.locationCity;
      if (!acc[city]) acc[city] = [];
      acc[city].push(dest);
      return acc;
    }, {});

    setGroupedDestinations(grouped);
    setFilteredDestinations(filtered);
  }, [destinations, searchTerm, filters]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'priceRange') {
        newFilters.priceRange = { ...prev.priceRange, ...value };
      } else {
        const index = prev[type].indexOf(value);
        if (index === -1) {
          newFilters[type] = [...prev[type], value];
        } else {
          newFilters[type] = prev[type].filter(item => item !== value);
        }
      }
      
      return newFilters;
    });
  };

  const handlePriceRangeChange = (field, value) => {
    handleFilterChange('priceRange', { [field]: value });
  };

  return (
    <div className="destinations-page">
      <div className="destinations-navbar">
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container" ref={filterRef}>
            <button 
              className={`filter-button ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className="bi bi-funnel"></i>
              Filters
            </button>
            {showFilters && (
              <div className="filter-dropdown">
                <div className="filter-row">
                  <div className="filter-group">
                    <h3>Price Range</h3>
                    <div className="price-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange.min}
                        onChange={(e) => setFilters({
                          ...filters,
                          priceRange: { ...filters.priceRange, min: e.target.value }
                        })}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange.max}
                        onChange={(e) => setFilters({
                          ...filters,
                          priceRange: { ...filters.priceRange, max: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="filter-group">
                    <h3>Cities</h3>
                    <div className="checkbox-group">
                      {schemaOptions.cities.map(city => (
                        <label key={city} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={filters.cities.includes(city)}
                            onChange={() => handleFilterChange('cities', city)}
                          />
                          {city}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="filter-group">
                    <h3>Types</h3>
                    <div className="checkbox-group">
                      {schemaOptions.types.map(type => (
                        <label key={type} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={filters.types.includes(type)}
                            onChange={() => handleFilterChange('types', type)}
                          />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="filter-group">
                    <h3>Categories</h3>
                    <div className="checkbox-group">
                      {schemaOptions.categories.map(category => (
                        <label key={category} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category)}
                            onChange={() => handleFilterChange('categories', category)}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="destinations-content">
        {Object.entries(groupedDestinations).map(([city, cityDestinations]) => (
          <div key={city} className="city-section">
            <h2 className="city-title">{city}</h2>
            <div className="destinations-grid">
              {cityDestinations.map(destination => (
                <div key={destination._id} className="destination-card">
                  <div className="destination-image">
                    {destination.pictureUrls && destination.pictureUrls[0] ? (
                      <img
                        src={destination.pictureUrls[0]}
                        alt={destination.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    ) : (
                      <div className="no-image">No Image Available</div>
                    )}
                  </div>
                  <div className="destination-content">
                    <h3>{destination.name}</h3>
                    <p className="description">{destination.description}</p>
                    <div className="destination-details">
                      <span className="cost">
                        {destination.cost === 0 ? 'Free' : `${destination.cost} SAR`}
                      </span>
                      {destination.rating > 0 && (
                        <span className="rating">
                          <i className="bi bi-star-fill"></i>
                          {destination.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="destination-categories">
                      {destination.categories?.map(category => (
                        <span key={category} className="category-tag">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Destinations;
