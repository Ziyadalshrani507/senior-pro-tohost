import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl } from '../utils/apiBaseUrl';
import { setUsernameCookie, deleteCookie, setUserInfoCookie } from '../utils/cookieUtils';

const AuthContext = createContext();
const API_BASE_URL = getApiBaseUrl();

// Token expiration time in milliseconds (24 hours to match cookie expiration)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Log out user when token expires
  const handleTokenExpiration = useCallback(() => {
    console.log('Token expired, logging out');
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
  }, []);

  // Update activity timestamp with any user interaction
  const updateActivity = useCallback(() => {
    const currentTime = Date.now();
    setLastActivity(currentTime);
    localStorage.setItem('lastActivity', currentTime.toString());
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // This tells fetch to include cookies in the request
      });
      
      if (response.ok) {
        const data = await response.json();
        // Still store token in local storage for backward compatibility
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
        }
        updateActivity();
      } else {
        // If refresh fails due to very old token, log out
        handleTokenExpiration();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }, [user, handleTokenExpiration, updateActivity]);

  // Check token expiration on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedActivity = localStorage.getItem('lastActivity');
    
    if (savedToken && savedUser) {
      try {
        // Check token expiration based on last activity
        const lastActivityTime = parseInt(savedActivity || '0', 10);
        const currentTime = Date.now();
        
        // If no activity for token expiry time, log out
        if (currentTime - lastActivityTime > TOKEN_EXPIRY) {
          handleTokenExpiration();
        } else {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setLastActivity(lastActivityTime);
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        handleTokenExpiration();
      }
    }
    setLoading(false);
  }, [handleTokenExpiration]);

  const login = (userData, newToken) => {
    // Ensure user data has the correct ID field
    const userWithId = {
      ...userData,
      _id: userData.id || userData._id // Support both id and _id formats
    };
    
    setUser(userWithId);
    setToken(newToken); // Still store token for backward compatibility
    const currentTime = Date.now();
    setLastActivity(currentTime);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userWithId));
    localStorage.setItem('lastActivity', currentTime.toString());
    
    // Set username cookie for user recognition (client-side only)
    const username = userWithId.email || userWithId.firstName || 'user';
    setUsernameCookie(username);
    
    // Set user info cookie with first name and gender
    if (userWithId.firstName) {
      setUserInfoCookie(userWithId.firstName, userWithId.gender || 'unknown');
    }
  };

  const logout = async () => {
    try {
      // Call the signout endpoint to clear the cookie
      await fetch(`${API_BASE_URL}/api/auth/signout`, {
        method: 'POST',
        credentials: 'include' // Include cookies in the request
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local state regardless of server response
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastActivity');
      
      // Delete client-side cookies
      deleteCookie('username');
      deleteCookie('userInfo');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Set up global activity tracking
  useEffect(() => {
    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const activityHandler = () => {
      updateActivity();
      
      // If it's been more than 30 minutes since token refresh, refresh it
      const currentTime = Date.now();
      const lastRefreshTime = parseInt(localStorage.getItem('lastTokenRefresh') || '0', 10);
      
      if (currentTime - lastRefreshTime > 30 * 60 * 1000) { // 30 minutes
        refreshToken();
        localStorage.setItem('lastTokenRefresh', currentTime.toString());
      }
    };
    
    // Add activity listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, activityHandler);
    });
    
    // Set up token expiration check interval
    const tokenCheckInterval = setInterval(() => {
      const lastActivityTime = parseInt(localStorage.getItem('lastActivity') || '0', 10);
      const currentTime = Date.now();
      
      // If no activity for token expiry time, log out
      if (user && currentTime - lastActivityTime > TOKEN_EXPIRY) {
        handleTokenExpiration();
      }
    }, 60000); // Check every minute
    
    return () => {
      // Clean up event listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, activityHandler);
      });
      clearInterval(tokenCheckInterval);
    };
  }, [user, updateActivity, refreshToken, handleTokenExpiration]);

  // Set up interceptor for API calls to handle expired tokens
  useEffect(() => {
    // This is a pseudo-interceptor pattern for regular fetch
    // For a real app with axios or another HTTP client, use their interceptor functionality
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      // Add credentials for cookie-based auth if not specified
      if (args[1] && !args[1].credentials) {
        args[1] = {
          ...args[1],
          credentials: 'include' // Include cookies in all requests by default
        };
      }
      
      try {
        const response = await originalFetch(...args);
        
        // If response indicates token expired, force logout
        if (response.status === 401) {
          try {
            const responseData = await response.clone().json();
            if (responseData.message?.includes('expired')) {
              handleTokenExpiration();
            }
          } catch (e) {
            // If we can't parse the JSON, just continue
          }
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };
    
    return () => {
      window.fetch = originalFetch;
    };
  }, [handleTokenExpiration]);

  const value = {
    user,
    token, // Keep token in context for backward compatibility
    login,
    logout,
    updateUser,
    loading,
    refreshToken,
    updateActivity
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
