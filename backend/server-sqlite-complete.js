const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Try to import better-sqlite3, fallback to JSON if it fails
let Database;
let USE_SQLITE = false;

try {
  Database = require('better-sqlite3');
  USE_SQLITE = true;
  console.log('✅ Using SQLite database');
} catch (error) {
  console.log('⚠️  SQLite not available, falling back to JSON files');
  console.log('   To use SQLite, install: npm install better-sqlite3');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

// Initialize database
const initializeDatabase = () => {
  if (USE_SQLITE) {
    return initializeSQLiteDatabase();
  } else {
    return initializeJSONDatabase();
  }
};

// SQLite Database Implementation
const initializeSQLiteDatabase = () => {
  console.log('🔧 Initializing SQLite database...');
  
  try {
    db = new Database(path.join(dbDir, 'real_estate.db'));
    db.pragma('foreign_keys = ON');
    
    // Execute schema
    const schemaPath = path.join(dbDir, 'schema_relational.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📋 Creating database schema...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
      
      statements.forEach(statement => {
        try {
          db.exec(statement);
        } catch (err) {
          if (!err.message.includes('already exists') && !err.message.includes('UNIQUE constraint')) {
            console.error('Error executing statement:', statement.substring(0, 100) + '...');
            console.error(err.message);
          }
        }
      });
    }
    
    // Execute initial data
    const dataPath = path.join(dbDir, 'initial_data_relational.sql');
    if (fs.existsSync(dataPath)) {
      console.log('📊 Inserting initial data...');
      const data = fs.readFileSync(dataPath, 'utf8');
      
      const statements = data.split(';').filter(stmt => stmt.trim().length > 0);
      
      statements.forEach(statement => {
        try {
          db.exec(statement);
        } catch (err) {
          if (!err.message.includes('UNIQUE constraint')) {
            console.error('Error executing data statement:', err.message);
          }
        }
      });
    }
    
    // Get counts
    try {
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
      const agentCount = db.prepare('SELECT COUNT(*) as count FROM agents').get().count;
      const propertyTypeCount = db.prepare('SELECT COUNT(*) as count FROM property_types').get().count;
      const areaCount = db.prepare('SELECT COUNT(*) as count FROM areas').get().count;
      
      console.log(`✅ SQLite Database initialized successfully!`);
      console.log(`   👥 Users: ${userCount}`);
      console.log(`   🏢 Agents: ${agentCount}`);
      console.log(`   🏠 Property Types: ${propertyTypeCount}`);
      console.log(`   📍 Areas: ${areaCount}`);
    } catch (err) {
      console.log('📊 Database schema created, initial data may be empty');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize SQLite:', error.message);
    USE_SQLITE = false;
    return initializeJSONDatabase();
  }
};

// JSON Database Implementation (fallback)
const DB_FILES = {
  users: path.join(dbDir, 'users.json'),
  agents: path.join(dbDir, 'agents.json'),
  areas: path.join(dbDir, 'areas.json'),
  property_types: path.join(dbDir, 'property_types.json'),
  properties: path.join(dbDir, 'properties.json'),
  chat_messages: path.join(dbDir, 'chat_messages.json'),
  phone_operators: path.join(dbDir, 'phone_operators.json')
};

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

const initializeJSONDatabase = () => {
  console.log('🔧 Initializing JSON database...');
  
  // Initialize basic data structure
  const initialData = {
    users: [
      { id: 1, username: 'xinreal', password: 'zerocall', role: 'admin', created_at: new Date().toISOString() }
    ],
    phone_operators: [
      { id: 1, prefix: '010', name_english: 'Vodafone', name_arabic: 'فودافون', is_active: true },
      { id: 2, prefix: '011', name_english: 'Etisalat', name_arabic: 'اتصالات', is_active: true },
      { id: 3, prefix: '012', name_english: 'Orange', name_arabic: 'أورانج', is_active: true },
      { id: 4, prefix: '015', name_english: 'WE', name_arabic: 'المصرية للاتصالات', is_active: true }
    ],
    areas: [
      { id: 1, name_arabic: 'التجمع الخامس', name_english: 'New Cairo', governorate: 'القاهرة', is_active: true },
      { id: 2, name_arabic: 'المعادي', name_english: 'Maadi', governorate: 'القاهرة', is_active: true },
      { id: 3, name_arabic: 'الزمالك', name_english: 'Zamalek', governorate: 'القاهرة', is_active: true },
      { id: 4, name_arabic: 'الشيخ زايد', name_english: 'Sheikh Zayed', governorate: 'الجيزة', is_active: true }
    ],
    property_types: [
      { id: 1, type_code: 'apartment', name_arabic: 'شقة', name_english: 'Apartment', is_active: true },
      { id: 2, type_code: 'villa', name_arabic: 'فيلا', name_english: 'Villa', is_active: true },
      { id: 3, type_code: 'land', name_arabic: 'أرض', name_english: 'Land', is_active: true },
      { id: 4, type_code: 'office', name_arabic: 'مكتب', name_english: 'Office', is_active: true }
    ],
    agents: [],
    properties: [],
    chat_messages: []
  };
  
  // Create files if they don't exist
  Object.keys(initialData).forEach(key => {
    const filePath = DB_FILES[key];
    if (!fs.existsSync(filePath)) {
      writeJSONFile(filePath, initialData[key]);
    }
  });
  
  console.log(`✅ JSON Database initialized successfully!`);
  console.log(`   📁 Files: ${Object.keys(DB_FILES).length}`);
  console.log(`   👥 Users: ${readJSONFile(DB_FILES.users).length}`);
  console.log(`   📱 Phone Operators: ${readJSONFile(DB_FILES.phone_operators).length}`);
  console.log(`   📍 Areas: ${readJSONFile(DB_FILES.areas).length}`);
  console.log(`   🏠 Property Types: ${readJSONFile(DB_FILES.property_types).length}`);
  
  return true;
};

// Common utility functions
const validateEgyptianPhone = (phone) => {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  // Handle international format (+20 prefix) and local format
  if (cleanPhone.startsWith('20')) {
    // International format: +20 10XXXXXXXX -> 010XXXXXXXX
    return /^20(010|011|012|015)\d{8}$/.test(cleanPhone);
  }
  // Local format: 010XXXXXXXX
  return /^(010|011|012|015)\d{8}$/.test(cleanPhone);
};

const normalizePhoneNumber = (phone) => {
  if (!phone) return null;
  
  // Extract all digits
  const allDigits = phone.replace(/[^\d]/g, '');
  
  // Handle international format (+20 prefix)
  if (allDigits.startsWith('20')) {
    if (allDigits.length === 13) {
      // +20 10XXXXXXXX -> 010XXXXXXXX
      return allDigits.substring(2);
    } else if (allDigits.length === 12) {
      // +20 1XXXXXXXX -> 01XXXXXXXX (missing leading zero)
      return '0' + allDigits.substring(2);
    }
  }
  
  // Handle local format
  if (allDigits.length === 11 && /^(010|011|012|015)/.test(allDigits)) {
    return allDigits;
  }
  
  // Handle 10-digit format (missing leading zero)
  if (allDigits.length === 10 && /^(10|11|12|15)/.test(allDigits)) {
    return '0' + allDigits;
  }
  
  return null;
};

const getPhoneCarrier = (phone) => {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return null;
  
  const carriers = {
    '010': 'فودافون',
    '011': 'اتصالات', 
    '012': 'أورانج',
    '015': 'المصرية للاتصالات'
  };
  
  const prefix = normalizedPhone.substring(0, 3);
  return carriers[prefix] || null;
};

const extractPropertyDetails = (messageText) => {
  const extractedData = {
    property_type: null,
    area_name: null,
    price: null,
    area_size: null,
    rooms: null,
    bathrooms: null,
    features: []
  };
  
  const text = messageText.toLowerCase();
  
  // Property type detection
  const propertyTypes = {
    'apartment': ['شقة', 'شقق', 'دور', 'أدوار', 'طابق', 'غرفة', 'غرف'],
    'villa': ['فيلا', 'فيلات', 'قصر', 'قصور', 'بيت', 'بيوت', 'منزل', 'منازل', 'دوبلكس'],
    'land': ['أرض', 'أراضي', 'قطعة', 'قطع', 'مساحة', 'فدان'],
    'office': ['مكتب', 'مكاتب', 'إداري', 'تجاري', 'محل', 'محلات'],
    'warehouse': ['مخزن', 'مخازن', 'مستودع', 'مستودعات', 'ورشة']
  };
  
  for (const [type, keywords] of Object.entries(propertyTypes)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      extractedData.property_type = type;
      break;
    }
  }
  
  // Area extraction
  const areaPatterns = [
    /في\s+([^،\s]+(?:\s+[^،\s]+)*)/g,
    /بـ\s*([^،\s]+(?:\s+[^،\s]+)*)/g,
    /منطقة\s+([^،\s]+(?:\s+[^،\s]+)*)/g
  ];
  
  for (const pattern of areaPatterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      extractedData.area_name = matches[0][1].trim();
      break;
    }
  }
  
  // Price extraction
  const pricePattern = /(\d+(?:\.\d+)?)\s*(ألف|مليون|k|m)?\s*(جنيه|ريال|درهم|دولار)?/g;
  const priceMatches = [...text.matchAll(pricePattern)];
  if (priceMatches.length > 0) {
    extractedData.price = priceMatches[0][0];
  }
  
  // Area size extraction
  const sizePattern = /(\d+)\s*متر/g;
  const sizeMatches = [...text.matchAll(sizePattern)];
  if (sizeMatches.length > 0) {
    extractedData.area_size = parseInt(sizeMatches[0][1]);
  }
  
  // Rooms extraction
  const roomsPattern = /(\d+)\s*(غرفة|غرف|حجرة|حجر)/g;
  const roomsMatches = [...text.matchAll(roomsPattern)];
  if (roomsMatches.length > 0) {
    extractedData.rooms = parseInt(roomsMatches[0][1]);
  }
  
  // Bathrooms extraction
  const bathroomsPattern = /(\d+)\s*(حمام|حمامات|دورة|دورات)/g;
  const bathroomsMatches = [...text.matchAll(bathroomsPattern)];
  if (bathroomsMatches.length > 0) {
    extractedData.bathrooms = parseInt(bathroomsMatches[0][1]);
  }
  
  // Features extraction
  const features = [];
  const featureKeywords = {
    'مفروش': 'furnished',
    'بحري': 'sea_view',
    'قبلي': 'south_facing',
    'مطبخ': 'kitchen',
    'بلكونة': 'balcony',
    'جراج': 'garage',
    'مصعد': 'elevator',
    'امن': 'security',
    'حديقة': 'garden'
  };
  
  Object.keys(featureKeywords).forEach(keyword => {
    if (text.includes(keyword)) {
      features.push(featureKeywords[keyword]);
    }
  });
  
  extractedData.features = features;
  
  return extractedData;
};

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    let user = null;
    
    if (USE_SQLITE) {
      const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
      user = stmt.get(username, password);
    } else {
      const users = readJSONFile(DB_FILES.users);
      user = users.find(u => u.username === username && u.password === password);
    }
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        success: true, 
        message: 'تم تسجيل الدخول بنجاح',
        user: userWithoutPassword,
        token: `token_${user.id}_${Date.now()}`
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Messages endpoints
app.get('/api/messages', (req, res) => {
  const { search, propertyType, page = 1, limit = 10 } = req.query;
  
  try {
    let messages = [];
    
    if (USE_SQLITE) {
      let query = `
        SELECT 
          cm.*,
          a.name as agent_name,
          a.phone as agent_phone,
          a.description as agent_description,
          pt.name_arabic as property_type_name,
          ar.name_arabic as area_name,
          p.price_text,
          cm.message as property_description
        FROM chat_messages cm
        LEFT JOIN agents a ON cm.agent_id = a.id
        LEFT JOIN properties p ON cm.id = p.message_id
        LEFT JOIN property_types pt ON cm.property_type_id = pt.id
        LEFT JOIN areas ar ON cm.area_id = ar.id
        WHERE 1=1
      `;
      const params = [];
      
      if (search) {
        query += ' AND (cm.message LIKE ? OR a.name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }
      
      if (propertyType && propertyType !== 'all') {
        query += ' AND pt.code = ?';
        params.push(propertyType);
      }
      
      query += ' ORDER BY cm.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      
      const stmt = db.prepare(query);
      messages = stmt.all(...params);
      
    } else {
      messages = readJSONFile(DB_FILES.chat_messages);
      const agents = readJSONFile(DB_FILES.agents);
      const properties = readJSONFile(DB_FILES.properties);
      const propertyTypes = readJSONFile(DB_FILES.property_types);
      const areas = readJSONFile(DB_FILES.areas);
      
      // Apply filters
      if (search) {
        const searchLower = search.toLowerCase();
        messages = messages.filter(msg => 
          msg.message_text.toLowerCase().includes(searchLower) ||
          (msg.keywords && msg.keywords.toLowerCase().includes(searchLower))
        );
      }
      
      if (propertyType && propertyType !== 'all') {
        messages = messages.filter(msg => {
          const property = properties.find(p => p.id === msg.property_id);
          if (property) {
            const pType = propertyTypes.find(pt => pt.id === property.property_type_id);
            return pType && pType.type_code === propertyType;
          }
          return false;
        });
      }
      
      // Enrich with related data
      messages = messages.map(msg => {
        const agent = agents.find(a => a.id === msg.agent_id);
        const property = properties.find(p => p.id === msg.property_id);
        const propertyType = property ? propertyTypes.find(pt => pt.id === property.property_type_id) : null;
        const area = property ? areas.find(a => a.id === property.area_id) : null;
        
        return {
          ...msg,
          agent_name: agent ? agent.name : 'مجهول',
          agent_phone: agent ? agent.phone : '',
          agent_description: agent ? agent.description : '',
          property_type_name: propertyType ? propertyType.name_arabic : '',
          area_name: area ? area.name_arabic : '',
          price_text: property ? property.price_text : '',
          property_description: property ? property.description : ''
        };
      });
      
      // Pagination
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      messages = messages.slice(startIndex, startIndex + parseInt(limit));
    }
    
    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.agent_name || msg.sender_name || 'مجهول',
      message: msg.message,
      timestamp: new Date(msg.timestamp || msg.created_at).toLocaleString('ar-EG'),
      property_type: msg.property_type_name ? 'apartment' : 'other', // Default mapping
      keywords: msg.keywords || '',
      location: msg.area_name || '',
      price: msg.price_text || '',
      agent_phone: msg.agent_phone || '',
      agent_description: msg.agent_description || '',
      full_description: msg.property_description || msg.message
    }));
    
    res.json({ success: true, messages: formattedMessages });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Bulk import messages (alias for frontend compatibility)
app.post('/api/messages/bulk', (req, res) => {
  const { messages } = req.body;
  
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid messages data' });
  }
  
  try {
    let importedCount = 0;
    let skippedCount = 0;
    
    messages.forEach(messageData => {
      const { sender, message, timestamp } = messageData;
      
      if (!sender || !message) {
        skippedCount++;
        return;
      }
      
      // Extract property details
      const extracted = extractPropertyDetails(message);
      
      // Create or find agent
      let agentId = null;
      // Extract phone number - handle both international (+20 10XXXXXXXX) and local formats
      const phoneMatch = sender.match(/(\+?20\s*)?(\d{2,3})\s*(\d{8})/);
      const rawPhone = phoneMatch ? phoneMatch[0] : null;
      const phone = normalizePhoneNumber(rawPhone || sender);
      
      if (phone && validateEgyptianPhone(phone)) {
        if (USE_SQLITE) {
          let stmt = db.prepare('SELECT id FROM agents WHERE phone = ?');
          let agent = stmt.get(phone);
          
          if (!agent) {
            stmt = db.prepare(`
              INSERT INTO agents (name, phone, phone_operator, description, created_at)
              VALUES (?, ?, ?, ?, ?)
            `);
            const result = stmt.run(
              sender,
              phone,
              getPhoneCarrier(phone),
              `مستورد من واتساب`,
              new Date().toISOString()
            );
            agentId = result.lastInsertRowid;
          } else {
            agentId = agent.id;
          }
          
        } else {
          const agents = readJSONFile(DB_FILES.agents);
          let agent = agents.find(a => a.phone === phone);
          
          if (!agent) {
            agentId = agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1;
            const newAgent = {
              id: agentId,
              name: sender,
              phone: phone,
              phone_operator: getPhoneCarrier(phone),
              description: 'مستورد من واتساب',
              created_at: new Date().toISOString()
            };
            agents.push(newAgent);
            writeJSONFile(DB_FILES.agents, agents);
          } else {
            agentId = agent.id;
          }
        }
      }
      
      // Get property type and area IDs
      let propertyTypeId = null;
      let areaId = null;
      
      if (USE_SQLITE) {
        if (extracted.property_type) {
          const stmt = db.prepare('SELECT id FROM property_types WHERE code = ?');
          const pType = stmt.get(extracted.property_type);
          propertyTypeId = pType ? pType.id : null;
        }
        
        if (extracted.area_name) {
          const stmt = db.prepare('SELECT id FROM areas WHERE name_arabic LIKE ?');
          const area = stmt.get(`%${extracted.area_name}%`);
          areaId = area ? area.id : null;
        }
        
        // Insert chat message
        const stmt = db.prepare(`
          INSERT INTO chat_messages (agent_id, property_type_id, area_id, message, timestamp, sender_name, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
          agentId,
          propertyTypeId,
          areaId,
          message,
          timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
          sender,
          new Date().toISOString()
        );
        
        // Create property record if we have property details
        if (propertyTypeId && (extracted.price || extracted.area_size || extracted.rooms)) {
          const propStmt = db.prepare(`
            INSERT INTO properties (message_id, agent_id, property_type_id, area_id, price_text, area_size, rooms, bathrooms, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          propStmt.run(
            result.lastInsertRowid,
            agentId,
            propertyTypeId,
            areaId,
            extracted.price || '',
            extracted.area_size,
            extracted.rooms,
            extracted.bathrooms,
            new Date().toISOString()
          );
        }
        
      } else {
        // JSON fallback implementation
        const chatMessages = readJSONFile(DB_FILES.chat_messages);
        const newMessageId = chatMessages.length > 0 ? Math.max(...chatMessages.map(m => m.id)) + 1 : 1;
        
        const newMessage = {
          id: newMessageId,
          agent_id: agentId,
          message_text: message,
          message_date: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
          sender_name: sender,
          keywords: Object.values(extracted).filter(v => v && typeof v === 'string').join(', '),
          extracted_property_type: extracted.property_type,
          extracted_location: extracted.area_name,
          extracted_price: extracted.price,
          created_at: new Date().toISOString()
        };
        
        chatMessages.push(newMessage);
        writeJSONFile(DB_FILES.chat_messages, chatMessages);
      }
      
      importedCount++;
    });
    
    res.json({ 
      success: true, 
      message: `تم استيراد ${importedCount} رسالة بنجاح`,
      imported: importedCount,
      skipped: skippedCount
    });
    
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ success: false, message: 'خطأ في استيراد الرسائل' });
  }
});

// Import messages
app.post('/api/messages/import', (req, res) => {
  const { messages } = req.body;
  
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ success: false, message: 'Invalid messages data' });
  }
  
  try {
    let importedCount = 0;
    
    messages.forEach(messageData => {
      const { sender, message, timestamp } = messageData;
      
      if (!sender || !message) {
        return;
      }
      
      // Extract property details
      const extracted = extractPropertyDetails(message);
      
      // Create or find agent
      let agentId = null;
      // Extract phone number - handle both international (+20 10XXXXXXXX) and local formats
      const phoneMatch = sender.match(/(\+?20\s*)?(\d{2,3})\s*(\d{8})/);
      const rawPhone = phoneMatch ? phoneMatch[0] : null;
      const phone = normalizePhoneNumber(rawPhone || sender);
      
      if (phone && validateEgyptianPhone(phone)) {
        if (USE_SQLITE) {
          let stmt = db.prepare('SELECT id FROM agents WHERE phone = ?');
          let agent = stmt.get(phone);
          
          if (!agent) {
            stmt = db.prepare(`
              INSERT INTO agents (name, phone, phone_operator, description, is_active, created_at)
              VALUES (?, ?, ?, ?, ?, ?)
            `);
            const result = stmt.run(
              sender,
              phone,
              getPhoneCarrier(phone),
              `مستورد من واتساب`,
              1,
              new Date().toISOString()
            );
            agentId = result.lastInsertRowid;
          } else {
            agentId = agent.id;
          }
          
        } else {
          const agents = readJSONFile(DB_FILES.agents);
          let agent = agents.find(a => a.phone === phone);
          
          if (!agent) {
            agentId = agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1;
            const newAgent = {
              id: agentId,
              name: sender,
              phone: phone,
              phone_operator: getPhoneCarrier(phone),
              description: 'مستورد من واتساب',
              is_active: true,
              created_at: new Date().toISOString()
            };
            agents.push(newAgent);
            writeJSONFile(DB_FILES.agents, agents);
          } else {
            agentId = agent.id;
          }
        }
      }
      
      // Create property if needed
      let propertyId = null;
      if (extracted.property_type || extracted.area_name || extracted.price) {
        if (USE_SQLITE) {
          // Get property type id
          let propertyTypeId = null;
          if (extracted.property_type) {
            const stmt = db.prepare('SELECT id FROM property_types WHERE type_code = ?');
            const pType = stmt.get(extracted.property_type);
            propertyTypeId = pType ? pType.id : 1; // Default to apartment
          }
          
          // Get area id
          let areaId = null;
          if (extracted.area_name) {
            const stmt = db.prepare('SELECT id FROM areas WHERE name_arabic LIKE ?');
            const area = stmt.get(`%${extracted.area_name}%`);
            areaId = area ? area.id : 1; // Default to first area
          }
          
          const stmt = db.prepare(`
            INSERT INTO properties (property_type_id, area_id, price_text, area_size, rooms, bathrooms, description, is_available, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          const result = stmt.run(
            propertyTypeId || 1,
            areaId || 1,
            extracted.price || '',
            extracted.area_size,
            extracted.rooms,
            extracted.bathrooms,
            message,
            1,
            new Date().toISOString()
          );
          propertyId = result.lastInsertRowid;
          
        } else {
          const properties = readJSONFile(DB_FILES.properties);
          const propertyTypes = readJSONFile(DB_FILES.property_types);
          const areas = readJSONFile(DB_FILES.areas);
          
          let propertyTypeId = 1;
          if (extracted.property_type) {
            const pType = propertyTypes.find(pt => pt.type_code === extracted.property_type);
            propertyTypeId = pType ? pType.id : 1;
          }
          
          let areaId = 1;
          if (extracted.area_name) {
            const area = areas.find(a => a.name_arabic.includes(extracted.area_name));
            areaId = area ? area.id : 1;
          }
          
          propertyId = properties.length > 0 ? Math.max(...properties.map(p => p.id)) + 1 : 1;
          const newProperty = {
            id: propertyId,
            property_type_id: propertyTypeId,
            area_id: areaId,
            price_text: extracted.price || '',
            area_size: extracted.area_size,
            rooms: extracted.rooms,
            bathrooms: extracted.bathrooms,
            description: message,
            is_available: true,
            created_at: new Date().toISOString()
          };
          properties.push(newProperty);
          writeJSONFile(DB_FILES.properties, properties);
        }
      }
      
      // Insert chat message
      if (USE_SQLITE) {          const stmt = db.prepare(`
            INSERT INTO chat_messages (agent_id, property_type_id, area_id, message, timestamp, sender_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          const result = stmt.run(
            agentId,
            propertyTypeId || null,
            areaId || null,
            message,
            timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
            sender,
            new Date().toISOString()
          );
          
          // Create property record if we have property details
          if (propertyTypeId && (extracted.price || extracted.area_size || extracted.rooms)) {
            const propStmt = db.prepare(`
              INSERT INTO properties (message_id, agent_id, property_type_id, area_id, price_text, area_size, rooms, bathrooms, is_available, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            propStmt.run(
              result.lastInsertRowid,
              agentId,
              propertyTypeId,
              areaId || null,
              extracted.price || '',
              extracted.area_size,
              extracted.rooms,
              extracted.bathrooms,
              1,
              new Date().toISOString()
            );
          }
        
      } else {
        const chatMessages = readJSONFile(DB_FILES.chat_messages);
        const newMessageId = chatMessages.length > 0 ? Math.max(...chatMessages.map(m => m.id)) + 1 : 1;
        
        const newMessage = {
          id: newMessageId,
          agent_id: agentId,
          property_id: propertyId,
          message_text: message,
          message_date: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
          sender_name: sender,
          keywords: Object.values(extracted).filter(v => v && typeof v === 'string').join(', '),
          extracted_property_type: extracted.property_type,
          extracted_location: extracted.area_name,
          extracted_price: extracted.price,
          created_at: new Date().toISOString()
        };
        
        chatMessages.push(newMessage);
        writeJSONFile(DB_FILES.chat_messages, chatMessages);
      }
      
      importedCount++;
    });
    
    res.json({ 
      success: true, 
      message: `تم استيراد ${importedCount} رسالة بنجاح`,
      imported: importedCount
    });
    
  } catch (error) {
    console.error('Error importing messages:', error);
    res.status(500).json({ success: false, message: 'خطأ في استيراد الرسائل' });
  }
});

// Statistics
app.get('/api/statistics', (req, res) => {
  try {
    let stats = {};
    
    if (USE_SQLITE) {
      const totalMessages = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get().count;
      const totalAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get().count;
      const totalProperties = db.prepare('SELECT COUNT(*) as count FROM properties').get().count;
      
      const propertyTypes = db.prepare(`
        SELECT pt.name_arabic, COUNT(p.id) as count
        FROM property_types pt
        LEFT JOIN properties p ON pt.id = p.property_type_id
        GROUP BY pt.id, pt.name_arabic
      `).all();
      
      const areas = db.prepare(`
        SELECT ar.name_arabic, COUNT(p.id) as count
        FROM areas ar
        LEFT JOIN properties p ON ar.id = p.area_id
        GROUP BY ar.id, ar.name_arabic
        ORDER BY count DESC
        LIMIT 10
      `).all();
      
      stats = {
        total_messages: totalMessages,
        total_agents: totalAgents,
        total_properties: totalProperties,
        property_types: propertyTypes,
        top_areas: areas
      };
      
    } else {
      const messages = readJSONFile(DB_FILES.chat_messages);
      const agents = readJSONFile(DB_FILES.agents).filter(a => a.is_active);
      const properties = readJSONFile(DB_FILES.properties).filter(p => p.is_available);
      const propertyTypes = readJSONFile(DB_FILES.property_types).filter(pt => pt.is_active);
      const areas = readJSONFile(DB_FILES.areas).filter(a => a.is_active);
      
      // Count properties by type
      const propertyTypeCounts = propertyTypes.map(pt => ({
        name_arabic: pt.name_arabic,
        count: properties.filter(p => p.property_type_id === pt.id).length
      }));
      
      // Count properties by area
      const areaCounts = areas.map(area => ({
        name_arabic: area.name_arabic,
        count: properties.filter(p => p.area_id === area.id).length
      })).sort((a, b) => b.count - a.count).slice(0, 10);
      
      stats = {
        total_messages: messages.length,
        total_agents: agents.length,
        total_properties: properties.length,
        property_types: propertyTypeCounts,
        top_areas: areaCounts
      };
    }
    
    res.json({ success: true, stats });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get message by ID
app.get('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    let message = null;
    
    if (USE_SQLITE) {
      const stmt = db.prepare(`
        SELECT 
          cm.*,
          a.name as agent_name,
          a.phone as agent_phone,
          a.description as agent_description,
          pt.name_arabic as property_type_name,
          ar.name_arabic as area_name,
          p.price_text,
          cm.message as property_description
        FROM chat_messages cm
        LEFT JOIN agents a ON cm.agent_id = a.id
        LEFT JOIN properties p ON cm.id = p.message_id
        LEFT JOIN property_types pt ON cm.property_type_id = pt.id
        LEFT JOIN areas ar ON cm.area_id = ar.id
        WHERE cm.id = ?
      `);
      message = stmt.get(parseInt(id));
      
    } else {
      const messages = readJSONFile(DB_FILES.chat_messages);
      const agents = readJSONFile(DB_FILES.agents);
      const properties = readJSONFile(DB_FILES.properties);
      const propertyTypes = readJSONFile(DB_FILES.property_types);
      const areas = readJSONFile(DB_FILES.areas);
      
      message = messages.find(msg => msg.id === parseInt(id));
      
      if (message) {
        const agent = agents.find(a => a.id === message.agent_id);
        const property = properties.find(p => p.id === message.property_id);
        const propertyType = property ? propertyTypes.find(pt => pt.id === property.property_type_id) : null;
        const area = property ? areas.find(a => a.id === property.area_id) : null;
        
        message = {
          ...message,
          agent_name: agent ? agent.name : 'مجهول',
          agent_phone: agent ? agent.phone : '',
          agent_description: agent ? agent.description : '',
          property_type_name: propertyType ? propertyType.name_arabic : '',
          area_name: area ? area.name_arabic : '',
          price_text: property ? property.price_text : '',
          property_description: property ? property.description : ''
        };
      }
    }
    
    if (message) {
      const formattedMessage = {
        id: message.id,
        sender: message.agent_name || message.sender_name || 'مجهول',
        message: message.message,
        timestamp: new Date(message.timestamp || message.created_at).toLocaleString('ar-EG'),
        property_type: message.property_type_name ? 'apartment' : 'other',
        keywords: message.keywords || '',
        location: message.area_name || '',
        price: message.price_text || '',
        agent_phone: message.agent_phone || '',
        agent_description: message.agent_description || '',
        full_description: message.property_description || message.message
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

// Health check
app.get('/api/health', (req, res) => {
  try {
    let stats = {};
    
    if (USE_SQLITE) {
      stats = {
        database: 'SQLite',
        users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
        agents: db.prepare('SELECT COUNT(*) as count FROM agents').get().count,
        properties: db.prepare('SELECT COUNT(*) as count FROM properties').get().count,
        messages: db.prepare('SELECT COUNT(*) as count FROM chat_messages').get().count,
        areas: db.prepare('SELECT COUNT(*) as count FROM areas').get().count,
        property_types: db.prepare('SELECT COUNT(*) as count FROM property_types').get().count
      };
    } else {
      stats = {
        database: 'JSON Files',
        users: readJSONFile(DB_FILES.users).length,
        agents: readJSONFile(DB_FILES.agents).filter(a => a.is_active).length,
        properties: readJSONFile(DB_FILES.properties).filter(p => p.is_available).length,
        messages: readJSONFile(DB_FILES.chat_messages).length,
        areas: readJSONFile(DB_FILES.areas).filter(a => a.is_active).length,
        property_types: readJSONFile(DB_FILES.property_types).filter(pt => pt.is_active).length
      };
    }
    
    res.json({ 
      success: true, 
      message: 'Real Estate API v3.0 is running', 
      database: USE_SQLITE ? 'SQLite with relational structure' : 'JSON-based relational fallback',
      version: '3.0',
      features: [
        'Automatic SQLite/JSON fallback',
        'Full relational data structure',
        'Egyptian phone operators (010, 011, 012, 015)',
        'Enhanced property classification',
        'Area and agent management',
        'Property relationship mapping',
        'Advanced Arabic text extraction'
      ],
      stats
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ success: false, message: 'Health check failed' });
  }
});

// Initialize and start server
const startServer = () => {
  const initialized = initializeDatabase();
  
  if (initialized) {
    app.listen(PORT, () => {
      console.log(`🚀 Real Estate Chat API v3.0 running on http://localhost:${PORT}`);
      console.log(`📦 Database: ${USE_SQLITE ? 'SQLite' : 'JSON Files'} in ${dbDir}`);
      console.log(`🔍 API endpoints available at http://localhost:${PORT}/api/`);
      console.log(`💾 Using ${USE_SQLITE ? 'SQLite relational database' : 'JSON-based relational fallback'}`);
      console.log(`📱 Egyptian phone operators: 010 (Vodafone), 011 (Etisalat), 012 (Orange), 015 (WE)`);
      console.log(`🏠 Enhanced property classification and area management`);
      console.log(`🔄 Automatic fallback system ensures reliability`);
    });
  } else {
    console.error('Failed to initialize database');
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down gracefully...');
  if (USE_SQLITE && db) {
    db.close();
    console.log('📦 SQLite database closed.');
  }
  console.log('✅ Server closed.');
  process.exit(0);
});
