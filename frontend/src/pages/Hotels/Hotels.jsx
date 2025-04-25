import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import './Hotels.css';
import Card from '../../components/Card/Card';
import LoginPromptModal from '../../components/LoginPromptModal/LoginPromptModal';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const Hotels = () => {
  const [allHotels, setAllHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [likesMap, setLikesMap] = useState({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
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

  const handleBooking = () => {
    if (!checkInDate || !checkOutDate) {
      toast.error('Please select check-in and check-out dates.');
      return;
    }
    toast.success(`Booking confirmed for ${selectedHotel.name} from ${checkInDate} to ${checkOutDate}`);
  };
  
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
      filtered = filtered.filter(hotel => hotel.rating >= Number(filters.rating));
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
    const hotel = allHotels.find(h => h._id === hotelId);
    if (hotel) {
      setSelectedHotel(hotel);
    }
  };

  // Group hotels by city - memoized
  const groupedHotels = useMemo(() => {
    if (!filteredHotels || filteredHotels.length === 0) {
      return {};
    }
    
    return filteredHotels.reduce((acc, hotel) => {
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
      
      if (!acc[city]) acc[city] = [];
      acc[city].push(hotel);
      return acc;
    }, {});
  }, [filteredHotels]);
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="hotels-page">
      {selectedHotel ? (
        <div className="hotel-details-container">
          <button className="back-button" onClick={() => setSelectedHotel(null)}>
            Back to Hotels
          </button>
          <div className="hotel-details">
            {selectedHotel.images && selectedHotel.images.length > 0 ? (
              <img src={selectedHotel.images[0]} alt={selectedHotel.name} className="hotel-image" />
            ) : (
              <div className="no-image-placeholder">
                <i className="bi bi-image"></i>
                <span>No Image Available</span>
              </div>
            )}
            <h1>{selectedHotel.name}</h1>
            <p>{selectedHotel.description}</p>
            <p>Price per night: {selectedHotel.pricePerNight || 'N/A'} SAR</p>
            <p>Rating: {selectedHotel.rating || 'N/A'} ⭐</p>
            {selectedHotel.amenities && selectedHotel.amenities.length > 0 && (
              <>
                <h3>Amenities:</h3>
                <ul>
                  {selectedHotel.amenities.map((amenity, index) => (
                    <li key={index}>{amenity}</li>
                  ))}
                </ul>
              </>
            )}
            <div className="date-picker">
              <label>
                Check-in Date:
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
              </label>
              <label>
                Check-out Date:
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                />
              </label>
            </div>
            <button className="book-button" onClick={handleBooking}>
              Book Now
            </button>
          </div>
        </div>
      ) : (
        <>
          <h1>Hotels</h1>
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

          {loading ? (
            <div className="loading-spinner">Loading hotels...</div>
          ) : Object.entries(groupedHotels).length === 0 ? (
            <div className="no-results">No hotels found</div>
          ) : (
            <>
              {Object.entries(groupedHotels).map(([city, cityHotels]) => (
                <div key={city} className="city-section">
                  <h2 className="city-title">{city}</h2>
                  <div className="hotels-grid">
                    {cityHotels.map((hotel) => (
                      <Card
                        key={hotel._id}
                        item={hotel}
                        type="hotel"
                        imageKey="images"
                        fallbackImageKey="pictureUrls"
                        likesMap={likesMap}
                        onLoginRequired={() => setShowLoginPrompt(true)}
                        onLikeToggle={(hotelId, isLiked, likeCount) => {
                          // Update the likes map
                          setLikesMap(prev => ({
                            ...prev,
                            [hotelId]: isLiked
                          }));
                          
                          // Update the hotel's like count
                          setAllHotels(prev =>
                            prev.map(h =>
                              h._id === hotelId
                                ? { ...h, likeCount }
                                : h
                            )
                          );
                        }}
                        onClick={handleHotelClick}
                        detailsPath="/hotels"
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
                              <p className="hotel-price">Price per night: {hotel.pricePerNight} SAR</p>
                            )}
                            {hotel.rating && (
                              <p className="hotel-rating">Rating: {hotel.rating} ⭐</p>
                            )}
                          </>
                        )}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </>
      )}
      
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