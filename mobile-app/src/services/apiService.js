import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration for live Neon database server
const API_CONFIG = {
  baseURL: 'https://your-neon-db-server.com/api', // Replace with your actual Neon server URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Create axios instance
const api = axios.create(API_CONFIG);

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userSession');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Authentication functions
export const loginUser = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password
    });
    
    if (response.data.success) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('userSession', JSON.stringify(response.data.user));
      return { success: true, user: response.data.user };
    }
    
    return { success: false, message: response.data.message || 'Login failed' };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Network error. Please check your connection.' 
    };
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userSession');
  }
};

export const validateSession = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return false;
    
    const response = await api.get('/auth/validate');
    return response.data.valid;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

// Property/Message functions
export const getAllMessages = async (page = 1, limit = 20) => {
  try {
    const response = await api.get(`/messages?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const searchMessages = async (query, filters = {}) => {
  try {
    const response = await api.post('/messages/search', {
      query,
      filters
    });
    return response.data;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

export const searchProperties = async (query, filters = {}) => {
  try {
    const response = await api.post('/properties/search', {
      query,
      filters
    });
    return response.data;
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

export const getPropertyTypeStats = async () => {
  try {
    const response = await api.get('/stats/property-types');
    return response.data;
  } catch (error) {
    console.error('Error fetching property stats:', error);
    throw error;
  }
};

export const getPropertyDetails = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
};

export const updateProperty = async (propertyId, data) => {
  try {
    const response = await api.put(`/properties/${propertyId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

export const deleteProperty = async (propertyId) => {
  try {
    const response = await api.delete(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

export const uploadChatData = async (chatData) => {
  try {
    const response = await api.post('/upload/chat', chatData);
    return response.data;
  } catch (error) {
    console.error('Error uploading chat data:', error);
    throw error;
  }
};

export const uploadCSVData = async (csvData) => {
  try {
    const response = await api.post('/upload/csv', csvData);
    return response.data;
  } catch (error) {
    console.error('Error uploading CSV data:', error);
    throw error;
  }
};

// Offline storage functions
export const saveOfflineData = async (key, data) => {
  try {
    await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving offline data:', error);
  }
};

export const getOfflineData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(`offline_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting offline data:', error);
    return null;
  }
};

export const clearOfflineData = async (key) => {
  try {
    await AsyncStorage.removeItem(`offline_${key}`);
  } catch (error) {
    console.error('Error clearing offline data:', error);
  }
};

// Network status check
export const checkNetworkStatus = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export default api;
