// Dynamically determine the API base URL for the frontend
// Priority: VITE_API_URL > same host as frontend with /api

export function getApiBaseUrl() {
  // Use VITE_API_URL if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Force using the backend server port when in development mode
  // This is crucial for the Saudi tourism platform API to work correctly
  if (import.meta.env.DEV) {
    return 'http://localhost:5001/api';
  }
  
  // Otherwise, default to same host as frontend, with '/api' path
  const { protocol, hostname, port } = window.location;
  let apiPort = port;
  
  // Always use port 5001 for backend API when no port is specified
  if (!apiPort) apiPort = '5001';
  
  return `${protocol}//${hostname}:${apiPort}/api`;
}
