// API Configuration - shared between web and mobile
const API_CONFIG = {
    // Update this based on your environment
    development: {
        baseURL: 'https://unicycle-app.onrender.com', // Using production for mobile testing
        // For local testing: 'http://10.122.228.1:8000'
        // For mobile testing, use your computer's local IP instead of localhost
        // Example: baseURL: 'http://192.168.1.100:8000'
    },
    production: {
        baseURL: 'https://unicycle-app.onrender.com',
    }
};

// Auto-detect environment
const ENV = process.env.NODE_ENV || 'development';
const API_BASE_URL = API_CONFIG[ENV].baseURL;

module.exports = { API_BASE_URL, API_CONFIG };
