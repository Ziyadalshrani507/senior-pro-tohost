import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaInfoCircle, 
  FaMapMarked, 
  FaImage,
  FaStar,
  FaMoneyBillWave,
  FaCity,
  FaWifi,
  FaCoffee,
  FaSwimmingPool,
  FaParking,
  FaUtensils,
  FaCocktail,
  FaBed,
  FaClock,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaMapPin,
  FaTags
} from 'react-icons/fa';

import Rating from '../../components/Rating/Rating';
import LocationMap from '../../components/LocationMap/LocationMap';
import ImageCarousel from '../../components/ImageCarousel/ImageCarousel';
import LikeButton from '../../components/LikeButton/LikeButton';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';
import './ItemDetails.css';

const ItemDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = getApiBaseUrl();

  // Maps URL type parameter to API endpoint
  const typeToEndpoint = {
    hotels: 'hotels',
    restaurants: 'restaurants',
    destinations: 'destinations'
  };

  // Maps entity type to proper navigation path
  const typeToPath = {
    hotels: '/hotels',
    restaurants: '/restaurants',
    destinations: '/destinations'
  };

  // Handles entity type label for display
  const getEntityLabel = () => {
    switch(type) {
      case 'hotels': 
        return 'Hotel';
      case 'restaurants':
        return 'Restaurant';
      case 'destinations':
        return 'Destination';
      default:
        return 'Item';
    }
  };

  useEffect(() => {
    // Validate if type is supported
    if (!typeToEndpoint[type]) {
      toast.error('Unsupported item type');
      navigate('/');
      return;
    }

    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/${typeToEndpoint[type]}/${id}`);
        
        if (!response.ok) {
          throw new Error(`${getEntityLabel()} not found`);
        }
        
        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        toast.error(`Failed to load ${getEntityLabel().toLowerCase()} details`);
        navigate(typeToPath[type] || '/');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [type, id, navigate, API_BASE_URL]);

  // Dynamic page title based on item type and name
  const getPageTitle = () => {
    if (!item) return 'Loading...';
    return `${item.name} | ${getEntityLabel()} Details`;
  };

  // Function to render amenity icons for hotels
  const renderAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <FaWifi />;
    if (amenityLower.includes('breakfast') || amenityLower.includes('coffee')) return <FaCoffee />;
    if (amenityLower.includes('pool') || amenityLower.includes('swimming')) return <FaSwimmingPool />;
    if (amenityLower.includes('parking')) return <FaParking />;
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return <FaUtensils />;
    if (amenityLower.includes('bar') || amenityLower.includes('lounge')) return <FaCocktail />;
    return <FaInfoCircle />;
  };

  // Function to get price display based on entity type
  const getPriceDisplay = () => {
    if (!item) return null;
    
    if (type === 'hotels') {
      return item.priceRange || 'Price not available';
    } else if (type === 'restaurants') {
      return item.priceRange || 'Price not available';
    } else if (type === 'destinations') {
      return item.cost ? `${item.cost} SAR` : 'Free';
    }
    
    return 'Price not available';
  };

  // Function to render specific attributes based on entity type
  const renderSpecificAttributes = () => {
    if (!item) return null;

    switch(type) {
      case 'hotels':
        return (
          <>
            {item.hotelClass && (
              <div className="info-item">
                <strong><FaStar /> Class:</strong>
                <span>{item.hotelClass} Stars</span>
              </div>
            )}
            {item.checkInTime && (
              <div className="info-item">
                <strong><FaClock /> Check-in:</strong>
                <span>{item.checkInTime}</span>
              </div>
            )}
            {item.checkOutTime && (
              <div className="info-item">
                <strong><FaClock /> Check-out:</strong>
                <span>{item.checkOutTime}</span>
              </div>
            )}
            {item.amenities && item.amenities.length > 0 && (
              <div className="amenities-section">
                <h3><FaInfoCircle /> Amenities</h3>
                <ul className="amenities-list">
                  {item.amenities.map((amenity, index) => (
                    <li key={index}>
                      {renderAmenityIcon(amenity)} {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {item.roomTypes && item.roomTypes.length > 0 && (
              <div className="room-types">
                <h3><FaBed /> Room Types</h3>
                <div className="room-types-grid">
                  {item.roomTypes.map((room, index) => (
                    <div key={index} className="room-card">
                      <h4>{room.name}</h4>
                      <p>Capacity: {room.capacity} {room.capacity > 1 ? 'people' : 'person'}</p>
                      <p className="room-price">{room.pricePerNight} SAR per night</p>
                      <p>Available: {room.available}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        );
        
      case 'restaurants':
        return (
          <>
            {item.cuisine && (
              <div className="info-item">
                <strong><FaUtensils /> Cuisine:</strong>
                <span>{item.cuisine}</span>
              </div>
            )}
            {item.openingHours && (
              <div className="info-item">
                <strong><FaClock /> Hours:</strong>
                <span>{item.openingHours}</span>
              </div>
            )}
            {item.categories && item.categories.length > 0 && (
              <div className="categories-section">
                <h3><FaTags /> Categories</h3>
                <div className="categories-list">
                  {item.categories.map((category, index) => (
                    <span key={index} className="category-tag">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        );
        
      case 'destinations':
        return (
          <>
            {item.type && (
              <div className="info-item">
                <strong><FaInfoCircle /> Type:</strong>
                <span>{item.type}</span>
              </div>
            )}
            {item.cost && (
              <div className="info-item">
                <strong><FaMoneyBillWave /> Cost:</strong>
                <span>{item.cost} SAR</span>
              </div>
            )}
            {item.categories && item.categories.length > 0 && (
              <div className="categories-section">
                <h3><FaTags /> Categories</h3>
                <div className="categories-list">
                  {item.categories.map((category, index) => (
                    <span key={index} className="category-tag">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {item.isActivity && (
              <div className="activity-badge">
                <FaCalendarAlt /> Activity
              </div>
            )}
          </>
        );
        
      default:
        return null;
    }
  };

  // Function to render contact information
  const renderContactInfo = () => {
    if (!item || !item.contact) return null;
    
    return (
      <div className="contact-section">
        <h3><FaInfoCircle /> Contact Information</h3>
        {item.contact.phone && (
          <div className="contact-item">
            <FaPhone /> <a href={`tel:${item.contact.phone}`}>{item.contact.phone}</a>
          </div>
        )}
        {item.contact.email && (
          <div className="contact-item">
            <FaEnvelope /> <a href={`mailto:${item.contact.email}`}>{item.contact.email}</a>
          </div>
        )}
        {item.contact.website && (
          <div className="contact-item">
            <FaGlobe /> <a href={item.contact.website} target="_blank" rel="noopener noreferrer">Website</a>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="item-details-page">
        <div className="loading">Loading {getEntityLabel().toLowerCase()} details...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="item-details-page">
        <div className="error-message">
          <FaInfoCircle /> {getEntityLabel()} not found
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={item.description?.substring(0, 155) || `Details for ${item.name}`} />
        <meta property="og:title" content={getPageTitle()} />
        <meta property="og:description" content={item.description?.substring(0, 155) || `Details for ${item.name}`} />
        {item.images && item.images[0] && <meta property="og:image" content={item.images[0]} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <div className="item-details-page">
        <button className="back-button" onClick={() => navigate(typeToPath[type] || '/')}>
          <FaArrowLeft /> Back to {getEntityLabel()}s
        </button>

        <div className="item-details-container">
          <div className="item-header">
            <div className="item-title-section">
              <h1>{item.name}</h1>
              <LikeButton itemId={item._id} itemType={type.slice(0, -1)} />
            </div>
            <div className="item-meta">
              <span className="location">
                <FaMapMarkerAlt /> {item.locationCity || 'Location not available'}
              </span>
              <span className="price">
                <FaMoneyBillWave /> {getPriceDisplay()}
              </span>
              {item.rating && (
                <span className="rating">
                  <FaStar /> {item.rating.average ? item.rating.average.toFixed(1) : '0.0'} 
                  ({item.rating.count || 0} reviews)
                </span>
              )}
            </div>
          </div>

          <div className="item-content">
            <div className="content-main">
              <div className="section-card">
                <h2><FaImage /> Gallery</h2>
                <ImageCarousel 
                  images={item.images || item.pictureUrls || []} 
                  altPrefix={item.name}
                />
              </div>

              <div className="description">
                <h2><FaInfoCircle /> About</h2>
                <p>{item.description || 'No description available'}</p>
              </div>

              <div className="rating-section">
                <h2><FaStar /> Ratings & Reviews</h2>
                <Rating itemId={item._id} itemType={type.slice(0, -1)} />
              </div>
            </div>

            <div className="content-side">
              <div className="map-container">
                <h2><FaMapMarked /> Location</h2>
                <LocationMap coordinates={item.coordinates?.coordinates} />
                {item.address && (
                  <div className="address">
                    <FaMapPin /> {item.address}
                  </div>
                )}
              </div>

              <div className="item-info">
                <h2><FaInfoCircle /> Details</h2>
                <div className="info-item">
                  <strong><FaCity /> City:</strong>
                  <span>{item.locationCity || 'Not specified'}</span>
                </div>
                
                {/* Render type-specific attributes */}
                {renderSpecificAttributes()}
                
                {/* Render contact info if available */}
                {renderContactInfo()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ItemDetails;
