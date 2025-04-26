import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card/Card';
import './Restaurants.css';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import LoginPromptModal from '../../components/LoginPromptModal/LoginPromptModal';

import { getApiBaseUrl } from '../../utils/apiBaseUrl';
const API_BASE_URL = getApiBaseUrl();

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [likesMap, setLikesMap] = useState({});
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const filterRef = useRef(null);
  const [filters, setFilters] = useState({
    cities: [],
    priceRanges: [],
    cuisines: [],
    rating: {
      min: '',
      max: ''
    }
  });
  const [schemaOptions, setSchemaOptions] = useState({
    cities: [],
    priceRanges: ['$', '$$', '$$$', '$$$$'],
    cuisines: []
  });
  const [groupedRestaurants, setGroupedRestaurants] = useState({});
  const { user } = useAuth();

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

  // Handle like toggle
  const handleLikeToggle = (restaurantId, isLiked, newLikeCount) => {
    setRestaurants(prevRestaurants =>
      prevRestaurants.map(restaurant =>
        restaurant._id === restaurantId
          ? { ...restaurant, likeCount: newLikeCount, isLiked }
          : restaurant
      )
    );
    setFilteredRestaurants(prevRestaurants =>
      prevRestaurants.map(restaurant =>
        restaurant._id === restaurantId
          ? { ...restaurant, likeCount: newLikeCount, isLiked }
          : restaurant
      )
    );
  };

  // Fetch cities and restaurants
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch cities
        const citiesResponse = await fetch(`${API_BASE_URL}/restaurants/cities`);
        if (!citiesResponse.ok) throw new Error('Failed to fetch cities');
        const citiesData = await citiesResponse.json();
        setSchemaOptions(prev => ({ ...prev, cities: citiesData.cities }));

        // Fetch restaurants with pagination
        const restaurantsResponse = await fetch(`${API_BASE_URL}/restaurants?page=1&limit=50`);
        if (!restaurantsResponse.ok) {
          const errorData = await restaurantsResponse.json();
          throw new Error(errorData.message || 'Failed to fetch restaurants');
        }
        const { restaurants: restaurantsData } = await restaurantsResponse.json();
        
        // Initialize likes map
        const newLikesMap = {};
        restaurantsData.forEach(restaurant => {
          if (restaurant.likes && Array.isArray(restaurant.likes) && user) {
            // Check if current user has liked this restaurant
            const isLiked = restaurant.likes.includes(user.id);
            if (isLiked) {
              newLikesMap[restaurant._id] = true;
            }
          }
        });
        setLikesMap(newLikesMap);
        
        setRestaurants(restaurantsData || []);

        // Extract unique cuisines
        const uniqueCuisines = [...new Set(restaurantsData
          .map(restaurant => restaurant.cuisine)
          .filter(cuisine => cuisine && cuisine.trim())
        )].sort();
        setSchemaOptions(prev => ({ ...prev, cuisines: uniqueCuisines }));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...restaurants];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(rest => 
        rest.name.toLowerCase().includes(term) ||
        (rest.cuisine && rest.cuisine.toLowerCase().includes(term)) ||
        (rest.address && rest.address.toLowerCase().includes(term))
      );
    }

    // Apply city filter
    if (filters.cities.length > 0) {
      filtered = filtered.filter(rest => filters.cities.includes(rest.locationCity));
    }

    // Apply price range filter
    if (filters.priceRanges.length > 0) {
      filtered = filtered.filter(rest => filters.priceRanges.includes(rest.priceRange));
    }

    // Apply cuisine filter
    if (filters.cuisines.length > 0) {
      filtered = filtered.filter(rest => rest.cuisine && filters.cuisines.includes(rest.cuisine));
    }

    // Apply rating range filter
    if (filters.rating.min !== '') {
      filtered = filtered.filter(rest => {
        // Handle both object and number formats
        const ratingValue = typeof rest.rating === 'object' && rest.rating.average !== undefined
          ? rest.rating.average
          : parseFloat(rest.rating || 0);
        return ratingValue >= Number(filters.rating.min);
      });
    }

    if (filters.rating.max !== '') {
      filtered = filtered.filter(rest => {
        // Handle both object and number formats
        const ratingValue = typeof rest.rating === 'object' && rest.rating.average !== undefined
          ? rest.rating.average
          : parseFloat(rest.rating || 0);
        return ratingValue <= Number(filters.rating.max);
      });
    }

    // Group by city
    const grouped = filtered.reduce((acc, rest) => {
      const city = rest.locationCity;
      if (!acc[city]) acc[city] = [];
      acc[city].push(rest);
      return acc;
    }, {});

    setGroupedRestaurants(grouped);
    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, filters]);

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (type === 'rating') {
        newFilters.rating = { ...prev.rating, ...value };
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

  if (loading) {
    return (
      <div className="restaurants-page">
        <div className="loading">Loading restaurants...</div>
      </div>
    );
  }

  return (
    <div className="restaurants-page">
      <div className="restaurants-navbar">
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search restaurants..."
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
                    <h3>Rating Range</h3>
                    <div className="rating-inputs">
                      <input
                        type="number"
                        placeholder="Min"
                        min="0"
                        max="5"
                        step="0.1"
                        value={filters.rating.min}
                        onChange={(e) => handleFilterChange('rating', { min: e.target.value })}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        min="0"
                        max="5"
                        step="0.1"
                        value={filters.rating.max}
                        onChange={(e) => handleFilterChange('rating', { max: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="filter-group">
                    <h3>Price Range</h3>
                    <div className="checkbox-group">
                      {schemaOptions.priceRanges.map(range => (
                        <label key={range} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={filters.priceRanges.includes(range)}
                            onChange={() => handleFilterChange('priceRanges', range)}
                          />
                          {range}
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
                    <h3>Cuisines</h3>
                    <div className="checkbox-group scrollable">
                      {schemaOptions.cuisines.map(cuisine => (
                        <label key={cuisine} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={filters.cuisines.includes(cuisine)}
                            onChange={() => handleFilterChange('cuisines', cuisine)}
                          />
                          {cuisine}
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

      <div className="restaurants-content">
        {Object.entries(groupedRestaurants).length === 0 ? (
          <div className="no-results">
            No restaurants found matching your criteria
          </div>
        ) : (
          Object.entries(groupedRestaurants).map(([city, cityRestaurants]) => (
            <div key={city} className="city-section">
              <h2 className="city-title">{city}</h2>
              <div className="restaurants-grid">
                {cityRestaurants.map((restaurant) => (
                  <Card 
                    key={restaurant._id}
                    item={restaurant}
                    type="restaurant"
                    imageKey="images"
                    likesMap={likesMap}
                    onLoginRequired={() => setShowLoginPrompt(true)}
                    onLikeToggle={(restaurantId, isLiked, likeCount) => handleLikeToggle(restaurantId, isLiked, likeCount)}
                    detailsPath="/restaurants"
                    renderCustomContent={(restaurant) => (
                      <>
                        <h3>{restaurant.name || 'Unnamed Restaurant'}</h3>
                        {restaurant.cuisine && (
                          <p className="restaurant-cuisine">{restaurant.cuisine}</p>
                        )}
                        <div className="restaurant-details">
                          <span className="restaurant-price">{restaurant.priceRange || 'Price not available'}</span>
                          {restaurant.rating && (
                            <span className="restaurant-rating">
                              {(() => {
                                // Handle both object and number formats
                                const ratingValue = typeof restaurant.rating === 'object' && restaurant.rating.average !== undefined
                                  ? restaurant.rating.average
                                  : parseFloat(restaurant.rating || 0);
                                  
                                return (
                                  <>
                                    {'★'.repeat(Math.floor(ratingValue))}
                                    {'☆'.repeat(5 - Math.floor(ratingValue))}
                                    <span className="rating-number">({ratingValue.toFixed(1)})</span>
                                  </>
                                );
                              })()}
                            </span>
                          )}
                        </div>
                        <p className="restaurant-location">{restaurant.locationCity || 'Location not specified'}</p>
                      </>
                    )}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default Restaurants;
