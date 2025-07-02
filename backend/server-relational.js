const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Simulated SQLite database using JSON files with relationships
const DB_FILES = {
  users: path.join(dbDir, 'users.json'),
  agents: path.join(dbDir, 'agents.json'),
  areas: path.join(dbDir, 'areas.json'),
  property_types: path.join(dbDir, 'property_types.json'),
  properties: path.join(dbDir, 'properties.json'),
  chat_messages: path.join(dbDir, 'chat_messages.json'),
  phone_operators: path.join(dbDir, 'phone_operators.json')
};

// Helper functions for JSON file operations
const readJSONFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

const writeJSONFile = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Phone number validation and operator extraction
const extractPhoneOperator = (phone) => {
  if (!phone) return null;
  
  // Clean phone number
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Egyptian mobile operators (exactly as specified)
  if (cleanPhone.startsWith('010')) return '010';
  if (cleanPhone.startsWith('011')) return '011';
  if (cleanPhone.startsWith('012')) return '012';
  if (cleanPhone.startsWith('015')) return '015';
  
  return null;
};

// Enhanced message processing with AI-like extraction
const processWhatsAppMessage = (message, sender) => {
  const extractedData = {
    property_type: null,
    area_name: null,
    price: null,
    area_size: null,
    rooms: null,
    features: []
  };
  
  const messageText = message.toLowerCase();
  
  // Property type detection (enhanced with more keywords)
  const propertyTypes = {
    'apartment': ['شقة', 'شقق', 'دور', 'أدوار', 'طابق', 'غرفة', 'غرف', 'استوديو'],
    'villa': ['فيلا', 'فيلات', 'قصر', 'قصور', 'بيت', 'بيوت', 'منزل', 'منازل', 'دوبلكس', 'بنتهاوس'],
    'land': ['أرض', 'أراضي', 'قطعة', 'قطع', 'مساحة', 'فدان', 'متر مربع'],
    'office': ['مكتب', 'مكاتب', 'إداري', 'تجاري', 'محل', 'محلات', 'معرض'],
    'warehouse': ['مخزن', 'مخازن', 'مستودع', 'مستودعات', 'ورشة', 'مصنع'],
    'shop': ['محل', 'محلات', 'متجر', 'متاجر', 'معرض', 'صالة عرض'],
    'building': ['عمارة', 'عمارات', 'مبنى', 'مباني', 'برج', 'أبراج']
  };
  
  for (const [type, keywords] of Object.entries(propertyTypes)) {
    if (keywords.some(keyword => messageText.includes(keyword))) {
      extractedData.property_type = type;
      break;
    }
  }
  
  // Area extraction (improved patterns)
  const areaPatterns = [
    /في\s+([^،\s]+(?:\s+[^،\s]+)*)/g,
    /بـ\s*([^،\s]+(?:\s+[^،\s]+)*)/g,
    /منطقة\s+([^،\s]+(?:\s+[^،\s]+)*)/g,
    /حي\s+([^،\s]+(?:\s+[^،\s]+)*)/g
  ];
  
  for (const pattern of areaPatterns) {
    const matches = [...messageText.matchAll(pattern)];
    if (matches.length > 0) {
      extractedData.area_name = matches[0][1].trim();
      break;
    }
  }
  
  // Price extraction (enhanced)
  const pricePatterns = [
    /السعر\s*:?\s*(\d+(?:\.\d+)?)\s*(ألف|مليون|k|m)?\s*(جنيه|ريال|درهم|دولار)?/g,
    /(\d+(?:\.\d+)?)\s*(ألف|مليون|k|m)?\s*(جنيه|ريال|درهم|دولار)/g,
    /بسعر\s*(\d+(?:\.\d+)?)\s*(ألف|مليون|k|m)?/g
  ];
  
  for (const pattern of pricePatterns) {
    const matches = [...messageText.matchAll(pattern)];
    if (matches.length > 0) {
      extractedData.price = matches[0][0];
      break;
    }
  }
  
  // Area size extraction
  const sizePatterns = [
    /مساحة\s*(\d+)\s*متر/g,
    /(\d+)\s*متر\s*مربع/g,
    /(\d+)\s*م\s*²/g,
    /(\d+)\s*متر/g
  ];
  
  for (const pattern of sizePatterns) {
    const matches = [...messageText.matchAll(pattern)];
    if (matches.length > 0) {
      extractedData.area_size = parseInt(matches[0][1]);
      break;
    }
  }
  
  // Rooms extraction
  const roomsPattern = /(\d+)\s*غرف?/g;
  const roomsMatches = [...messageText.matchAll(roomsPattern)];
  if (roomsMatches.length > 0) {
    extractedData.rooms = parseInt(roomsMatches[0][1]);
  }
  
  // Features extraction
  const features = {
    'has_elevator': ['أسانسير', 'مصعد', 'اسانسير'],
    'has_garage': ['جراج', 'كراج', 'موقف', 'مرآب'],
    'has_garden': ['حديقة', 'جنينة', 'حديقه'],
    'has_pool': ['مسبح', 'بسين', 'حمام سباحة'],
    'is_main_street': ['شارع رئيسي', 'طريق رئيسي', 'شارع عمومي'],
    'furnished': ['مفروش', 'مفروشة', 'بالأثاث'],
    'new_building': ['جديد', 'جديدة', 'حديث البناء']
  };
  
  for (const [feature, keywords] of Object.entries(features)) {
    if (keywords.some(keyword => messageText.includes(keyword))) {
      extractedData.features.push(feature);
    }
  }
  
  return extractedData;
};

// Initialize database with relational structure
const initializeDatabase = () => {
  console.log('🔧 Initializing relational database structure...');
  
  // Property Types
  let propertyTypes = readJSONFile(DB_FILES.property_types);
  if (propertyTypes.length === 0) {
    propertyTypes = [
      { id: 1, type_code: 'apartment', name_arabic: 'شقة', name_english: 'Apartment', is_active: true },
      { id: 2, type_code: 'villa', name_arabic: 'فيلا', name_english: 'Villa', is_active: true },
      { id: 3, type_code: 'land', name_arabic: 'أرض', name_english: 'Land', is_active: true },
      { id: 4, type_code: 'office', name_arabic: 'مكتب', name_english: 'Office', is_active: true },
      { id: 5, type_code: 'warehouse', name_arabic: 'مخزن', name_english: 'Warehouse', is_active: true },
      { id: 6, type_code: 'shop', name_arabic: 'محل', name_english: 'Shop', is_active: true },
      { id: 7, type_code: 'building', name_arabic: 'عمارة', name_english: 'Building', is_active: true }
    ];
    writeJSONFile(DB_FILES.property_types, propertyTypes);
  }
  
  // Areas
  let areas = readJSONFile(DB_FILES.areas);
  if (areas.length === 0) {
    areas = [
      { id: 1, name_arabic: 'مدينة نصر', name_english: 'Nasr City', city: 'القاهرة', district: 'شرق القاهرة' },
      { id: 2, name_arabic: 'المعادي', name_english: 'Maadi', city: 'القاهرة', district: 'جنوب القاهرة' },
      { id: 3, name_arabic: 'الزمالك', name_english: 'Zamalek', city: 'القاهرة', district: 'وسط القاهرة' },
      { id: 4, name_arabic: 'التجمع الخامس', name_english: 'Fifth Settlement', city: 'القاهرة الجديدة', district: 'شرق القاهرة' },
      { id: 5, name_arabic: 'الشيخ زايد', name_english: 'Sheikh Zayed', city: 'الجيزة', district: 'غرب القاهرة' },
      { id: 6, name_arabic: '6 أكتوبر', name_english: '6th of October', city: 'الجيزة', district: 'غرب القاهرة' },
      { id: 7, name_arabic: 'الحي العاشر', name_english: '10th District', city: 'الجيزة', district: 'غرب القاهرة' },
      { id: 8, name_arabic: 'المهندسين', name_english: 'Mohandessin', city: 'الجيزة', district: 'غرب القاهرة' },
      { id: 9, name_arabic: 'مصر الجديدة', name_english: 'Heliopolis', city: 'القاهرة', district: 'شرق القاهرة' },
      { id: 10, name_arabic: 'العاصمة الإدارية', name_english: 'New Administrative Capital', city: 'العاصمة الإدارية', district: 'شرق القاهرة' }
    ];
    writeJSONFile(DB_FILES.areas, areas);
  }
  
  // Phone Operators
  let phoneOperators = readJSONFile(DB_FILES.phone_operators);
  if (phoneOperators.length === 0) {
    phoneOperators = [
      { code: '010', name_arabic: 'فودافون', name_english: 'Vodafone', is_active: true },
      { code: '011', name_arabic: 'اتصالات', name_english: 'Etisalat', is_active: true },
      { code: '012', name_arabic: 'اورنج', name_english: 'Orange', is_active: true },
      { code: '015', name_arabic: 'وي', name_english: 'WE', is_active: true }
    ];
    writeJSONFile(DB_FILES.phone_operators, phoneOperators);
  }
  
  // Users
  let users = readJSONFile(DB_FILES.users);
  if (users.length === 0) {
    users = [
      {
        id: 1,
        username: 'xinreal',
        password: 'zerocall',
        email: 'admin@realestate.com',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];
    writeJSONFile(DB_FILES.users, users);
  }
  
  // Agents
  let agents = readJSONFile(DB_FILES.agents);
  if (agents.length === 0) {
    agents = [
      { id: 1, name: 'أحمد السمسار', phone: '01234567890', phone_operator: '012', company_name: 'مكتب أحمد للعقارات', specialization: 'عقارات سكنية وتجارية', years_experience: 8, description: 'سمسار عقاري محترف متخصص في العقارات السكنية والتجارية', is_active: true },
      { id: 2, name: 'محمد العقاري', phone: '01123456789', phone_operator: '011', company_name: 'شركة محمد للتطوير العقاري', specialization: 'فيلل ومشاريع سكنية', years_experience: 12, description: 'خبرة أكثر من 10 سنوات في السوق العقاري المصري', is_active: true },
      { id: 3, name: 'سارة للعقارات', phone: '01012345678', phone_operator: '010', company_name: 'مؤسسة سارة للاستثمار العقاري', specialization: 'أراضي واستثمار عقاري', years_experience: 6, description: 'وكيل عقاري معتمد ومتخصص في الاستثمار العقاري', is_active: true },
      { id: 4, name: 'عمرو المطور', phone: '01534567890', phone_operator: '015', company_name: 'شركة المستقبل للتطوير', specialization: 'مشاريع تجارية وإدارية', years_experience: 15, description: 'مطور عقاري ومستشار في شراء وبيع العقارات', is_active: true },
      { id: 5, name: 'فاطمة الوسطاء', phone: '01098765432', phone_operator: '010', company_name: 'مكتب الثقة للعقارات', specialization: 'شقق وفيلل للإيجار', years_experience: 5, description: 'سمسار معتمد لدى الشهر العقاري والتطوير العمراني', is_active: true }
    ];
    writeJSONFile(DB_FILES.agents, agents);
  }
  
  // Initialize empty arrays for other tables
  if (!fs.existsSync(DB_FILES.properties)) {
    writeJSONFile(DB_FILES.properties, []);
  }
  
  if (!fs.existsSync(DB_FILES.chat_messages)) {
    writeJSONFile(DB_FILES.chat_messages, []);
  }
  
  console.log(`✅ Relational database initialized!`);
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   🏢 Agents: ${agents.length}`);
  console.log(`   🏠 Property Types: ${propertyTypes.length}`);
  console.log(`   📍 Areas: ${areas.length}`);
  console.log(`   📱 Phone Operators: ${phoneOperators.length}`);
};

// Helper function to find related data
const findById = (tableName, id) => {
  const data = readJSONFile(DB_FILES[tableName]);
  return data.find(item => item.id === parseInt(id));
};

const findByField = (tableName, field, value) => {
  const data = readJSONFile(DB_FILES[tableName]);
  return data.find(item => item[field] === value);
};

const getNextId = (tableName) => {
  const data = readJSONFile(DB_FILES[tableName]);
  return data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
};

// Initialize database
initializeDatabase();

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    const users = readJSONFile(DB_FILES.users);
    const user = users.find(u => u.username === username && u.password === password && u.is_active);
    
    if (user) {
      // Update last login
      user.last_login = new Date().toISOString();
      writeJSONFile(DB_FILES.users, users);
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role 
        } 
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get messages (with relationships) - for backward compatibility
app.get('/api/messages', (req, res) => {
  const { search, property_type, limit = 100 } = req.query;
  
  try {
    let messages = readJSONFile(DB_FILES.chat_messages);
    const agents = readJSONFile(DB_FILES.agents);
    const properties = readJSONFile(DB_FILES.properties);
    const propertyTypes = readJSONFile(DB_FILES.property_types);
    const areas = readJSONFile(DB_FILES.areas);
    
    // Join with related data
    const enrichedMessages = messages.map(msg => {
      const agent = agents.find(a => a.id === msg.agent_id);
      const property = properties.find(p => p.id === msg.property_id);
      const propertyType = property ? propertyTypes.find(pt => pt.id === property.property_type_id) : null;
      const area = property ? areas.find(a => a.id === property.area_id) : null;
      
      return {
        id: msg.id,
        sender: agent ? agent.name : msg.sender_name || 'مجهول',
        message: msg.message_text,
        timestamp: new Date(msg.message_date || msg.created_at).toLocaleString('ar-EG'),
        property_type: propertyType ? propertyType.type_code : 'other',
        keywords: msg.keywords || '',
        location: area ? area.name_arabic : msg.extracted_location || '',
        price: property ? property.price_text : msg.extracted_price || '',
        agent_phone: agent ? agent.phone : '',
        agent_description: agent ? agent.description : '',
        full_description: property ? property.description : msg.message_text
      };
    });
    
    // Apply filters
    let filteredMessages = enrichedMessages;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredMessages = filteredMessages.filter(msg => 
        msg.message.toLowerCase().includes(searchLower) ||
        msg.keywords.toLowerCase().includes(searchLower) ||
        msg.location.toLowerCase().includes(searchLower) ||
        msg.sender.toLowerCase().includes(searchLower)
      );
    }
    
    if (property_type && property_type !== 'all') {
      filteredMessages = filteredMessages.filter(msg => msg.property_type === property_type);
    }
    
    // Sort and limit
    filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    filteredMessages = filteredMessages.slice(0, parseInt(limit));
    
    res.json({ success: true, messages: filteredMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Bulk import WhatsApp messages (enhanced with relationships)
app.post('/api/messages/bulk', (req, res) => {
  const { messages: messagesToImport } = req.body;
  
  if (!Array.isArray(messagesToImport)) {
    return res.status(400).json({ success: false, message: 'Messages must be an array' });
  }
  
  try {
    let chatMessages = readJSONFile(DB_FILES.chat_messages);
    let agents = readJSONFile(DB_FILES.agents);
    let properties = readJSONFile(DB_FILES.properties);
    const propertyTypes = readJSONFile(DB_FILES.property_types);
    const areas = readJSONFile(DB_FILES.areas);
    
    let importedCount = 0;
    let skippedCount = 0;
    let propertyCount = 0;
    let newAgentCount = 0;
    
    for (const messageData of messagesToImport) {
      try {
        // Check for duplicates
        const existing = chatMessages.find(msg => 
          msg.message_text === messageData.message && msg.sender_name === messageData.sender
        );
        
        if (existing) {
          skippedCount++;
          continue;
        }
        
        // Process message content
        const extracted = processWhatsAppMessage(messageData.message, messageData.sender);
        
        // Find or create agent
        let agentId = null;
        if (messageData.agent_phone) {
          const phoneOperator = extractPhoneOperator(messageData.agent_phone);
          
          // Validate phone operator
          if (!phoneOperator) {
            console.log(`⚠️ Invalid phone number format: ${messageData.agent_phone} (must start with 010, 011, 012, or 015)`);
          }
          
          // Check if agent exists
          let agent = agents.find(a => a.phone === messageData.agent_phone);
          
          if (!agent) {
            // Create new agent
            const newAgentId = getNextId('agents');
            agent = {
              id: newAgentId,
              name: messageData.sender,
              phone: messageData.agent_phone,
              phone_operator: phoneOperator,
              company_name: `مكتب ${messageData.sender}`,
              specialization: 'عقارات متنوعة',
              years_experience: 0,
              description: messageData.agent_description || `سمسار عقاري - ${messageData.sender}`,
              is_active: true,
              created_at: new Date().toISOString()
            };
            agents.push(agent);
            newAgentCount++;
          }
          agentId = agent.id;
        }
        
        // Find area
        let areaId = null;
        if (extracted.area_name) {
          const area = areas.find(a => 
            a.name_arabic.includes(extracted.area_name) || 
            extracted.area_name.includes(a.name_arabic)
          );
          if (area) areaId = area.id;
        }
        
        // Find property type
        let propertyTypeId = null;
        if (extracted.property_type) {
          const propertyType = propertyTypes.find(pt => pt.type_code === extracted.property_type);
          if (propertyType) propertyTypeId = propertyType.id;
        }
        
        // Insert chat message
        const messageId = getNextId('chat_messages');
        const newMessage = {
          id: messageId,
          agent_id: agentId,
          property_id: null, // Will be set if property is created
          sender_name: messageData.sender,
          message_text: messageData.message,
          message_date: messageData.timestamp,
          extracted_price: extracted.price,
          extracted_area_size: extracted.area_size,
          extracted_location: extracted.area_name,
          keywords: messageData.keywords || '',
          is_processed: true,
          confidence_score: 0.8,
          created_at: new Date().toISOString()
        };
        
        chatMessages.push(newMessage);
        
        // If enough data extracted, create property
        if (propertyTypeId && agentId && (extracted.price || extracted.area_size)) {
          const propertyId = getNextId('properties');
          const newProperty = {
            id: propertyId,
            agent_id: agentId,
            property_type_id: propertyTypeId,
            area_id: areaId,
            title: messageData.message.substring(0, 100),
            description: messageData.message,
            price: null, // Could parse price to number
            price_text: extracted.price,
            currency: 'EGP',
            transaction_type: messageData.message.includes('للإيجار') ? 'للإيجار' : 'للبيع',
            area_size: extracted.area_size,
            rooms: extracted.rooms,
            has_elevator: extracted.features.includes('has_elevator'),
            has_garage: extracted.features.includes('has_garage'),
            has_garden: extracted.features.includes('has_garden'),
            has_pool: extracted.features.includes('has_pool'),
            is_main_street: extracted.features.includes('is_main_street'),
            is_available: true,
            is_featured: false,
            views_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          properties.push(newProperty);
          
          // Link message to property
          newMessage.property_id = propertyId;
          propertyCount++;
        }
        
        importedCount++;
        
      } catch (err) {
        console.error('Error importing individual message:', err);
        skippedCount++;
      }
    }
    
    // Save all updated data
    writeJSONFile(DB_FILES.chat_messages, chatMessages);
    writeJSONFile(DB_FILES.agents, agents);
    writeJSONFile(DB_FILES.properties, properties);
    
    console.log(`📥 Bulk import complete: ${importedCount} imported, ${skippedCount} skipped, ${propertyCount} properties created, ${newAgentCount} new agents`);
    
    res.json({ 
      success: true, 
      imported: importedCount,
      total: messagesToImport.length,
      skipped: skippedCount,
      propertyMessages: propertyCount,
      newAgents: newAgentCount
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ success: false, message: 'Database error during bulk import' });
  }
});

// Get property type statistics
app.get('/api/stats', (req, res) => {
  try {
    const properties = readJSONFile(DB_FILES.properties);
    const propertyTypes = readJSONFile(DB_FILES.property_types);
    
    const stats = propertyTypes.map(pt => {
      const count = properties.filter(p => p.property_type_id === pt.id && p.is_available).length;
      return {
        property_type: pt.type_code,
        count: count
      };
    });
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get areas list
app.get('/api/areas', (req, res) => {
  try {
    const areas = readJSONFile(DB_FILES.areas);
    res.json({ success: true, areas });
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get agents list with statistics
app.get('/api/agents', (req, res) => {
  try {
    const agents = readJSONFile(DB_FILES.agents);
    const properties = readJSONFile(DB_FILES.properties);
    const phoneOperators = readJSONFile(DB_FILES.phone_operators);
    
    const enrichedAgents = agents.filter(agent => agent.is_active).map(agent => {
      const agentProperties = properties.filter(p => p.agent_id === agent.id && p.is_available);
      const operator = phoneOperators.find(op => op.code === agent.phone_operator);
      
      return {
        ...agent,
        properties_count: agentProperties.length,
        avg_price: agentProperties.length > 0 ? 
          agentProperties.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0) / agentProperties.length : 0,
        operator_name: operator ? operator.name_arabic : agent.phone_operator
      };
    });
    
    res.json({ success: true, agents: enrichedAgents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get message by ID
app.get('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const messages = readJSONFile(DB_FILES.chat_messages);
    const agents = readJSONFile(DB_FILES.agents);
    const properties = readJSONFile(DB_FILES.properties);
    const propertyTypes = readJSONFile(DB_FILES.property_types);
    const areas = readJSONFile(DB_FILES.areas);
    
    const message = messages.find(msg => msg.id === parseInt(id));
    
    if (message) {
      const agent = agents.find(a => a.id === message.agent_id);
      const property = properties.find(p => p.id === message.property_id);
      const propertyType = property ? propertyTypes.find(pt => pt.id === property.property_type_id) : null;
      const area = property ? areas.find(a => a.id === property.area_id) : null;
      
      const formattedMessage = {
        id: message.id,
        sender: agent ? agent.name : message.sender_name || 'مجهول',
        message: message.message_text,
        timestamp: new Date(message.message_date || message.created_at).toLocaleString('ar-EG'),
        property_type: propertyType ? propertyType.type_code : 'other',
        keywords: message.keywords || '',
        location: area ? area.name_arabic : message.extracted_location || '',
        price: property ? property.price_text : message.extracted_price || '',
        agent_phone: agent ? agent.phone : '',
        agent_description: agent ? agent.description : '',
        full_description: property ? property.description : message.message_text
      };
      
      res.json({ success: true, message: formattedMessage });
    } else {
      res.status(404).json({ success: false, message: 'Message not found' });
    }
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Health check with comprehensive database info
app.get('/api/health', (req, res) => {
  try {
    const stats = {
      users: readJSONFile(DB_FILES.users).length,
      agents: readJSONFile(DB_FILES.agents).filter(a => a.is_active).length,
      properties: readJSONFile(DB_FILES.properties).filter(p => p.is_available).length,
      messages: readJSONFile(DB_FILES.chat_messages).length,
      areas: readJSONFile(DB_FILES.areas).length,
      property_types: readJSONFile(DB_FILES.property_types).filter(pt => pt.is_active).length,
      phone_operators: readJSONFile(DB_FILES.phone_operators).filter(po => po.is_active).length
    };
    
    res.json({ 
      success: true, 
      message: 'Real Estate API v2.0 is running', 
      database: 'JSON-based relational structure',
      version: '2.0',
      features: [
        'Relational data structure',
        'Egyptian phone operators (010, 011, 012, 015)',
        'Enhanced property classification',
        'Area and agent management',
        'Property relationship mapping'
      ],
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Health check failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Real Estate Chat API v2.0 running on http://localhost:${PORT}`);
  console.log(`📦 Database files: ${dbDir}`);
  console.log(`🔍 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`💾 Using JSON-based relational structure`);
  console.log(`📱 Egyptian phone operators: 010 (Vodafone), 011 (Etisalat), 012 (Orange), 015 (WE)`);
  console.log(`🏠 Enhanced property classification and area management`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down gracefully...');
  console.log('✅ Server closed.');
  process.exit(0);
});
