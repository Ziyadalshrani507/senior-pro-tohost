import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserInfo } from '../../utils/cookieUtils';
import './Header.css';
import WelcomeBanner from './WelcomeBanner';
// Using relative path with URL constructor for the logo
// This is more reliable than import which depends on bundler configuration

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [userInfo, setUserInfo] = useState({ firstName: '', gender: 'unknown' });

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  // Check for userInfo cookie on component mount
  useEffect(() => {
    const storedUserInfo = getUserInfo();
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      {user && <WelcomeBanner username={userInfo.firstName || user.firstName} />}
      
      <nav className={`navbar navbar-expand-lg navbar-light fixed-top ${scrolled ? 'scrolled' : ''} ${user ? 'with-banner' : ''}`}>
        <div className="container-fluid px-3">
          {/* Logo on the leftmost edge */}
          <Link className="navbar-brand ms-0 ps-0" to="/">
            <img src="/logo.png" alt="Logo" className="navbar-logo" />
          </Link>
          
          {/* Hamburger menu for mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* Navigation content */}
          <div className="collapse navbar-collapse" id="navbarNav">
            {/* Navigation links in the middle */}
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/destinations')}`} to="/destinations">
                  <i className="bi bi-geo-alt"></i> Destinations
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/restaurants')}`} to="/restaurants">
                  <i className="bi bi-shop"></i> Restaurants
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/hotels')}`} to="/hotels">
                  <i className="bi bi-building"></i> Hotels
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive('/itinerary-planner')}`} to="/itinerary-planner">
                  <i className="bi bi-robot"></i> AI Planner
                </Link>
              </li>
              {user && user.role === 'admin' && (
                <li className="nav-item">
                  <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>
                    <i className="bi bi-speedometer2"></i> Dashboard
                  </Link>
                </li>
              )}
            </ul>
            
            {/* Auth buttons on the rightmost edge */}
            <div className="auth-buttons me-0 pe-0">
              {user ? (
                <div className="nav-item dropdown">
                  <button
                    className="user-dropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle"></i> 
                    <span>{user.firstName}</span>
                    <i className="bi bi-chevron-down" style={{ fontSize: '0.8rem', marginLeft: '2px' }}></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person-badge"></i> My Profile
                      </Link>
                    </li>
                    {user && user.role === 'admin' && (
                      <li>
                        <Link className="dropdown-item" to="/developer/profile">
                          <i className="bi bi-code-square"></i> Developer Profile
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/signin" className="auth-btn btn-outline">Sign In</Link>
                  <Link to="/signup" className="auth-btn btn-filled">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
