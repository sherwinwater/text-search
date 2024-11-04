// src/config/config.js
export const config = {
    SEARCH_ENGINE_API_URL: process.env.REACT_APP_SEARCH_ENGINE_API_URL || 'http://localhost:5009',
  };

const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
    console.log('Running in development mode');
  }else{
    console.log('Running in production mode');
}

console.log('API URL:', config.SEARCH_ENGINE_API_URL);