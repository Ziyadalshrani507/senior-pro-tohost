// Dynamically determine the API base URL for the frontend
// Priority: VITE_API_URL > same host as frontend with /api

//export function getApiBaseUrl() {
  // Use VITE_API_URL if set
  //if (import.meta.env.VITE_API_URL) {
   // return import.meta.env.VITE_API_URL;
  //}
  
  // Force using the backend server port when in development mode
  // This is crucial for the Saudi tourism platform API to work correctly
  //if (import.meta.env.DEV) {
   // return '/api';
  //}
  
  // Otherwise, default to same host as frontend, with '/api' path
  //const { protocol, hostname, port } = window.location;
  //let apiPort = port;
  
  // Always use port 5001 for backend API when no port is specified
  //if (!apiPort) apiPort = '5001';
  
//  return `${protocol}//${hostname}:${apiPort}/api`;
//}



export function getApiBaseUrl() {
  // Use env variable if provided
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Local dev: use proxy setup
  if (import.meta.env.DEV) {
    return '/api';
  }

  // Production: use same origin (no port!)
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}/api`;
}
