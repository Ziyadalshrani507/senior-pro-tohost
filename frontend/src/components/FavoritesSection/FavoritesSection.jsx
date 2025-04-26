import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../Card/Card';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import './FavoritesSection.css';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

const FavoritesSection = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('restaurants');
  const [favorites, setFavorites] = useState({
    restaurants: [],
    destinations: [],
    hotels: []
  });
  const [currentPage, setCurrentPage] = useState({
    restaurants: 0,
    destinations: 0,
    hotels: 0
  });
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;
  const API_BASE_URL = getApiBaseUrl();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // Fetch all liked items
      const response = await fetch(`${API_BASE_URL}/likes/user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch liked items');
      }

      const data = await response.json();
      
      if (data.success && data.likes) {
        // Get full details for liked restaurants
        const restaurantPromises = data.likes.restaurants.map(async restaurant => {
          try {
            const res = await fetch(`${API_BASE_URL}/restaurants/${restaurant._id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.restaurant || data; // Handle both response formats
          } catch (error) {
            console.error('Error fetching restaurant:', error);
            return null;
          }
        });
        
        // Get full details for liked destinations
        const destinationPromises = data.likes.destinations.map(async destination => {
          try {
            const res = await fetch(`${API_BASE_URL}/destinations/${destination._id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.destination || data; // Handle both response formats
          } catch (error) {
            console.error('Error fetching destination:', error);
            return null;
          }
        });

        // Get full details for liked hotels
        const hotelPromises = data.likes.hotels.map(async hotel => {
          try {
            const res = await fetch(`${API_BASE_URL}/hotels/${hotel._id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.hotel || data; // Handle both response formats
          } catch (error) {
            console.error('Error fetching hotel:', error);
            return null;
          }
        });

        const [restaurantsDetails, destinationsDetails, hotelsDetails] = await Promise.all([
          Promise.all(restaurantPromises),
          Promise.all(destinationPromises),
          Promise.all(hotelPromises)
        ]);

        // Remove duplicates by ID and null values
        const uniqueRestaurants = [...new Map(restaurantsDetails
          .filter(r => r && r._id)
          .map(item => [item._id, item])
        ).values()];

        const uniqueDestinations = [...new Map(destinationsDetails
          .filter(d => d && d._id)
          .map(item => [item._id, item])
        ).values()];

        const uniqueHotels = [...new Map(hotelsDetails
          .filter(h => h && h._id)
          .map(item => [item._id, item])
        ).values()];

        setFavorites({
          restaurants: uniqueRestaurants,
          destinations: uniqueDestinations,
          hotels: uniqueHotels
        });
      } else {
        setFavorites({
          restaurants: [],
          destinations: []
        });
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = (type) => {
    setCurrentPage(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };

  const handlePrevPage = (type) => {
    setCurrentPage(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1)
    }));
  };

  const renderCards = (type) => {
    const items = favorites[type];
    const start = currentPage[type] * itemsPerPage;
    const currentItems = items.slice(start, start + itemsPerPage);
    const hasMore = start + itemsPerPage < items.length;
    const showPrev = currentPage[type] > 0;

    return (
      <div className="cards-section">
        <div className="navigation-arrows">
          {showPrev && (
            <button 
              className="nav-arrow" 
              onClick={() => handlePrevPage(type)}
              aria-label="Previous page"
            >
              <FaArrowLeft />
            </button>
          )}
          {hasMore && (
            <button 
              className="nav-arrow" 
              onClick={() => handleNextPage(type)}
              aria-label="Next page"
            >
              <FaArrowRight />
            </button>
          )}
        </div>
        <div className="cards-grid">
          {currentItems.map((item) => (
            <Card
              key={item._id}
              item={item}
              type={type === 'restaurants' ? 'restaurant' : 'destination'}
              detailsPath={`/${type}`}
              imageKey="images"
              fallbackImageKey="pictureUrls"
              likesMap={{ [item._id]: true }}
              onLoginRequired={() => navigate('/login')}
              onLikeToggle={(id, isLiked) => {
                if (!isLiked) {
                  // Remove from favorites
                  setFavorites(prev => ({
                    ...prev,
                    [type]: prev[type].filter(i => i._id !== id)
                  }));
                }
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading favorites...</div>;
  }

  const sections = [
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'destinations', label: 'Destinations' },
    { id: 'hotels', label: 'Hotels' }
  ];

  return (
    <div className="favorites-container">
      <div className="section-selector">
        {sections.map(section => (
          <button
            key={section.id}
            className={`section-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="favorites-section">
        {favorites[activeSection].length > 0 ? 
          renderCards(activeSection) : 
          <p className="no-items">No liked {activeSection} yet</p>}
      </div>
    </div>
  );
};

export default FavoritesSection;
