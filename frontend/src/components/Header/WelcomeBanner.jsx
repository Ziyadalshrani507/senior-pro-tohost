import React, { useState, useEffect } from 'react';
import './Header.css';

const WelcomeBanner = ({ username }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-hide the banner after just 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000); // Changed from 10000ms to 2000ms (2 seconds)
    
    // Clean up timer
    return () => clearTimeout(timer);
  }, []);

  // When banner is closed, update navbar position
  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (isVisible) {
        navbar.classList.add('with-banner');
      } else {
        navbar.classList.remove('with-banner');
      }
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="welcome-banner">
      <i className="bi bi-stars welcome-icon"></i>
      Happy to have you again, <span className="welcome-username">Mr. {username || 'Ziyad'}!</span>
      <button 
        className="close-welcome" 
        onClick={() => setIsVisible(false)}
        aria-label="Close welcome message"
      >
        <i className="bi bi-x"></i>
      </button>
    </div>
  );
};

export default WelcomeBanner;