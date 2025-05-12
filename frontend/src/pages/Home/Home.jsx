import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Helmet } from 'react-helmet';
import './Home.css';

const Home = () => {
  // State management
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Refs for sections with parallax effects
  const heroRef = useRef(null);
  const destinationsRef = useRef(null);
  const aiPlannerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Hero images for carousel
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const heroImages = [
    { url: '/assets/images/riyadh.jpeg', alt: 'Riyadh Skyline' },
    { url: '/assets/images/Jeddah.jpeg', alt: 'Jeddah Waterfront' },
    { url: '/assets/images/Khobar.jpeg', alt: 'Khobar Corniche' }
  ];

  // Preload images
  useEffect(() => {
    Promise.all(
      heroImages.map((image) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = image.url;
          img.onload = resolve;
          img.onerror = (e) => {
            console.error(`Failed to load image: ${image.url}`, e);
            reject(e);
          };
        });
      })
    )
      .then(() => {
        console.log('All images loaded successfully');
        setImagesLoaded(true);
      })
      .catch((error) => {
        console.error('Error loading images:', error);
        setImagesLoaded(true); // Still set to true to show fallback
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Parallax scrolling effects using framer-motion
  const { scrollY } = useScroll();
  
  // Hero section parallax transformations
  const heroBackgroundY = useTransform(scrollY, [0, 1000], [0, 300]);
  
  // AI Planner section parallax transformations
  const mapBackgroundY = useTransform(scrollY, [1000, 2000], [0, 100]);
  
  // Card hover animation variants
  const cardHoverVariants = {
    initial: { y: 0, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" },
    hover: { y: -10, boxShadow: "0px 15px 30px rgba(0,0,0,0.2)" },
    tap: { y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.15)" }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured Saudi destinations (maximum 5)
        const destinationsRes = await axios.get('/api/destinations?limit=5&featured=true&country=Saudi Arabia');
        
        // Fetch featured luxury hotels (maximum 5)
        const hotelsRes = await axios.get('/api/hotels?limit=5&featured=true&sort=rating');
        
        // Fetch featured high-rated restaurants (maximum 5)
        const restaurantsRes = await axios.get('/api/restaurants?limit=5&featured=true&sort=rating');
        
        // Process the destination data
        const destinationData = Array.isArray(destinationsRes.data?.destinations)
          ? destinationsRes.data.destinations
          : Array.isArray(destinationsRes.data)
          ? destinationsRes.data
          : [];
        // Ensure we have proper image data and descriptions
        const processedDestinations = Array.isArray(destinationData) 
          ? destinationData.map(dest => ({
              ...dest,
              imageUrl: dest.pictureUrls?.[0] || dest.images?.[0] || '/assets/default-destination.jpg',
              shortDescription: dest.description ? dest.description.substring(0, 120) + '...' : 'Discover this amazing Saudi destination...'
            }))
          : [];
        
        // Process the hotel data
        const hotelData = hotelsRes.data?.hotels || hotelsRes.data || [];
        const processedHotels = Array.isArray(hotelData)
          ? hotelData.map(hotel => ({
              ...hotel,
              imageUrl: hotel.pictureUrls?.[0] || hotel.images?.[0] || '/assets/default-hotel.jpg',
              shortDescription: hotel.description ? hotel.description.substring(0, 100) + '...' : 'Experience luxury accommodation in Saudi Arabia.',
              stars: hotel.stars || hotel.rating?.average || 4
            }))
          : [];
        
        // Process the restaurant data
        const restaurantData = restaurantsRes.data?.restaurants || restaurantsRes.data || [];
        const processedRestaurants = Array.isArray(restaurantData)
          ? restaurantData.map(restaurant => ({
              ...restaurant,
              imageUrl: restaurant.pictureUrls?.[0] || restaurant.images?.[0] || '/assets/default-restaurant.jpg',
              shortDescription: restaurant.description ? restaurant.description.substring(0, 100) + '...' : 'Enjoy authentic Saudi and international cuisine.',
              rating: restaurant.rating?.average || 4.5
            }))
          : [];
        
        // Update state with processed data
        setDestinations(processedDestinations);
        setHotels(processedHotels);
        setRestaurants(processedRestaurants);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Saudi Arabia tourism data:', error);
        // Set empty arrays if there's an error
        setDestinations([]);
        setHotels([]);
        setRestaurants([]);
        setLoading(false);
      }
    };
    
    fetchData();
    
    // No need for manual scroll handling with framer-motion useTransform
    // The parallax effects are handled automatically based on scroll position
  }, []);
  
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>Discover Saudi Arabia - Your Personalized Journey</title>
        <meta name="description" content="Explore Saudi Arabia's most beautiful destinations, luxury hotels, and authentic restaurants. Plan your perfect trip with our AI travel planner." />
      </Helmet>

      {/* Hero Section with Image Carousel */}
      <motion.section 
        className="hero-section" 
        ref={heroRef}
      >
        <div className="hero-carousel">
          {heroImages.map((image, index) => (
            <motion.div
              key={image.url}
              className={`carousel-slide ${index === currentImageIndex ? 'active' : ''}`}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: index === currentImageIndex ? 1 : 0
              }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            >
              <img 
                src={image.url} 
                alt={image.alt}
                className="carousel-image"
                onError={(e) => {
                  console.error(`Failed to load image: ${image.url}`);
                  e.target.style.backgroundColor = '#666';
                  e.target.style.display = 'block';
                }}
                style={{
                  opacity: imagesLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out'
                }}
              />
            </motion.div>
          ))}
        </div>
        <div className="overlay"></div>
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover Saudi Arabia — Your Journey,<br /> Your Way
          </motion.h1>
          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/itinerary-planner" className="cta-button primary">
              Start Planning
            </Link>
            <Link to="/destinations" className="cta-button secondary">
              Explore Saudi Destinations
            </Link>
          </motion.div>
          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Explore authentic Saudi destinations, luxurious hotels, gourmet
            restaurants, and create your personalized trip with AI.
          </motion.p>
        </div>
      </motion.section>
      
      {/* Quick Links Section */}
      <motion.section 
        className="quick-links-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="quick-links">
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Link to="/hotels" className="quick-link">
                <i className="bi bi-building"></i>
                <span>Find Hotels</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Link to="/restaurants" className="quick-link">
                <i className="bi bi-cup-hot"></i>
                <span>Discover Restaurants</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Link to="/destinations" className="quick-link">
                <i className="bi bi-geo-alt"></i>
                <span>Explore Destinations</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
              <Link to="/itinerary-planner" className="quick-link">
                <i className="bi bi-map"></i>
                <span>Start Planning Trip</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Featured Saudi Destinations */}
      <motion.section 
        className="featured-section destinations-section"
        ref={destinationsRef}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="section-header">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Featured Saudi Destinations
            </motion.h2>
            <motion.p 
              className="section-subtitle"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Discover extraordinary places across the Kingdom of Saudi Arabia
            </motion.p>
          </div>
          
          <div className="destinations-grid">
            {destinations.length > 0 ? (
              destinations.map((destination, index) => (
                <motion.div 
                  key={destination._id} 
                  className="destination-card"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover="hover"
                  whileTap="tap"
                  variants={cardHoverVariants}
                >
                  <div className="card-image">
                    <img 
                      src={destination.imageUrl} 
                      alt={`${destination.name} - Saudi Arabia destination`} 
                      loading="lazy"
                    />
                    <div className="image-overlay"></div>
                  </div>
                  <div className="card-content">
                    <h3>{destination.name || 'Saudi Destination'}</h3>
                    <p className="description">{destination.shortDescription}</p>
                    <p className="location">
                      <i className="bi bi-geo-alt-fill"></i> 
                      {destination.locationCity || 'Saudi Arabia'}
                    </p>
                    <Link to={`/destinations/${destination._id}`} className="view-button">
                      Explore Destination
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : loading ? (
              <div className="loading">
                <i className="bi bi-hourglass-split spinning"></i>
                <span>Discovering Saudi destinations...</span>
              </div>
            ) : (
              <div className="no-results">
                <i className="bi bi-map"></i>
                <p>No featured destinations available at the moment</p>
              </div>
            )}
          </div>
          
          <motion.div 
            className="view-all-link"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/destinations">View All Saudi Destinations <i className="bi bi-arrow-right"></i></Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Top Hotels in Saudi Arabia */}
      <motion.section 
        className="featured-section hotels-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="saudi-pattern left"></div>
        <div className="container">
          <div className="section-header">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Top Hotels in Saudi Arabia
            </motion.h2>
            <motion.p 
              className="section-subtitle"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Experience world-class luxury and hospitality across the Kingdom
            </motion.p>
          </div>
          
          <div className="hotel-grid">
            {hotels.length > 0 ? (
              hotels.map((hotel, index) => (
                <motion.div 
                  key={hotel._id} 
                  className="hotel-card"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover="hover"
                  whileTap="tap"
                  variants={cardHoverVariants}
                >
                  <div className="card-image">
                    <img 
                      src={hotel.imageUrl} 
                      alt={`${hotel.name} - Luxury hotel in ${hotel.locationCity || 'Saudi Arabia'}`} 
                      loading="lazy"
                    />
                    <div className="image-overlay"></div>
                  </div>
                  <div className="card-content">
                    <h3>{hotel.name || 'Luxury Saudi Hotel'}</h3>
                    <p className="location">
                      <i className="bi bi-geo-alt-fill"></i> 
                      {hotel.locationCity || 'Saudi Arabia'}
                    </p>
                    <p className="description">{hotel.shortDescription}</p>
                    
                    <div className="hotel-features">
                      {hotel.amenities && hotel.amenities.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="feature-tag">{amenity}</span>
                      ))}
                      {(!hotel.amenities || hotel.amenities.length === 0) && (
                        <>
                          <span className="feature-tag">Luxury</span>
                          <span className="feature-tag">WiFi</span>
                          <span className="feature-tag">Restaurant</span>
                        </>
                      )}
                    </div>
                    
                    <Link to={`/hotels/${hotel._id}`} className="view-button">
                      View Hotel Details
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : loading ? (
              <div className="loading">
                <i className="bi bi-hourglass-split spinning"></i>
                <span>Discovering luxury Saudi hotels...</span>
              </div>
            ) : (
              <div className="no-results">
                <i className="bi bi-building"></i>
                <p>No featured hotels available at the moment</p>
              </div>
            )}
          </div>
          
          <motion.div 
            className="view-all-link"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/hotels">View All Saudi Hotels <i className="bi bi-arrow-right"></i></Link>
          </motion.div>
        </div>
        <div className="saudi-pattern right"></div>
      </motion.section>
      
      {/* Top Restaurants in Saudi Arabia */}
      <motion.section 
        className="featured-section restaurants-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="section-header">
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Top Restaurants in Saudi Arabia
            </motion.h2>
            <motion.p 
              className="section-subtitle"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Savor authentic Saudi cuisine and international delicacies
            </motion.p>
          </div>
          
          <div className="restaurants-grid">
            {restaurants.length > 0 ? (
              restaurants.slice(0, 5).map((restaurant, index) => (
                <motion.div 
                  key={restaurant._id} 
                  className="restaurant-card"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover="hover"
                  whileTap="tap"
                  variants={cardHoverVariants}
                >
                  <div className="card-image">
                    <img 
                      src={restaurant.imageUrl} 
                      alt={`${restaurant.name} - Restaurant in ${restaurant.locationCity || 'Saudi Arabia'}`} 
                      loading="lazy"
                    />
                    <div className="image-overlay"></div>
                    <div className="cuisine-tag">
                      {restaurant.cuisine || 'Saudi Cuisine'}
                    </div>
                  </div>
                  <div className="card-content">
                    <h3>{restaurant.name || 'Saudi Restaurant'}</h3>
                    <p className="location">
                      <i className="bi bi-geo-alt-fill"></i> 
                      {restaurant.locationCity || 'Saudi Arabia'}
                    </p>
                    
                    <div className="rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i 
                          key={i} 
                          className={`bi ${i < Math.round(restaurant.rating) ? 'bi-star-fill' : 'bi-star'}`}
                        ></i>
                      ))}
                      <span className="rating-text">{restaurant.rating?.toFixed(1) || '4.5'}</span>
                    </div>
                    
                    <p className="description">{restaurant.shortDescription}</p>
                    
                    <Link to={`/restaurants/${restaurant._id}`} className="view-button">
                      View Restaurant
                      <i className="bi bi-arrow-right"></i>
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : loading ? (
              <div className="loading">
                <i className="bi bi-hourglass-split spinning"></i>
                <span>Discovering Saudi restaurants...</span>
              </div>
            ) : (
              <div className="no-results">
                <i className="bi bi-cup-hot"></i>
                <p>No featured restaurants available at the moment</p>
              </div>
            )}
          </div>
          
          <motion.div 
            className="view-all-link"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/restaurants">View All Saudi Restaurants <i className="bi bi-arrow-right"></i></Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* AI Itinerary Generator */}
      <motion.section 
        className="ai-planner-section" 
        ref={aiPlannerRef}
      >
        <div className="parallax-overlay"></div>
        <div className="container">
          <motion.div 
            className="ai-planner-content"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Plan Your Trip with AI
            </motion.h2>
            <p className="section-subtitle">Create your personalized Saudi Arabia itinerary in minutes</p>
            
            <div className="planner-steps">
              <motion.div 
                className="step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              >
                <div className="step-icon">
                  <i className="bi bi-clipboard-check"></i>
                </div>
                <h3>Tell Us Your Preferences</h3>
                <p>Quick questions about your travel style and interests</p>
              </motion.div>
              
              <motion.div 
                className="step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              >
                <div className="step-icon">
                  <i className="bi bi-magic"></i>
                </div>
                <h3>Get Your Itinerary</h3>
                <p>AI creates your custom travel plan in minutes</p>
              </motion.div>
              
              <motion.div 
                className="step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              >
                <div className="step-icon">
                  <i className="bi bi-emoji-smile"></i>
                </div>
                <h3>Start Exploring</h3>
                <p>Begin your journey across Saudi Arabia</p>
              </motion.div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/itinerary-planner" className="cta-button primary">Start Planning with AI</Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Newsletter - Saudi Travel Updates */}
      <motion.section 
        className="newsletter-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <motion.div 
            className="newsletter-content"
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2>Stay Updated on Saudi Arabia Travel</h2>
            <p>Receive new Saudi destinations, events, and travel tips for your next journey to the Kingdom!</p>
            <form onSubmit={handleEmailSubmit} className="newsletter-form">
              <div className="form-group">
                <i className="bi bi-envelope"></i>
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Subscribe
                </motion.button>
              </div>
            </form>
            <p className="privacy-note"><i className="bi bi-shield-check"></i> We respect your privacy and will never share your information</p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
