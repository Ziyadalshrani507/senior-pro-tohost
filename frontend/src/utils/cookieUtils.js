/**
 * Cookie utility functions for managing client-side cookies
 */

/**
 * Set a cookie with the specified parameters
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} maxAge - Cookie max age in seconds
 * @param {string} path - Cookie path
 * @param {boolean} secure - Whether the cookie should be secure (HTTPS only)
 * @param {string} sameSite - SameSite attribute (Strict, Lax, None)
 */
export function setCookie(name, value, maxAge = 604800, path = '/', secure = false, sameSite = 'Strict') {
  const isSecure = window.location.protocol === 'https:' || secure;
  const cookieString = `${name}=${encodeURIComponent(value)}; max-age=${maxAge}; path=${path}; SameSite=${sameSite}${isSecure ? '; Secure' : ''}`;
  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null if not found
 */
export function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    // Does this cookie string begin with the name we want?
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return null;
}

/**
 * Delete a cookie by setting its expiration to the past
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path
 */
export function deleteCookie(name, path = '/') {
  document.cookie = `${name}=; max-age=-1; path=${path}`;
}

/**
 * Set the username cookie when user logs in
 * @param {string} username - User's email or username
 */
export function setUsernameCookie(username) {
  setCookie('username', username, 604800); // 1 week in seconds
}

/**
 * Set the last destination cookie when user searches
 * @param {string} destination - Destination name (city, country, etc.)
 */
export function setLastDestinationCookie(destination) {
  setCookie('lastDestination', destination, 604800); // 1 week in seconds
}

/**
 * Get the username from the cookie
 * @returns {string|null} - Username or null if not found
 */
export function getUsername() {
  return getCookie('username');
}

/**
 * Get the last searched destination from the cookie
 * @returns {string|null} - Last destination or null if not found
 */
export function getLastDestination() {
  return getCookie('lastDestination');
}

/**
 * Set the userInfo cookie when user logs in
 * @param {string} firstName - User's first name
 * @param {string} gender - User's gender ('male' or 'female')
 */
export function setUserInfoCookie(firstName, gender) {
  const userInfo = JSON.stringify({ firstName, gender });
  setCookie('userInfo', userInfo, 604800); // 1 week in seconds
}

/**
 * Get the user info from the cookie
 * @returns {Object|null} - User info object or null if not found
 */
export function getUserInfo() {
  const userInfo = getCookie('userInfo');
  if (userInfo) {
    try {
      return JSON.parse(userInfo);
    } catch (error) {
      console.error('Error parsing userInfo cookie:', error);
      return null;
    }
  }
  return null;
}

/**
 * Set the last searched city cookie
 * @param {string} city - City name that was searched
 */
export function setLastSearchedCityCookie(city) {
  setCookie('lastSearchedCity', city, 604800); // 1 week in seconds
}

/**
 * Get the last searched city from the cookie
 * @returns {string|null} - Last searched city or null if not found
 */
export function getLastSearchedCity() {
  return getCookie('lastSearchedCity');
}

/**
 * Set liked cities cookie with array of cities where user has liked content
 * @param {Array<Object>} citiesData - Array of city data objects with name and timestamp
 */
export function setLikedCitiesCookie(citiesData) {
  if (!Array.isArray(citiesData) || citiesData.length === 0) return;
  
  // Ensure we have unique cities only (keep the most recent timestamp if duplicate)
  const uniqueCitiesMap = new Map();
  citiesData.forEach(cityObj => {
    if (cityObj.name) {
      uniqueCitiesMap.set(cityObj.name, cityObj);
    }
  });
  
  // Convert map back to array
  const uniqueCities = Array.from(uniqueCitiesMap.values());
  
  setCookie('likedCities', JSON.stringify(uniqueCities), 604800); // 1 week in seconds
}

/**
 * Get array of liked cities from cookie
 * @returns {Array<Object>|null} - Array of city data objects with name and timestamp, or null if not found
 */
export function getLikedCities() {
  const likedCitiesStr = getCookie('likedCities');
  if (likedCitiesStr) {
    try {
      const parsedData = JSON.parse(likedCitiesStr);
      
      // Handle backward compatibility with old format (string array)
      if (parsedData.length > 0 && typeof parsedData[0] === 'string') {
        // Convert old format to new format with current timestamp
        return parsedData.map(cityName => ({
          name: cityName,
          timestamp: Date.now()
        }));
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error parsing likedCities cookie:', error);
      return null;
    }
  }
  return null;
}

/**
 * Get array of just the city names from the liked cities cookie
 * @returns {Array<string>|null} - Array of city names
 */
export function getLikedCityNames() {
  const citiesData = getLikedCities();
  if (!citiesData) return null;
  return citiesData.map(city => city.name);
}

/**
 * Add a city to the liked cities cookie
 * @param {string} city - City name to add to liked cities
 */
export function addLikedCity(city) {
  if (!city) return;
  
  const likedCities = getLikedCities() || [];
  const timestamp = Date.now();
  
  // Check if city already exists
  const existingIndex = likedCities.findIndex(c => c.name === city);
  
  if (existingIndex >= 0) {
    // Update the timestamp to move this city to the top
    likedCities[existingIndex].timestamp = timestamp;
  } else {
    // Add new city with timestamp
    likedCities.push({
      name: city,
      timestamp: timestamp
    });
  }
  
  // Sort by timestamp (newest first)
  likedCities.sort((a, b) => b.timestamp - a.timestamp);
  
  setLikedCitiesCookie(likedCities);
  return true;
}

/**
 * Remove a city from the liked cities cookie
 * @param {string} city - City name to remove from liked cities
 * @param {boolean} checkNoLikes - Whether to check if there are no more likes in the city
 */
export function removeLikedCity(city, checkNoLikes = false) {
  if (!city) return;
  
  const likedCities = getLikedCities() || [];
  
  // Remove the city from the list
  const updatedCities = likedCities.filter(c => c.name !== city);
  
  // If the list has changed, update the cookie
  if (updatedCities.length !== likedCities.length) {
    if (updatedCities.length > 0) {
      setLikedCitiesCookie(updatedCities);
    } else {
      // If no cities left, delete the cookie
      deleteCookie('likedCities');
    }
    return true;
  }
  return false;
}