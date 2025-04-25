import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { useDebounce } from '../../hooks/useDebounce';
import './SearchAll.css';

const SearchAll = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState({
    hotels: [],
    destinations: [],
    restaurants: []
  });
  const [loading, setLoading] = useState(false);
  const filterRef = useRef(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      performSearch();
    }
  };

  // Search function based on active category and search term
  const performSearch = async () => {
    if (!debouncedSearchTerm) return;
    
    setLoading(true);
    try {
      // Here you would integrate with your API to search for results
      // For example:
      // const response = await fetch(`/api/search/${activeCategory}?q=${debouncedSearchTerm}`);
      // const data = await response.json();
      
      // Simulating API response for now
      setTimeout(() => {
        // Mock results
        const mockResults = {
          hotels: activeCategory === 'all' || activeCategory === 'hotels' ? 
            [{ id: 1, name: 'Grand Hotel', city: 'Riyadh' }, { id: 2, name: 'Luxury Inn', city: 'Jeddah' }] : [],
          destinations: activeCategory === 'all' || activeCategory === 'thingsToDo' ? 
            [{ id: 1, name: 'Historic Center', city: 'Riyadh' }, { id: 2, name: 'Beach Resort', city: 'Jeddah' }] : [],
          restaurants: activeCategory === 'all' || activeCategory === 'restaurants' ? 
            [{ id: 1, name: 'Traditional Cuisine', city: 'Riyadh' }, { id: 2, name: 'Seafood Place', city: 'Jeddah' }] : [],
        };

        setResults(mockResults);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Search error:', error);
      setLoading(false);
    }
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search when debounced term changes or active category changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch();
    }
  }, [debouncedSearchTerm, activeCategory]);

  return (
    <div className="search-all-page">
      <div className="search-section-container">
        <div className="search-section-centered">
          <h1 className="search-title">Where to?</h1>
          
          <div className="category-buttons">
            <button 
              className={`category-button ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              Search All
            </button>
            <button 
              className={`category-button ${activeCategory === 'hotels' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('hotels')}
            >
              Hotels
            </button>
            <button 
              className={`category-button ${activeCategory === 'thingsToDo' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('thingsToDo')}
            >
              Things to Do
            </button>
            <button 
              className={`category-button ${activeCategory === 'restaurants' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('restaurants')}
            >
              Restaurants
            </button>
          </div>
          
          <div className="search-input-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search destinations, hotels, restaurants..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  <FaSearch className="search-icon" /> Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {(searchTerm || loading) && (
        <div className="search-results-container">
          {loading ? (
            <div className="loading-spinner">Loading results...</div>
          ) : (
            <div className="results-section">
              {activeCategory === 'all' && (
                <>
                  {results.hotels.length > 0 && (
                    <div className="category-section">
                      <h2>Hotels</h2>
                      <div className="results-grid">
                        {results.hotels.map(item => (
                          <div key={item.id} className="result-card">
                            <h3>{item.name}</h3>
                            <p>{item.city}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.destinations.length > 0 && (
                    <div className="category-section">
                      <h2>Things to Do</h2>
                      <div className="results-grid">
                        {results.destinations.map(item => (
                          <div key={item.id} className="result-card">
                            <h3>{item.name}</h3>
                            <p>{item.city}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {results.restaurants.length > 0 && (
                    <div className="category-section">
                      <h2>Restaurants</h2>
                      <div className="results-grid">
                        {results.restaurants.map(item => (
                          <div key={item.id} className="result-card">
                            <h3>{item.name}</h3>
                            <p>{item.city}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {activeCategory === 'hotels' && (
                <div className="category-section">
                  <h2>Hotels</h2>
                  <div className="results-grid">
                    {results.hotels.length > 0 ? (
                      results.hotels.map(item => (
                        <div key={item.id} className="result-card">
                          <h3>{item.name}</h3>
                          <p>{item.city}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-results">No hotels found matching your search.</p>
                    )}
                  </div>
                </div>
              )}
              
              {activeCategory === 'thingsToDo' && (
                <div className="category-section">
                  <h2>Things to Do</h2>
                  <div className="results-grid">
                    {results.destinations.length > 0 ? (
                      results.destinations.map(item => (
                        <div key={item.id} className="result-card">
                          <h3>{item.name}</h3>
                          <p>{item.city}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-results">No attractions found matching your search.</p>
                    )}
                  </div>
                </div>
              )}
              
              {activeCategory === 'restaurants' && (
                <div className="category-section">
                  <h2>Restaurants</h2>
                  <div className="results-grid">
                    {results.restaurants.length > 0 ? (
                      results.restaurants.map(item => (
                        <div key={item.id} className="result-card">
                          <h3>{item.name}</h3>
                          <p>{item.city}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-results">No restaurants found matching your search.</p>
                    )}
                  </div>
                </div>
              )}
              
              {searchTerm && !loading && 
                results.hotels.length === 0 && 
                results.destinations.length === 0 && 
                results.restaurants.length === 0 && (
                  <div className="no-results-message">
                    <h2>No results found</h2>
                    <p>Try different keywords or filters</p>
                  </div>
                )
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAll;