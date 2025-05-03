import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Page titles mapping for better context
const pageContextMap = {
  '/': 'Home Page',
  '/about': 'About Us',
  '/tours': 'Tours Listing',
  '/hotels': 'Hotel Listings',
  '/destinations': 'Destinations',
  '/restaurants': 'Restaurants',
  '/itinerary-planner': 'Itinerary Planning Tool',
  '/search': 'Search Results',
  '/signup': 'Sign Up',
  '/signin': 'Sign In',
  '/profile': 'User Profile',
  '/admin/dashboard': 'Admin Dashboard'
};

/**
 * Component that tracks page changes and updates Chatbase with contextual information
 */
const ChatbasePageTracker = () => {
  const location = useLocation();
  
  // Update Chatbase context when route changes
  useEffect(() => {
    if (!window.chatbase) return;
    
    // Get the current path
    const currentPath = location.pathname;
    
    // Get readable page name from our map or use path as fallback
    let pageName = pageContextMap[currentPath] || null;
    
    // Check for dynamic routes like /:type/:id
    if (!pageName) {
      // Check for item details pages
      if (/^\/[^\/]+\/[^\/]+$/.test(currentPath)) {
        const [_, type, id] = currentPath.split('/');
        pageName = `${type.charAt(0).toUpperCase() + type.slice(1)} Details`;
      }
      // Check for itinerary details
      else if (currentPath.startsWith('/itinerary/')) {
        pageName = 'Itinerary Details';
      }
      else {
        // Use path as fallback
        pageName = `Page: ${currentPath}`;
      }
    }
    
    // Update Chatbase with page context
    window.chatbase('updateContext', {
      page: currentPath,
      pageName: pageName,
      url: window.location.href
    });
    
    console.log('Chatbase context updated:', pageName);
  }, [location]);
  
  // This component doesn't render anything
  return null;
};

export default ChatbasePageTracker;