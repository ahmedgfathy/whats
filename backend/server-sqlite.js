const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
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

// Initialize SQLite database
const db = new Database(path.join(dbDir, 'real_estate.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Helper function to execute SQL files
const executeSQLFile = (filePath) => {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
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
  } catch (error) {
    console.error(`Error executing SQL file ${filePath}:`, error.message);
  }
};

// Initialize database with schema and data
const initializeDatabase = () => {
  console.log('🔧 Initializing SQLite database...');
  
  // Execute schema
  const schemaPath = path.join(dbDir, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    console.log('📋 Creating database schema...');
    executeSQLFile(schemaPath);
  }
  
  // Execute initial data
  const dataPath = path.join(dbDir, 'initial_data.sql');
  if (fs.existsSync(dataPath)) {
    console.log('📊 Inserting initial data...');
    executeSQLFile(dataPath);
  }
  
  // Get counts
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const agentCount = db.prepare('SELECT COUNT(*) as count FROM agents').get().count;
  const propertyTypeCount = db.prepare('SELECT COUNT(*) as count FROM property_types').get().count;
  const areaCount = db.prepare('SELECT COUNT(*) as count FROM areas').get().count;
  
  console.log(`✅ Database initialized successfully!`);
  console.log(`   👥 Users: ${userCount}`);
  console.log(`   🏢 Agents: ${agentCount}`);
  console.log(`   🏠 Property Types: ${propertyTypeCount}`);
  console.log(`   📍 Areas: ${areaCount}`);
};

// Phone number validation and operator extraction
const extractPhoneOperator = (phone) => {
  if (!phone) return null;
  
  // Clean phone number
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Egyptian mobile operators
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
  
  // Property type detection
  const propertyTypes = {
    'apartment': ['شقة', 'شقق', 'دور', 'أدوار', 'طابق', 'غرفة', 'غرف'],
    'villa': ['فيلا', 'فيلات', 'قصر', 'قصور', 'بيت', 'بيوت', 'منزل', 'منازل', 'دوبلكس'],
    'land': ['أرض', 'أراضي', 'قطعة', 'قطع', 'مساحة', 'فدان'],
    'office': ['مكتب', 'مكاتب', 'إداري', 'تجاري', 'محل', 'محلات'],
    'warehouse': ['مخزن', 'مخازن', 'مستودع', 'مستودعات', 'ورشة']
  };
  
  for (const [type, keywords] of Object.entries(propertyTypes)) {
    if (keywords.some(keyword => messageText.includes(keyword))) {
      extractedData.property_type = type;
      break;
    }
  }
  
  // Area extraction
  const areaPatterns = [
    /في\s+([^،\s]+(?:\s+[^،\s]+)*)/g,
    /بـ\s*([^،\s]+(?:\s+[^،\s]+)*)/g
  ];
  
  for (const pattern of areaPatterns) {
    const matches = [...messageText.matchAll(pattern)];
    if (matches.length > 0) {
      extractedData.area_name = matches[0][1].trim();
      break;
    }
  }
  
  // Price extraction
  const pricePattern = /(\d+(?:\.\d+)?)\s*(ألف|مليون|k|m)?\s*(جنيه|ريال|درهم|دولار)?/g;
  const priceMatches = [...messageText.matchAll(pricePattern)];
  if (priceMatches.length > 0) {
    extractedData.price = priceMatches[0][0];
  }
  
  // Area size extraction
  const sizePattern = /(\d+)\s*متر/g;
  const sizeMatches = [...messageText.matchAll(sizePattern)];
  if (sizeMatches.length > 0) {
    extractedData.area_size = parseInt(sizeMatches[0][1]);
  }
  
  // Rooms extraction
  const roomsPattern = /(\d+)\s*غرف?/g;
  const roomsMatches = [...messageText.matchAll(roomsPattern)];
  if (roomsMatches.length > 0) {
    extractedData.rooms = parseInt(roomsMatches[0][1]);
  }
  
  // Features extraction
  const features = {
    'has_elevator': ['أسانسير', 'مصعد'],
    'has_garage': ['جراج', 'كراج', 'موقف'],
    'has_garden': ['حديقة', 'جنينة'],
    'has_pool': ['مسبح', 'بسين'],
    'is_main_street': ['شارع رئيسي', 'طريق رئيسي']
  };
  
  for (const [feature, keywords] of Object.entries(features)) {
    if (keywords.some(keyword => messageText.includes(keyword))) {
      extractedData.features.push(feature);
    }
  }
  
  return extractedData;
};

// Initialize database
initializeDatabase();

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ? AND is_active = 1');
    const user = stmt.get(username, password);
    
    if (user) {
      // Update last login
      const updateStmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
      updateStmt.run(user.id);
      
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

// Get all properties (enhanced with relationships)
app.get('/api/properties', (req, res) => {
  const { search, property_type, area, limit = 100, page = 1 } = req.query;
  
  try {
    let query = `
      SELECT 
        p.*,
        pt.name_arabic as property_type_name,
        pt.type_code,
        a.name_arabic as area_name,
        a.city,
        ag.name as agent_name,
        ag.phone as agent_phone,
        ag.company_name,
        ag.description as agent_description
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      LEFT JOIN areas a ON p.area_id = a.id  
      LEFT JOIN agents ag ON p.agent_id = ag.id
      WHERE p.is_available = 1
    `;
    
    let params = [];
    
    if (search) {
      query += ` AND (p.title LIKE ? OR p.description LIKE ? OR ag.name LIKE ?)`;
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    
    if (property_type && property_type !== 'all') {
      query += ` AND pt.type_code = ?`;
      params.push(property_type);
    }
    
    if (area && area !== 'all') {
      query += ` AND a.name_arabic = ?`;
      params.push(area);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    params.push(limitNum, (pageNum - 1) * limitNum);
    
    const stmt = db.prepare(query);
    const properties = stmt.all(...params);
    
    res.json({ success: true, properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get messages (for backward compatibility)
app.get('/api/messages', (req, res) => {
  const { search, property_type, limit = 100 } = req.query;
  
  try {
    let query = `
      SELECT 
        cm.*,
        ag.name as sender,
        ag.phone as agent_phone,
        ag.description as agent_description,
        p.title as full_description,
        pt.type_code as property_type,
        a.name_arabic as location,
        p.price_text as price,
        p.description as keywords
      FROM chat_messages cm
      LEFT JOIN agents ag ON cm.agent_id = ag.id
      LEFT JOIN properties p ON cm.property_id = p.id
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      LEFT JOIN areas a ON p.area_id = a.id
      WHERE 1=1
    `;
    
    let params = [];
    
    if (search) {
      query += ` AND cm.message_text LIKE ?`;
      params.push(`%${search}%`);
    }
    
    if (property_type && property_type !== 'all') {
      query += ` AND pt.type_code = ?`;
      params.push(property_type);
    }
    
    query += ` ORDER BY cm.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const stmt = db.prepare(query);
    const messages = stmt.all(...params);
    
    // Format for frontend compatibility
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      sender: msg.sender || 'مجهول',
      message: msg.message_text,
      timestamp: new Date(msg.message_date || msg.created_at).toLocaleString('ar-EG'),
      property_type: msg.property_type || 'other',
      keywords: msg.keywords || '',
      location: msg.location || msg.extracted_location || '',
      price: msg.price || msg.extracted_price || '',
      agent_phone: msg.agent_phone || '',
      agent_description: msg.agent_description || '',
      full_description: msg.full_description || msg.message_text
    }));
    
    res.json({ success: true, messages: formattedMessages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Bulk import WhatsApp messages (enhanced processing)
app.post('/api/messages/bulk', (req, res) => {
  const { messages: messagesToImport } = req.body;
  
  if (!Array.isArray(messagesToImport)) {
    return res.status(400).json({ success: false, message: 'Messages must be an array' });
  }
  
  try {
    let importedCount = 0;
    let skippedCount = 0;
    let propertyCount = 0;
    
    const transaction = db.transaction((messages) => {
      for (const messageData of messages) {
        try {
          // Check for duplicates
          const checkStmt = db.prepare('SELECT id FROM chat_messages WHERE message_text = ? AND sender_name = ? LIMIT 1');
          const existing = checkStmt.get(messageData.message, messageData.sender);
          
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
            
            // Check if agent exists
            const findAgentStmt = db.prepare('SELECT id FROM agents WHERE phone = ?');
            let agent = findAgentStmt.get(messageData.agent_phone);
            
            if (!agent) {
              // Create new agent
              const insertAgentStmt = db.prepare(`
                INSERT INTO agents (name, phone, phone_operator, description)
                VALUES (?, ?, ?, ?)
              `);
              const result = insertAgentStmt.run(
                messageData.sender,
                messageData.agent_phone,
                phoneOperator,
                messageData.agent_description || `سمسار عقاري - ${messageData.sender}`
              );
              agentId = result.lastInsertRowid;
            } else {
              agentId = agent.id;
            }
          }
          
          // Find area
          let areaId = null;
          if (extracted.area_name) {
            const findAreaStmt = db.prepare('SELECT id FROM areas WHERE name_arabic LIKE ? LIMIT 1');
            const area = findAreaStmt.get(`%${extracted.area_name}%`);
            if (area) areaId = area.id;
          }
          
          // Find property type
          let propertyTypeId = null;
          if (extracted.property_type) {
            const findTypeStmt = db.prepare('SELECT id FROM property_types WHERE type_code = ?');
            const propertyType = findTypeStmt.get(extracted.property_type);
            if (propertyType) propertyTypeId = propertyType.id;
          }
          
          // Insert chat message
          const insertMessageStmt = db.prepare(`
            INSERT INTO chat_messages (
              agent_id, sender_name, message_text, message_date,
              extracted_price, extracted_area_size, extracted_location,
              keywords, is_processed, confidence_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          const messageResult = insertMessageStmt.run(
            agentId,
            messageData.sender,
            messageData.message,
            messageData.timestamp,
            extracted.price,
            extracted.area_size,
            extracted.area_name,
            messageData.keywords || '',
            1,
            0.8 // Confidence score
          );
          
          // If enough data extracted, create property
          if (propertyTypeId && agentId && (extracted.price || extracted.area_size)) {
            const insertPropertyStmt = db.prepare(`
              INSERT INTO properties (
                agent_id, property_type_id, area_id, title, description,
                price_text, area_size, rooms, has_elevator, has_garage,
                has_garden, has_pool, is_main_street
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            const propertyResult = insertPropertyStmt.run(
              agentId,
              propertyTypeId,
              areaId,
              messageData.message.substring(0, 100),
              messageData.message,
              extracted.price,
              extracted.area_size,
              extracted.rooms,
              extracted.features.includes('has_elevator') ? 1 : 0,
              extracted.features.includes('has_garage') ? 1 : 0,
              extracted.features.includes('has_garden') ? 1 : 0,
              extracted.features.includes('has_pool') ? 1 : 0,
              extracted.features.includes('is_main_street') ? 1 : 0
            );
            
            // Link message to property
            const updateMessageStmt = db.prepare('UPDATE chat_messages SET property_id = ? WHERE id = ?');
            updateMessageStmt.run(propertyResult.lastInsertRowid, messageResult.lastInsertRowid);
            
            propertyCount++;
          }
          
          importedCount++;
        } catch (err) {
          console.error('Error importing individual message:', err);
          skippedCount++;
        }
      }
    });
    
    // Execute transaction
    transaction(messagesToImport);
    
    console.log(`📥 Bulk import complete: ${importedCount} imported, ${skippedCount} skipped, ${propertyCount} properties created`);
    
    res.json({ 
      success: true, 
      imported: importedCount,
      total: messagesToImport.length,
      skipped: skippedCount,
      propertyMessages: propertyCount
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ success: false, message: 'Database error during bulk import' });
  }
});

// Get property type statistics
app.get('/api/stats', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        pt.type_code as property_type,
        COUNT(p.id) as count
      FROM property_types pt
      LEFT JOIN properties p ON pt.id = p.property_type_id AND p.is_available = 1
      GROUP BY pt.id, pt.type_code
      ORDER BY count DESC
    `);
    
    const stats = stmt.all();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get areas list
app.get('/api/areas', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM areas WHERE is_active = 1 ORDER BY name_arabic');
    const areas = stmt.all();
    res.json({ success: true, areas });
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get agents list
app.get('/api/agents', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        ag.*,
        COUNT(p.id) as properties_count,
        AVG(p.price) as avg_price
      FROM agents ag
      LEFT JOIN properties p ON ag.id = p.agent_id AND p.is_available = 1
      WHERE ag.is_active = 1
      GROUP BY ag.id
      ORDER BY properties_count DESC, ag.name
    `);
    
    const agents = stmt.all();
    res.json({ success: true, agents });
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get property by ID
app.get('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const stmt = db.prepare(`
      SELECT 
        cm.*,
        ag.name as sender,
        ag.phone as agent_phone,
        ag.description as agent_description,
        p.title as full_description,
        pt.type_code as property_type,
        a.name_arabic as location,
        p.price_text as price,
        p.description as keywords
      FROM chat_messages cm
      LEFT JOIN agents ag ON cm.agent_id = ag.id
      LEFT JOIN properties p ON cm.property_id = p.id
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      LEFT JOIN areas a ON p.area_id = a.id
      WHERE cm.id = ?
    `);
    
    const message = stmt.get(id);
    
    if (message) {
      const formattedMessage = {
        id: message.id,
        sender: message.sender || 'مجهول',
        message: message.message_text,
        timestamp: new Date(message.message_date || message.created_at).toLocaleString('ar-EG'),
        property_type: message.property_type || 'other',
        keywords: message.keywords || '',
        location: message.location || message.extracted_location || '',
        price: message.price || message.extracted_price || '',
        agent_phone: message.agent_phone || '',
        agent_description: message.agent_description || '',
        full_description: message.full_description || message.message_text
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

// Health check with database info
app.get('/api/health', (req, res) => {
  try {
    const stats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
      agents: db.prepare('SELECT COUNT(*) as count FROM agents WHERE is_active = 1').get().count,
      properties: db.prepare('SELECT COUNT(*) as count FROM properties WHERE is_available = 1').get().count,
      messages: db.prepare('SELECT COUNT(*) as count FROM chat_messages').get().count,
      areas: db.prepare('SELECT COUNT(*) as count FROM areas WHERE is_active = 1').get().count,
      property_types: db.prepare('SELECT COUNT(*) as count FROM property_types WHERE is_active = 1').get().count
    };
    
    res.json({ 
      success: true, 
      message: 'Real Estate API is running', 
      database: 'SQLite with relationships',
      version: '2.0',
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Health check failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Real Estate Chat API v2.0 running on http://localhost:${PORT}`);
  console.log(`📦 SQLite Database: ${path.join(dbDir, 'real_estate.db')}`);
  console.log(`🔍 API endpoints available at http://localhost:${PORT}/api/`);
  console.log(`💾 Using SQLite with proper relationships and foreign keys`);
  console.log(`📱 Egyptian phone operators supported: 010, 011, 012, 015`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down gracefully...');
  db.close();
  console.log('✅ Database connection closed.');
  process.exit(0);
});
