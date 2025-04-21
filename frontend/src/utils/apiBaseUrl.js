// Dynamically determine the API base URL for the frontend
// Priority: VITE_API_URL > same host as frontend with /api

export function getApiBaseUrl() {
  // Use VITE_API_URL if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Otherwise, default to same host as frontend, with '/api' path
  const { protocol, hostname, port } = window.location;
  let apiPort = port;
  // Optionally, you can set a fallback port if needed, e.g.:
  // if (!apiPort) apiPort = '5001';
  return `${protocol}//${hostname}${apiPort ? `:${apiPort}` : ''}/api`;
}
