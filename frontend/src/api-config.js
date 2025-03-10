// api-config.js - Centralized API configuration

// Get the API URL from environment variables with a fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Log the API URL for debugging
console.log('API Configuration Loaded');
console.log('API URL:', API_URL);
console.log('Environment:', process.env.NODE_ENV);

// For Vercel deployments, make sure we're not using localhost
if (process.env.NODE_ENV === 'production' && API_URL.includes('localhost')) {
  console.warn('WARNING: Using localhost in production environment!');
  console.warn('Please set REACT_APP_API_URL environment variable in Vercel.');
}

// Export the API URL for use in components
export default API_URL;

// Helper function for API calls with proper error handling
export const apiCall = async (endpoint, options = {}) => {
  try {
    // Ensure withCredentials is set for cross-origin requests
    const defaultOptions = {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Log the request for debugging
    console.log(`API Request: ${API_URL}${endpoint}`);
    
    // Make the request
    const response = await fetch(`${API_URL}${endpoint}`, mergedOptions);
    
    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }
    
    // Parse the response as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
}; 