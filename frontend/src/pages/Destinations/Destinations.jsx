import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Destinations.css';
import { toast } from 'react-toastify';
import Card from '../../components/Card/Card';
import LoginPromptModal from '../../components/LoginPromptModal/LoginPromptModal';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import { setLastDestinationCookie, setLastSearchedCityCookie } from '../../utils/cookieUtils';

const ITEMS_PER_PAGE = 12;

const Destinations = () => {
  const navigate = useNavigate();
  const [allDestinations, setAllDestinations] = useState([]); // Store all destinations
  const [filteredDestinations, setFilteredDestinations] = useState([]); // Store filtered results
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [likesMap, setLikesMap] = useState({});
  const [cityPageMap, setCityPageMap] = useState({}); // Track page for each city
  const destinationsPerPage = 5; // Show 5 destinations per page
  const API_BASE_URL = getApiBaseUrl();

  const filterRef = useRef(null);
  const observer = useRef(null);
  const lastDestinationRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

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

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch schema options for filters
  useEffect(() => {
    const fetchSchemaOptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/destinations/schema-options`);
        if (!response.ok) throw new Error('Failed to fetch schema options');
        const data = await response.json();
        setSchemaOptions(data);
      } catch (error) {
        console.error('Error fetching schema options:', error);
        setError('Failed to load filter options');
      }
    };
    fetchSchemaOptions();
  }, []);

  // Fetch all destinations and likes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [destinationsResponse, likesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/destinations`),
          fetch(`${API_BASE_URL}/likes/user`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (!destinationsResponse.ok) throw new Error('Failed to fetch destinations');
        let destinationsData = await destinationsResponse.json();
        
        if (Array.isArray(destinationsData)) {
          // Process the destinations data to handle the new rating structure
          destinationsData = destinationsData.map(dest => ({
            ...dest,
            // Ensure rating is properly formatted for display
            rating: dest.rating?.average !== undefined ? dest.rating.average : (typeof dest.rating === 'number' ? dest.rating : 0),
            // Make sure other essential properties exist to avoid UI errors
            likeCount: dest.likeCount || 0,
            pictureUrls: dest.pictureUrls || []
          }));
          
          console.log('Processed destinations data:', destinationsData);
          setAllDestinations(destinationsData);
          setFilteredDestinations(destinationsData);
        }

        if (likesResponse.ok) {
          const likesData = await likesResponse.json();
          const newLikesMap = {};
          likesData.destinations?.forEach(dest => {
            newLikesMap[dest._id] = true;
          });
          setLikesMap(newLikesMap);
        }

        setInitialLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load destinations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Only fetch once on mount

  // Filter destinations based on search term
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setFilteredDestinations(allDestinations);
      return;
    }

    const searchTerm = debouncedSearchTerm.toLowerCase();
    
    // Save the search term to cookie if it's a meaningful search
    if (searchTerm.length > 2) {
      setLastDestinationCookie(debouncedSearchTerm);
      
      // Try to identify if search term is a city
      // First check exact match with cities from schema options
      const exactCityMatch = schemaOptions.cities.find(
        city => city.toLowerCase() === searchTerm
      );
      
      if (exactCityMatch) {
        // If we have an exact city match, save it as the last searched city
        setLastSearchedCityCookie(exactCityMatch);
      } else {
        // Check if any destination's city contains the search term
        const cityDestination = allDestinations.find(
          dest => dest.locationCity && dest.locationCity.toLowerCase().includes(searchTerm)
        );
        
        if (cityDestination) {
          setLastSearchedCityCookie(cityDestination.locationCity);
        }
      }
    }

    const filtered = allDestinations.filter(dest => 
      dest.name?.toLowerCase().includes(searchTerm) ||
      dest.locationCity?.toLowerCase().includes(searchTerm) ||
      dest.description?.toLowerCase().includes(searchTerm)
    );
    
    setFilteredDestinations(filtered);
  }, [debouncedSearchTerm, allDestinations, schemaOptions.cities]);

  // Group destinations by city - memoized
  const groupedDestinations = useMemo(() => {
    if (!filteredDestinations || filteredDestinations.length === 0) {
      return {};
    }
    
    return filteredDestinations.reduce((acc, dest) => {
      if (!dest || !dest.locationCity) return acc;
      const city = dest.locationCity;
      if (!acc[city]) acc[city] = [];
      acc[city].push(dest);
      return acc;
    }, {});
  }, [filteredDestinations]);

  const handleFilterChange = (type, value) => {
    setPage(1);
    setFilteredDestinations([]);
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setInitialLoading(false); // No need for loading state with client-side filtering
  };

  const handleDestinationClick = (destinationId) => {
    navigate(`/destinations/${destinationId}`);
    // New route structure works with this path too since we've updated the App.jsx route patterns
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="destinations-page">
      <div className="destinations-navbar">
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by name, city, or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {debouncedSearchTerm && (
              <div className="search-stats">
                Found {filteredDestinations.length} results
              </div>
            )}
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
                        onChange={(e) => handleFilterChange('priceRange', { min: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange.max}
                        onChange={(e) => handleFilterChange('priceRange', { max: e.target.value })}
                      />
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
                </div>
                <div className="filter-row">
                  <div className="filter-group">
                    <h3>Cities</h3>
                    <div className="checkbox-group scrollable">
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
                    <h3>Categories</h3>
                    <div className="checkbox-group scrollable">
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
        {initialLoading ? (
          <div className="loading-spinner">Loading destinations...</div>
        ) : Object.entries(groupedDestinations).length === 0 ? (
          <div className="no-results">
            No destinations found matching your criteria
          </div>
        ) : (
          <>
            {Object.entries(groupedDestinations).map(([city, cityDestinations]) => {
              // Get current page for this city, default to 0 if not set
              const currentPage = cityPageMap[city] || 0;
              
              // Calculate total pages for this city
              const totalPages = Math.ceil(cityDestinations.length / destinationsPerPage);
              
              // Get destinations for the current page
              const destinationsToShow = cityDestinations.slice(
                currentPage * destinationsPerPage, 
                (currentPage + 1) * destinationsPerPage
              );
              
              // Handle page change for this city
              const handlePageChange = (newPage) => {
                setCityPageMap(prev => ({
                  ...prev,
                  [city]: newPage
                }));
              };
              
              return (
                <div key={city} className="city-section">
                  <h2 className="city-title">{city}</h2>
                  
                  {/* Destinations section with pagination arrows */}
                  <div className="destinations-section">
                    {/* Left pagination arrow */}
                    {cityDestinations.length > destinationsPerPage && (
                      <button 
                        className="pagination-arrow prev"
                        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        type="button"
                        aria-label="Previous page"
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    )}
                    
                    {/* Destinations grid */}
                    <div className="destinations-grid">
                      {destinationsToShow.map((destination, index) => (
                        <Card
                          key={destination._id || index}
                          item={destination}
                          type="destination"
                          likesMap={likesMap}
                          onLoginRequired={() => setShowLoginPrompt(true)}
                          onLikeToggle={(destinationId, isLiked, likeCount) => {
                            // Update the likes map
                            setLikesMap(prev => ({
                              ...prev,
                              [destinationId]: isLiked
                            }));
                            
                            // Update the destination's like count
                            setAllDestinations(prev =>
                              prev.map(d =>
                                d._id === destinationId
                                  ? { ...d, likeCount }
                                  : d
                              )
                            );
                          }}
                          onClick={handleDestinationClick}
                          detailsPath="destinations"
                        />
                      ))}
                    </div>
                    
                    {/* Right pagination arrow */}
                    {cityDestinations.length > destinationsPerPage && (
                      <button 
                        className="pagination-arrow next"
                        onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        type="button"
                        aria-label="Next page"
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    )}
                  </div>
                  
                  {/* Page indicator */}
                  {cityDestinations.length > destinationsPerPage && (
                    <div className="page-indicator-container">
                      <span className="page-indicator">
                        {currentPage + 1} / {totalPages}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
        {loading && !initialLoading && (
          <div className="loading-more">Loading more destinations...</div>
        )}
      </div>
      
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default Destinations;
