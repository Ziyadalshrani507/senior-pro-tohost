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
  
  // Refs for sections with parallax effects
  const heroRef = useRef(null);
  const destinationsRef = useRef(null);
  const aiPlannerRef = useRef(null);
  const mapRef = useRef(null);
  
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
        const destinationData = destinationsRes.data?.destinations || destinationsRes.data || [];
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
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="home-page">
      <Helmet>
        <title>Discover Saudi Arabia - Your Personalized Journey</title>
        <meta name="description" content="Explore Saudi Arabia's most beautiful destinations, luxury hotels, and authentic restaurants. Plan your perfect trip with our AI travel planner." />
      </Helmet>

      {/* Hero Section with Parallax Effect */}
      <motion.section 
        className="hero-section" 
        ref={heroRef}
        style={{ 
          backgroundImage: `url('/assets/saudi-landmark.jpg')`,
          backgroundPositionY: heroBackgroundY 
        }}
      >
        <div className="overlay"></div>
        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Discover Saudi Arabia — Your Journey, Your Way
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Explore authentic Saudi destinations, luxurious hotels, gourmet restaurants, and create your personalized trip with AI.
          </motion.h2>
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link to="/itinerary-planner" className="cta-button primary">Start Planning</Link>
            <Link to="/destinations" className="cta-button secondary">Explore Saudi Destinations</Link>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Quick Search Section */}
      <motion.section 
        className="quick-search-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <motion.div 
              className="search-input-container"
              initial={{ scale: 0.95 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <i className="bi bi-geo-alt-fill"></i>
              <input 
                type="text" 
                placeholder="Where do you want to go in Saudi Arabia?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <motion.button 
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="bi bi-search"></i>
              </motion.button>
            </motion.div>
          </form>
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
              restaurants.map((restaurant, index) => (
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
      
      {/* AI Itinerary Generator with Parallax */}
      <motion.section 
        className="ai-planner-section" 
        ref={aiPlannerRef}
        style={{ 
          backgroundImage: `url('/assets/saudi-map-bg.jpg')`,
          backgroundPositionY: mapBackgroundY
        }}
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
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Plan Your Dream Saudi Trip — Instantly with AI
            </motion.h2>
            
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
                <h3>Answer simple questions</h3>
                <p>Share your preferences, budget, and which Saudi cities you want to explore.</p>
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
                <h3>Receive your personalized Saudi travel itinerary</h3>
                <p>Our AI crafts a custom Saudi journey matching your exact preferences.</p>
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
                <h3>Enjoy your journey</h3>
                <p>Experience the beauty of Saudi Arabia with a perfectly crafted itinerary.</p>
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
      
      {/* User Testimonials with Saudi Focus */}
      <motion.section 
        className="testimonials-section"
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
              What Travelers Say About Saudi Arabia
            </motion.h2>
          </div>
          
          <div className="testimonials-grid">
            <motion.div 
              className="testimonial-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
            >
              <div className="quote-icon"><i className="bi bi-quote"></i></div>
              <div className="testimonial-content">
                <p>"The AI planner helped me explore hidden gems in Saudi Arabia I never knew about! From Al-Ula's ancient wonders to Riyadh's modern marvels, every recommendation was spot on."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-image">
                  <img src="/assets/testimonial-1.jpg" alt="Sarah M." />
                </div>
                <div className="author-info">
                  <h4>Sarah M.</h4>
                  <p>Tourist from United Kingdom</p>
                  <div className="stars">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="testimonial-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
            >
              <div className="quote-icon"><i className="bi bi-quote"></i></div>
              <div className="testimonial-content">
                <p>"The luxury hotels and authentic Saudi restaurants recommended by this platform made my business trip exceptional. I particularly enjoyed the cuisine in Jeddah and the hospitality across the Kingdom."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-image">
                  <img src="/assets/testimonial-2.jpg" alt="Mohammed A." />
                </div>
                <div className="author-info">
                  <h4>Mohammed A.</h4>
                  <p>Business Traveler from UAE</p>
                  <div className="stars">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="testimonial-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
            >
              <div className="quote-icon"><i className="bi bi-quote"></i></div>
              <div className="testimonial-content">
                <p>"Our family vacationed in Saudi Arabia using the AI planner, and it created a perfect cultural journey through Riyadh and Al-Ula. The kids loved the activities and we all enjoyed the authentic experiences."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-image">
                  <img src="/assets/testimonial-3.jpg" alt="David L." />
                </div>
                <div className="author-info">
                  <h4>David L.</h4>
                  <p>Family Traveler from USA</p>
                  <div className="stars">
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-fill"></i>
                    <i className="bi bi-star-half"></i>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Interactive Map of Saudi Arabia */}
      <motion.section 
        className="map-section"
        ref={mapRef}
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
              Explore Saudi Arabia
            </motion.h2>
            <motion.p 
              className="section-subtitle"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Discover our destinations, hotels, and restaurants across the Kingdom
            </motion.p>
          </div>
          
          <motion.div 
            className="interactive-map"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="saudi-map-container">
              <img src="/assets/saudi-arabia-map.svg" alt="Map of Saudi Arabia" className="saudi-map" />
              
              <motion.div 
                className="map-pin riyadh"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="pin-dot"></div>
                <div className="pin-pulse"></div>
                <div className="pin-info">
                  <h3>Riyadh</h3>
                  <p>The capital of Saudi Arabia offers modern architecture, luxury hotels, and authentic cuisine</p>
                  <div className="pin-stats">
                    <span><i className="bi bi-building"></i> 5 Hotels</span>
                    <span><i className="bi bi-cup-hot"></i> 10 Restaurants</span>
                    <span><i className="bi bi-geo-alt"></i> 7 Destinations</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="map-pin jeddah"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="pin-dot"></div>
                <div className="pin-pulse"></div>
                <div className="pin-info">
                  <h3>Jeddah</h3>
                  <p>Saudi Arabia's coastal gem with beautiful beaches, historical sites, and vibrant culture</p>
                  <div className="pin-stats">
                    <span><i className="bi bi-building"></i> 7 Hotels</span>
                    <span><i className="bi bi-cup-hot"></i> 12 Restaurants</span>
                    <span><i className="bi bi-geo-alt"></i> 8 Destinations</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="map-pin al-ula"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="pin-dot"></div>
                <div className="pin-pulse"></div>
                <div className="pin-info">
                  <h3>Al-Ula</h3>
                  <p>Home to ancient wonders and breathtaking desert landscapes</p>
                  <div className="pin-stats">
                    <span><i className="bi bi-building"></i> 3 Hotels</span>
                    <span><i className="bi bi-cup-hot"></i> 5 Restaurants</span>
                    <span><i className="bi bi-geo-alt"></i> 6 Destinations</span>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="map-pin dammam"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="pin-dot"></div>
                <div className="pin-pulse"></div>
                <div className="pin-info">
                  <h3>Dammam</h3>
                  <p>Saudi Arabia's eastern gateway with beautiful corniche and cultural attractions</p>
                  <div className="pin-stats">
                    <span><i className="bi bi-building"></i> 4 Hotels</span>
                    <span><i className="bi bi-cup-hot"></i> 8 Restaurants</span>
                    <span><i className="bi bi-geo-alt"></i> 5 Destinations</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <div className="map-note">
            <i className="bi bi-info-circle"></i>
            <p>Click on pins to explore real destinations, hotels, and restaurants in each region</p>
          </div>
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
