// Real API service for backend communication
// This replaces the mock database with actual HTTP calls to the SQLite backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? '/api' 
    : 'http://localhost:3001/api');

// Helper function to handle API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    console.log(`Making API call to: ${url}`);
    console.log('Request options:', requestOptions);
    
    const response = await fetch(url, requestOptions);
    
    console.log(`Response status: ${response.status}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Helper functions for generating missing data (for backward compatibility)
const generatePhoneNumber = () => {
  return `0${Math.floor(Math.random() * 2) + 1}${Math.floor(Math.random() * 9000000000) + 1000000000}`;
};

const generateAgentDescription = (agentName) => {
  const descriptions = [
    `${agentName} - سمسار عقاري محترف متخصص في العقارات السكنية والتجارية`,
    `${agentName} - خبرة أكثر من 10 سنوات في السوق العقاري المصري`,
    `${agentName} - وكيل عقاري معتمد ومتخصص في الاستثمار العقاري`,
    `${agentName} - مطور عقاري ومستشار في شراء وبيع العقارات`,
    `${agentName} - سمسار معتمد لدى الشهر العقاري والتطوير العمراني`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

const generateFullDescription = (type, area, location) => {
  const baseDesc = {
    apartment: `شقة مميزة في موقع استراتيجي بـ${location}، المساحة ${area} متر مربع، تشطيبات عالية الجودة، إطلالة رائعة، قريبة من المواصلات والخدمات، تصلح للسكن أو الاستثمار.`,
    villa: `فيلا فاخرة في ${location} بمساحة ${area} متر مربع، تصميم عصري، حديقة منسقة، جراج مغطى، أمن وحراسة 24 ساعة، موقع هادئ ومميز.`,
    land: `قطعة أرض في موقع مميز بـ${location}، المساحة ${area} متر مربع، على شارع رئيسي، مرافق متاحة، صالحة للبناء السكني أو التجاري، استثمار مضمون.`,
    office: `مكتب في برج تجاري بـ${location}، المساحة ${area} متر مربع، تشطيب راقي، أمن وحراسة، موقف سيارات، مناسب لجميع الأنشطة التجارية.`,
    warehouse: `مخزن في منطقة صناعية بـ${location}، المساحة ${area} متر مربع، ارتفاع مناسب، بوابات واسعة، ساحة مناورة، مناسب للتخزين والتوزيع.`,
    other: `عقار في ${location}، المساحة ${area} متر مربع، موقع مميز ومناسب للاستثمار.`
  };
  
  return baseDesc[type] || baseDesc.other;
};

// Authentication with enhanced security
export const authenticateUser = async (username, password) => {
  try {
    // For security, don't store credentials in the app
    // The backend should handle password hashing and validation
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.success) {
      // Store session token if provided by backend
      if (response.token) {
        localStorage.setItem('authToken', response.token);
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
};

// Enhanced authentication functions
export const logoutUser = async () => {
  try {
    await apiCall('/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionTime');
  }
};

export const validateSession = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    const response = await apiCall('/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.valid;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};

// Remove duplicate messages with enhanced error handling
export const removeDuplicateMessages = async () => {
  try {
    const response = await apiCall('/admin/remove-duplicates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response;
  } catch (error) {
    console.error('Error removing duplicates:', error);
    throw error;
  }
};

// Get message by ID
export const getMessageById = async (id) => {
  const response = await apiCall(`/messages/${id}`);
  return response;
};

// Insert new message
export const insertMessage = async (messageData) => {
  // Ensure all required fields are present
  const completeMessage = {
    ...messageData,
    timestamp: messageData.timestamp || new Date().toLocaleString('ar-EG'),
    agent_phone: messageData.agent_phone || generatePhoneNumber(),
    agent_description: messageData.agent_description || generateAgentDescription(messageData.sender || 'مستخدم جديد'),
    full_description: messageData.full_description || generateFullDescription(
      messageData.property_type || 'other',
      Math.floor(Math.random() * 200) + 80,
      messageData.location || 'موقع غير محدد'
    )
  };
  
  const response = await apiCall('/messages', {
    method: 'POST',
    body: JSON.stringify(completeMessage)
  });
  
  // Return the complete message object with the new ID
  return {
    id: response.id,
    ...completeMessage
  };
};

// Search messages
export const searchMessages = async (searchTerm = '', propertyType = 'all', limit = 10000) => {
  const params = new URLSearchParams();
  
  if (searchTerm.trim()) {
    params.append('search', searchTerm);
  }
  
  if (propertyType && propertyType !== 'all') {
    params.append('property_type', propertyType);
  }
  
  params.append('limit', limit.toString());
  
  const response = await apiCall(`/messages?${params.toString()}`);
  return response.messages;
};

// Get all messages
export const getAllMessages = async (propertyType = 'all', limit = 10000) => {
  return searchMessages('', propertyType, limit);
};

// Get property type statistics
export const getPropertyTypeStats = async () => {
  const response = await apiCall('/stats');
  console.log('Property type breakdown from API:', response.stats);
  return response.stats;
};

// Import messages from WhatsApp chat file (bulk import)
export const importChatMessages = async (parsedMessages) => {
  console.log(`Starting bulk import of ${parsedMessages.length} messages to SQLite database...`);
  
  // Prepare messages with complete data
  const completeMessages = parsedMessages.map(messageData => ({
    ...messageData,
    timestamp: messageData.timestamp || new Date().toLocaleString('ar-EG'),
    agent_phone: messageData.agent_phone || generatePhoneNumber(),
    agent_description: messageData.agent_description || generateAgentDescription(messageData.sender || 'مستخدم جديد'),
    full_description: messageData.full_description || generateFullDescription(
      messageData.property_type || 'other',
      Math.floor(Math.random() * 200) + 80,
      messageData.location || 'موقع غير محدد'
    )
  }));
  
  // Debug: Log some messages to see their property types and phone numbers
  completeMessages.slice(0, 5).forEach((msg, index) => {
    console.log(`Sample message ${index + 1} for SQLite import:`, {
      sender: msg.sender,
      property_type: msg.property_type,
      agent_phone_extracted: parsedMessages[index].agent_phone,
      agent_phone_final: msg.agent_phone,
      message: msg.message.substring(0, 50) + '...'
    });
  });
  
  const response = await apiCall('/messages/bulk', {
    method: 'POST',
    body: JSON.stringify({ messages: completeMessages })
  });
  
  console.log(`SQLite bulk import complete: ${response.imported} imported, ${response.skipped} skipped`);
  
  return response;
};

// CSV Import functionality
export const importCSVData = async (tableName, headers, data) => {
  try {
    console.log(`Starting CSV import to table: ${tableName}`);
    console.log(`Headers: ${headers?.join(', ')}`);
    console.log(`Data rows: ${data?.length}`);
    
    const requestBody = {
      tableName,
      headers,
      data
    };
    
    console.log('CSV Import Request Body:', requestBody);
    console.log('Request Body JSON:', JSON.stringify(requestBody));
    
    const response = await apiCall('/import-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('CSV import result:', response);
    return response;
  } catch (error) {
    console.error('CSV import error:', error);
    throw error;
  }
};

// Get available database tables for CSV import
export const getDatabaseTables = async () => {
  try {
    const response = await apiCall('/admin/tables', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.tables || [];
  } catch (error) {
    console.error('Error fetching database tables:', error);
    return [];
  }
};

// Validate CSV data before import
export const validateCSVData = async (tableName, headers, sampleData) => {
  try {
    const response = await apiCall('/validate-csv', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        tableName,
        headers,
        sampleData: sampleData.slice(0, 5) // Send only first 5 rows for validation
      })
    });
    return response;
  } catch (error) {
    console.error('CSV validation error:', error);
    throw error;
  }
};

// Function to reset database to initial state (for testing)
export const resetDatabase = async () => {
  // This would require a backend endpoint to reset/clear the database
  // For now, just return a message that this feature is not implemented
  console.warn('Reset database feature not implemented for SQLite backend');
  return 0;
};

// Function to get current database size
export const getDatabaseSize = async () => {
  try {
    const messages = await getAllMessages('all', 999999);
    const count = messages.length;
    console.log(`SQLite database currently contains ${count} messages`);
    return count;
  } catch (error) {
    console.error('Error getting database size:', error);
    return 0;
  }
};

// Health check
export const checkBackendHealth = async () => {
  try {
    const response = await apiCall('/health');
    return response;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { success: false, message: 'Backend not available' };
  }
};

// Update message/property
export const updateMessage = async (id, messageData) => {
  try {
    const response = await apiCall(`/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(messageData)
    });
    return response;
  } catch (error) {
    console.error('Error updating message:', error);
    throw new Error('Failed to update property: ' + error.message);
  }
};

// Delete message/property
export const deleteMessage = async (id) => {
  try {
    const response = await apiCall(`/messages/${id}`, {
      method: 'DELETE'
    });
    return response;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw new Error('Failed to delete property: ' + error.message);
  }
};

// Search properties from CSV import
export const searchProperties = async (searchTerm = '', filter = '', limit = 100) => {
  const params = new URLSearchParams();
  
  if (searchTerm.trim()) {
    params.append('q', searchTerm);
  }
  
  if (filter && filter !== 'all') {
    params.append('filter', filter);
  }
  
  params.append('limit', limit.toString());
  
  const response = await apiCall(`/search-properties?${params.toString()}`);
  return response.data;
};

// Combined search across both chat messages and properties
export const searchAll = async (searchTerm = '', filter = '', limit = 50) => {
  const params = new URLSearchParams();
  
  if (searchTerm.trim()) {
    params.append('q', searchTerm);
  }
  
  if (filter && filter !== 'all') {
    params.append('filter', filter);
  }
  
  params.append('limit', limit.toString());
  
  const response = await apiCall(`/search-all?${params.toString()}`);
  return response.data;
};

// Get dropdown data for forms
export const getDropdownData = async () => {
  try {
    const data = await apiCall('/dropdowns');
    return data.data;
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    throw error;
  }
};

export default {
  authenticateUser,
  logoutUser,
  validateSession,
  insertMessage,
  updateMessage,
  deleteMessage,
  searchMessages,
  getAllMessages,
  getPropertyTypeStats,
  importChatMessages,
  getMessageById,
  resetDatabase,
  getDatabaseSize,
  checkBackendHealth,
  removeDuplicateMessages,
  importCSVData,
  getDatabaseTables,
  validateCSVData,
  searchProperties,
  searchAll,
  getDropdownData
};
