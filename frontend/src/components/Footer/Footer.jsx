import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Saudi Tourism</h3>
          <p>Explore the beauty and culture of Saudi Arabia through our comprehensive tourism platform.</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/destinations">Destinations</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/developers">Developers</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Resources</h3>
          <ul>
            <li><Link to="/itinerary">Plan Your Trip</Link></li>
            <li><a href="https://www.visitsaudi.com" target="_blank" rel="noopener noreferrer">Visit Saudi</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Saudi Tourism Platform. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
