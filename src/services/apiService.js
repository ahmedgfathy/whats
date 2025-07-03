// Real API service for backend communication
// This replaces the mock database with actual HTTP calls to the SQLite backend

const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to handle API calls
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
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

// Authentication
export const authenticateUser = async (username, password) => {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  
  return response.success;
};

// Get message by ID
export const getMessageById = async (id) => {
  const response = await apiCall(`/messages/${id}`);
  return response.message;
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

// Admin function: Remove duplicate messages
export const removeDuplicateMessages = async () => {
  try {
    console.log('Removing duplicate messages...');
    const response = await apiCall('/admin/remove-duplicates', {
      method: 'POST'
    });
    console.log('Duplicate removal result:', response);
    return response;
  } catch (error) {
    console.error('Error removing duplicates:', error);
    throw error;
  }
};

export default {
  authenticateUser,
  insertMessage,
  searchMessages,
  getAllMessages,
  getPropertyTypeStats,
  importChatMessages,
  getMessageById,
  resetDatabase,
  getDatabaseSize,
  checkBackendHealth,
  removeDuplicateMessages
};
