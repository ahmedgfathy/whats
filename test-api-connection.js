// Quick test to check if the backend API is working
const axios = require('axios');

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:3001/api';
  
  try {
    console.log('Testing backend API connection...');
    
    // Test health endpoint
    try {
      const health = await axios.get(`${baseUrl}/health`);
      console.log('✅ Health check:', health.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
    }
    
    // Test properties endpoint
    try {
      const properties = await axios.get(`${baseUrl}/properties?limit=5`);
      console.log('✅ Properties:', properties.data?.length || 'No data', 'properties found');
    } catch (error) {
      console.log('❌ Properties failed:', error.message);
    }
    
    // Test stats endpoint
    try {
      const stats = await axios.get(`${baseUrl}/stats`);
      console.log('✅ Stats:', stats.data);
    } catch (error) {
      console.log('❌ Stats failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
};

testEndpoints();
