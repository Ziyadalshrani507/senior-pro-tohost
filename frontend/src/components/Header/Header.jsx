import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-light fixed-top ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link className="navbar-brand" to="/">
          Tourism Platform
        </Link>
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
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                <i className="bi bi-house-door"></i> Home
              </Link>
            </li>
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
            {user && user.role === 'admin' && (
              <>
                <li className="nav-item">
                  <Link to="/activity-management" className={`nav-link ${isActive('/activity-management')}`}>
                    <i className="bi bi-calendar-event"></i> Activity Management
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/restaurant-management" className={`nav-link ${isActive('/restaurant-management')}`}>
                    <i className="bi bi-shop-window"></i> Restaurant Management
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="auth-buttons">
            {user ? (
              <div className="nav-item dropdown">
                <button
                  className="user-dropdown dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i> {user.firstName}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/profile">
                      <i className="bi bi-person-badge"></i> Profile
                    </Link>
                  </li>
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
              <>
                <Link to="/signin" className="btn btn-outline-primary me-2">Sign In</Link>
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
