import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import './Hotels.css';
import Card from '../../components/Card/Card';
import LoginPromptModal from '../../components/LoginPromptModal/LoginPromptModal';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import { getLikedCities } from '../../utils/cookieUtils';

const Hotels = () => {
  const [allHotels, setAllHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [likesMap, setLikesMap] = useState({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [likedCities, setLikedCities] = useState([]);
  const [showPrioritizedContent, setShowPrioritizedContent] = useState(true);
  const [cityPageMap, setCityPageMap] = useState({});
  const hotelsPerPage = 5;
  const API_BASE_URL = getApiBaseUrl();
  
  const filterRef = useRef(null);
  
  const [filters, setFilters] = useState({
    priceRange: {
      min: '',
      max: ''
    },
    rating: '',
    amenities: []
  });
  
  const [schemaOptions, setSchemaOptions] = useState({
    cities: [],
    amenities: []
  });

  // Check for liked cities on component mount
  useEffect(() => {
    const cities = getLikedCities();
    if (cities && cities.length > 0) {
      setLikedCities(cities);
      setShowPrioritizedContent(true);
    }
  }, []);

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

  // Handle like toggle
  const handleLikeToggle = (hotelId, isLiked, newLikeCount) => {
    setAllHotels(prevHotels =>
      prevHotels.map(hotel =>
        hotel._id === hotelId
          ? { ...hotel, likeCount: newLikeCount, isLiked }
          : hotel
      )
    );
    
    // Refresh liked cities from cookie after a delay to ensure the cookie is updated
    setTimeout(() => {
      const updatedLikedCities = getLikedCities();
      if (updatedLikedCities && updatedLikedCities.length > 0) {
        setLikedCities(updatedLikedCities);
      }
    }, 500);
  };

  // Fetch hotels and user likes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch hotels
        const hotelsResponse = await fetch(`${API_BASE_URL}/hotels`);
        
        if (!hotelsResponse.ok) {
          throw new Error('Failed to fetch hotels');
        }
        
        const hotelsData = await hotelsResponse.json();
        setAllHotels(Array.isArray(hotelsData) ? hotelsData : []);
        setFilteredHotels(Array.isArray(hotelsData) ? hotelsData : []);
        
        // Extract schema options from hotel data
        const cities = new Set();
        const amenitiesList = new Set();
        
        hotelsData.forEach(hotel => {
          if (hotel.city) cities.add(hotel.city);
          if (hotel.amenities && Array.isArray(hotel.amenities)) {
            hotel.amenities.forEach(amenity => amenitiesList.add(amenity));
          }
        });
        
        setSchemaOptions({
          cities: Array.from(cities),
          amenities: Array.from(amenitiesList)
        });
        
        // Fetch user likes if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const likesResponse = await fetch(`${API_BASE_URL}/likes/user`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (likesResponse.ok) {
              const likesData = await likesResponse.json();
              const newLikesMap = {};
              likesData.hotels?.forEach(hotel => {
                newLikesMap[hotel._id] = true;
              });
              setLikesMap(newLikesMap);
            }
          } catch (likesError) {
            console.error('Error fetching likes:', likesError);
            // Don't set main error for likes failure
          }
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setError('Failed to load hotels');
        toast.error('Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [API_BASE_URL]);
  
  // Filter hotels based on search term and filters
  useEffect(() => {
    if (!debouncedSearchTerm && isFiltersEmpty()) {
      setFilteredHotels(allHotels);
      return;
    }

    let filtered = [...allHotels];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(hotel => 
        hotel.name?.toLowerCase().includes(searchTermLower) ||
        hotel.city?.toLowerCase().includes(searchTermLower) ||
        hotel.description?.toLowerCase().includes(searchTermLower)
      );
    }

    // Apply price range filter
    if (filters.priceRange.min !== '') {
      filtered = filtered.filter(hotel => hotel.pricePerNight >= Number(filters.priceRange.min));
    }
    if (filters.priceRange.max !== '') {
      filtered = filtered.filter(hotel => hotel.pricePerNight <= Number(filters.priceRange.max));
    }

    // Apply rating filter
    if (filters.rating !== '') {
      filtered = filtered.filter(hotel => hotel.rating && hotel.rating.average >= Number(filters.rating));
    }

    // Apply amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(hotel => {
        // Check if hotel has all selected amenities
        return filters.amenities.every(amenity => 
          hotel.amenities && hotel.amenities.includes(amenity)
        );
      });
    }

    setFilteredHotels(filtered);
  }, [debouncedSearchTerm, filters, allHotels]);

  const isFiltersEmpty = () => {
    return (
      filters.priceRange.min === '' &&
      filters.priceRange.max === '' &&
      filters.rating === '' &&
      filters.amenities.length === 0
    );
  };

  const handleFilterChange = (type, value) => {
    if (type === 'priceRange') {
      setFilters(prev => ({
        ...prev,
        priceRange: { ...prev.priceRange, ...value }
      }));
    } else if (type === 'rating') {
      setFilters(prev => ({
        ...prev,
        rating: value
      }));
    } else if (type === 'amenity') {
      setFilters(prev => {
        const updatedAmenities = [...prev.amenities];
        const index = updatedAmenities.indexOf(value);
        
        if (index === -1) {
          updatedAmenities.push(value);
        } else {
          updatedAmenities.splice(index, 1);
        }
        
        return {
          ...prev,
          amenities: updatedAmenities
        };
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleHotelClick = (hotelId) => {
    navigate(`/hotels/${hotelId}`);
    // Using navigate instead of window.location for smoother transitions
  };

  // Helper function to extract city information from hotel
  const extractCityFromHotel = (hotel) => {
    // Try to extract the city from various possible properties
    let city = null;
    
    // Check if the hotel has a location property with city
    if (hotel.location && hotel.location.city) {
      city = hotel.location.city;
    }
    // Check if hotel has a locationCity property (like destinations)
    else if (hotel.locationCity) {
      city = hotel.locationCity;
    }
    // Check if hotel has a city property directly
    else if (hotel.city) {
      city = hotel.city;
    }
    // Try to extract from the name if it contains a city name
    else if (hotel.name) {
      // Common Saudi cities to check for in the hotel name
      const saudiCities = ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif', 'Tabuk', 'Abha'];
      
      for (const possibleCity of saudiCities) {
        if (hotel.name.includes(possibleCity)) {
          city = possibleCity;
          break;
        }
      }
    }
    
    // If no city was found, check if there's any address information
    if (!city && hotel.address) {
      // Common Saudi cities to check for in the address
      const saudiCities = ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Taif', 'Tabuk', 'Abha'];
      
      for (const possibleCity of saudiCities) {
        if (hotel.address.includes(possibleCity)) {
          city = possibleCity;
          break;
        }
      }
    }
    
    // If we still don't have a city, use "Other Locations"
    if (!city) {
      city = "Other Locations";
    }
    
    return city;
  };

  // Group hotels by city with prioritization based on liked cities - memoized
  const groupedAndPrioritizedHotels = useMemo(() => {
    if (!filteredHotels || filteredHotels.length === 0) {
      return {};
    }
    
    // If we don't have liked cities or user has disabled prioritized content,
    // just return the normal grouping
    if (!likedCities || likedCities.length === 0 || !showPrioritizedContent) {
      return filteredHotels.reduce((acc, hotel) => {
        // Extract city from hotel data
        let city = extractCityFromHotel(hotel);
        
        if (!acc[city]) acc[city] = [];
        acc[city].push(hotel);
        return acc;
      }, {});
    }
    
    // Otherwise, prioritize liked cities
    const priorityGroups = {};
    const otherGroups = {};
    
    filteredHotels.forEach(hotel => {
      const city = extractCityFromHotel(hotel);
      
      // Check if this hotel's city is in the liked cities list
      const isPriority = likedCities.some(
        likedCity => likedCity.toLowerCase() === city.toLowerCase()
      );
      
      if (isPriority) {
        if (!priorityGroups[city]) priorityGroups[city] = [];
        priorityGroups[city].push(hotel);
      } else {
        if (!otherGroups[city]) otherGroups[city] = [];
        otherGroups[city].push(hotel);
      }
    });
    
    // Combine groups with priority cities first
    return { ...priorityGroups, ...otherGroups };
  }, [filteredHotels, likedCities, showPrioritizedContent]);
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="hotels-page">
      <>
        <div className="hotels-navbar">
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
                  Found {filteredHotels.length} results
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
                      <h3>Rating</h3>
                      <select
                        value={filters.rating}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                      >
                        <option value="">Any rating</option>
                        <option value="3">3+ stars</option>
                        <option value="4">4+ stars</option>
                        <option value="4.5">4.5+ stars</option>
                      </select>
                    </div>
                  </div>
                  {schemaOptions.amenities.length > 0 && (
                    <div className="filter-row">
                      <div className="filter-group">
                        <h3>Amenities</h3>
                        <div className="checkbox-group scrollable">
                          {schemaOptions.amenities.map(amenity => (
                            <label key={amenity} className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={filters.amenities.includes(amenity)}
                                onChange={() => handleFilterChange('amenity', amenity)}
                              />
                              {amenity}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {likedCities && likedCities.length > 0 && showPrioritizedContent && (
          <div className="priority-info-banner">
            <span>Showing hotels in cities you've liked first</span>
            <button onClick={() => setShowPrioritizedContent(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : Object.entries(groupedAndPrioritizedHotels).length === 0 ? (
          <div className="no-results">No results found</div>
        ) : (
          <>
            {Object.entries(groupedAndPrioritizedHotels).map(([city, cityHotels]) => {
              // Get the current page for this city, default to 0 if not set
              const currentPage = cityPageMap[city] || 0;
              
              // Calculate total pages for this city
              const totalPages = Math.ceil(cityHotels.length / hotelsPerPage);
              
              // Get the hotels for the current page
              const hotelsToShow = cityHotels.slice(
                currentPage * hotelsPerPage, 
                (currentPage + 1) * hotelsPerPage
              );
              
              // Handle page change for this city
              const handlePageChange = (newPage) => {
                setCityPageMap(prev => ({
                  ...prev,
                  [city]: newPage
                }));
              };
              
              return (
                <div 
                  key={city} 
                  className={`city-section ${likedCities && likedCities.includes(city) && showPrioritizedContent ? 'priority-city' : ''}`}
                >
                  <h2 className="city-title">
                    {city}
                    {likedCities && likedCities.includes(city) && showPrioritizedContent && (
                      <span className="priority-label">Liked city</span>
                    )}
                  </h2>
                  {/* Hotels display with pagination arrows */}
                  <div className="hotels-section">
                    {/* Left pagination arrow */}
                    {cityHotels.length > hotelsPerPage && (
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
                    
                    {/* Hotels grid */}
                    <div className="hotels-grid">
                      {hotelsToShow.map((hotel) => (
                        <Card
                          key={hotel._id}
                          item={hotel}
                          type="hotel"
                          imageKey="images"
                          fallbackImageKey="pictureUrls"
                          likesMap={likesMap}
                          onLoginRequired={() => setShowLoginPrompt(true)}
                          onLikeToggle={(hotelId, isLiked, likeCount) => handleLikeToggle(hotelId, isLiked, likeCount)}
                          onClick={handleHotelClick}
                          detailsPath="hotels"
                          renderCustomContent={(hotel) => (
                            <>
                              <h3>{hotel.name || 'Untitled'}</h3>
                              <p className="card-description">
                                {hotel.description ? 
                                  (hotel.description.length > 70 ? 
                                    `${hotel.description.substring(0, 70)}...` : 
                                    hotel.description) : 
                                  'No description available'}
                              </p>
                              {hotel.pricePerNight && (
                                <p className="hotel-price">{hotel.pricePerNight} SAR / night</p>
                              )}
                              {hotel.rating && (
                                <div className="hotel-rating">
                                  <span className="rating-stars">⭐ {hotel.rating.average ? hotel.rating.average.toFixed(1) : '0.0'}</span>
                                  <span className="review-count">({hotel.rating.count || 0} reviews)</span>
                                </div>
                              )}
                            </>
                          )}
                        />
                      ))}
                    </div>
                    
                    {/* Right pagination arrow */}
                    {cityHotels.length > hotelsPerPage && (
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
                  {cityHotels.length > hotelsPerPage && (
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
      </>
      
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

export default Hotels;