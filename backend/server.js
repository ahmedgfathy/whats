const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for large CSV files
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const db = new Database(path.join(dbDir, 'real_estate_chat.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const initializeDatabase = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Chat messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT,
      property_type TEXT,
      keywords TEXT,
      location TEXT,
      price TEXT,
      agent_phone TEXT,
      agent_description TEXT,
      full_description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default user
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password) 
    VALUES (?, ?)
  `);
  insertUser.run('xinreal', 'zerocall');

  // Insert sample Arabic real estate data
  const insertMessage = db.prepare(`
    INSERT OR IGNORE INTO chat_messages (id, sender, message, timestamp, property_type, keywords, location, price, agent_phone, agent_description, full_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleData = [
    {
      id: 1,
      sender: 'أحمد السمسار',
      message: 'شقة للبيع في الحي العاشر مساحة 120 متر 3 غرف نوم وصالة ومطبخ وحمامين الدور الثالث بأسانسير السعر 850 ألف جنيه',
      timestamp: new Date().toLocaleDateString('ar-EG') + ', ' + new Date().toLocaleTimeString('ar-EG'),
      property_type: 'apartment',
      keywords: 'شقة, غرف, مطبخ, حمام',
      location: 'الحي العاشر',
      price: '850 ألف جنيه',
      agent_phone: '01234567890',
      agent_description: 'أحمد السمسار - سمسار عقاري محترف متخصص في العقارات السكنية والتجارية',
      full_description: 'شقة مميزة في موقع استراتيجي بالحي العاشر، المساحة 120 متر مربع، تشطيبات عالية الجودة، إطلالة رائعة، قريبة من المواصلات والخدمات، تصلح للسكن أو الاستثمار.'
    },
    {
      id: 2,
      sender: 'محمد العقاري',
      message: 'فيلا دوبلكس للإيجار في التجمع الخامس 250 متر مبني على قطعة 300 متر 4 غرف نوم وصالتين ومطبخ وحديقة',
      timestamp: new Date().toLocaleDateString('ar-EG') + ', ' + new Date().toLocaleTimeString('ar-EG'),
      property_type: 'villa',
      keywords: 'فيلا, حديقة, غرف',
      location: 'التجمع الخامس',
      price: '15000 جنيه شهرياً',
      agent_phone: '01123456789',
      agent_description: 'محمد العقاري - خبرة أكثر من 10 سنوات في السوق العقاري المصري',
      full_description: 'فيلا فاخرة في التجمع الخامس بمساحة 250 متر مربع، تصميم عصري، حديقة منسقة، جراج مغطى، أمن وحراسة 24 ساعة، موقع هادئ ومميز.'
    },
    {
      id: 3,
      sender: 'سارة للعقارات',
      message: 'أرض للبيع في الشيخ زايد 500 متر على شارع رئيسي مباشرة موقع مميز جداً',
      timestamp: new Date().toLocaleDateString('ar-EG') + ', ' + new Date().toLocaleTimeString('ar-EG'),
      property_type: 'land',
      keywords: 'أرض, شارع رئيسي',
      location: 'الشيخ زايد',
      price: '2.5 مليون جنيه',
      agent_phone: '01012345678',
      agent_description: 'سارة للعقارات - وكيل عقاري معتمد ومتخصص في الاستثمار العقاري',
      full_description: 'قطعة أرض في موقع مميز بالشيخ زايد، المساحة 500 متر مربع، على شارع رئيسي، مرافق متاحة، صالحة للبناء السكني أو التجاري، استثمار مضمون.'
    }
  ];

  sampleData.forEach(data => {
    try {
      insertMessage.run(
        data.id,
        data.sender,
        data.message,
        data.timestamp,
        data.property_type,
        data.keywords,
        data.location,
        data.price,
        data.agent_phone,
        data.agent_description,
        data.full_description
      );
    } catch (err) {
      // Ignore duplicate entry errors
      if (!err.message.includes('UNIQUE constraint failed')) {
        console.error('Error inserting sample data:', err);
      }
    }
  });

  console.log('Database initialized with sample data');
};

// Initialize database
initializeDatabase();

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
    const user = stmt.get(username, password);
    
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get all messages
app.get('/api/messages', (req, res) => {
  const { search, property_type, limit = 100 } = req.query;
  
  try {
    let query = 'SELECT * FROM chat_messages WHERE 1=1';
    let params = [];
    
    if (search) {
      query += ' AND message LIKE ?';
      params.push(`%${search}%`);
    }
    
    if (property_type && property_type !== 'all') {
      query += ' AND property_type = ?';
      params.push(property_type);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const stmt = db.prepare(query);
    const messages = stmt.all(...params);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Add new message
app.post('/api/messages', (req, res) => {
  const messageData = req.body;
  
  try {
    const stmt = db.prepare(`
      INSERT INTO chat_messages (sender, message, timestamp, property_type, keywords, location, price, agent_phone, agent_description, full_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      messageData.sender,
      messageData.message,
      messageData.timestamp,
      messageData.property_type,
      messageData.keywords,
      messageData.location,
      messageData.price,
      messageData.agent_phone,
      messageData.agent_description,
      messageData.full_description
    );
    
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get property type statistics
app.get('/api/stats', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        property_type,
        COUNT(*) as count
      FROM chat_messages 
      WHERE property_type IS NOT NULL
      GROUP BY property_type
    `);
    
    const stats = stmt.all();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Bulk import messages (for WhatsApp chat imports)
app.post('/api/messages/bulk', (req, res) => {
  const { messages: messagesToImport } = req.body;
  
  if (!Array.isArray(messagesToImport)) {
    return res.status(400).json({ success: false, message: 'Messages must be an array' });
  }
  
  try {
    const stmt = db.prepare(`
      INSERT INTO chat_messages (sender, message, timestamp, property_type, keywords, location, price, agent_phone, agent_description, full_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let importedCount = 0;
    let skippedCount = 0;
    let propertyCount = 0;
    
    // Start transaction for better performance
    const transaction = db.transaction((messages) => {
      for (const messageData of messages) {
        try {
          // Check for duplicates (simple check based on message and sender)
          const checkStmt = db.prepare('SELECT id FROM chat_messages WHERE message = ? AND sender = ? LIMIT 1');
          const existing = checkStmt.get(messageData.message, messageData.sender);
          
          if (existing) {
            skippedCount++;
            continue;
          }
          
          stmt.run(
            messageData.sender,
            messageData.message,
            messageData.timestamp,
            messageData.property_type,
            messageData.keywords,
            messageData.location,
            messageData.price,
            messageData.agent_phone,
            messageData.agent_description,
            messageData.full_description
          );
          
          importedCount++;
          
          if (messageData.property_type !== 'other') {
            propertyCount++;
          }
        } catch (err) {
          console.error('Error importing individual message:', err);
          skippedCount++;
        }
      }
    });
    
    // Execute transaction
    transaction(messagesToImport);
    
    console.log(`Bulk import complete: ${importedCount} imported, ${skippedCount} skipped, ${propertyCount} properties`);
    
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

// Get message by ID
app.get('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const stmt = db.prepare('SELECT * FROM chat_messages WHERE id = ?');
    const message = stmt.get(id);
    
    if (message) {
      res.json({ success: true, message });
    } else {
      res.status(404).json({ success: false, message: 'Message not found' });
    }
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// CSV Import endpoint
app.post('/api/import-csv', (req, res) => {
  // Debug: log the raw request body
  console.log('Raw /api/import-csv request body:', req.body);
  try {
    const { tableName, headers, data } = req.body;
    
    if (!tableName || !headers || !data || !Array.isArray(data)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: tableName, headers, data' 
      });
    }

    console.log(`Starting CSV import to table: ${tableName}`);
    console.log(`Headers: ${headers.join(', ')}`);
    console.log(`Data rows: ${data.length}`);

    // Clean headers for SQL - ensure they're unique and valid
    const cleanHeaders = headers.map((header, index) => {
      if (!header || header.trim() === '') {
        return `column_${index + 1}`;
      }
      // Replace special characters and spaces
      return header.trim().replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 50);
    });

    // Ensure header uniqueness
    const uniqueHeaders = [];
    const usedHeaders = new Set();
    
    cleanHeaders.forEach((header, index) => {
      let uniqueHeader = header;
      let counter = 1;
      
      while (usedHeaders.has(uniqueHeader)) {
        uniqueHeader = `${header}_${counter}`;
        counter++;
      }
      
      uniqueHeaders.push(uniqueHeader);
      usedHeaders.add(uniqueHeader);
    });

    console.log('Clean unique headers:', uniqueHeaders);

    // Create or update table based on CSV structure
    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${uniqueHeaders.map(header => `\`${header}\` TEXT`).join(', ')},
      imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`;
    
    db.exec(createTableSQL);
    console.log(`Table ${tableName} created/updated`);

    // Prepare insert statement
    const placeholders = uniqueHeaders.map(() => '?').join(', ');
    const insertSQL = `INSERT INTO ${tableName} (${uniqueHeaders.map(h => `\`${h}\``).join(', ')}) VALUES (${placeholders})`;
    const insertStmt = db.prepare(insertSQL);

    // Insert data in transaction for better performance
    const insertMany = db.transaction((rows) => {
      let insertedCount = 0;
      for (const row of rows) {
        try {
          const values = headers.map(header => row[header] || '');
          insertStmt.run(values);
          insertedCount++;
        } catch (error) {
          console.warn(`Failed to insert row:`, error.message, row);
        }
      }
      return insertedCount;
    });

    const importedCount = insertMany(data);

    console.log(`CSV import completed: ${importedCount}/${data.length} rows imported`);

    res.json({
      success: true,
      message: `Successfully imported ${importedCount} rows to table ${tableName}`,
      imported: importedCount,
      total: data.length,
      table: tableName
    });

  } catch (error) {
    console.error('CSV import error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import CSV data: ' + error.message
    });
  }
});

// Search Properties Import endpoint
app.get('/api/search-properties', (req, res) => {
  try {
    const { q: searchTerm, filter, limit = 100 } = req.query;
    
    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Search term is required' 
      });
    }

    console.log(`Searching properties for: "${searchTerm}" with filter: ${filter}`);

    // Build search query based on filter
    let searchQuery = '';
    let searchColumns = [];
    
    switch (filter) {
      case 'شقة':
      case 'apartment':
        searchColumns = ['Property_Name', 'Property_Category', 'Property_Type'];
        break;
      case 'فيلا':
      case 'villa':
        searchColumns = ['Property_Name', 'Property_Category', 'Property_Type'];
        break;
      case 'أرض':
      case 'land':
        searchColumns = ['Property_Name', 'Property_Category', 'Property_Type'];
        break;
      case 'منطقة':
      case 'location':
        searchColumns = ['Regions'];
        break;
      default:
        // Search all relevant columns
        searchColumns = [
          'Property_Name', 'Property_Category', 'Property_Type', 
          'Regions', 'Description', 'Name', 'Mobile_No'
        ];
    }

    // Create WHERE clause with LIKE conditions
    const whereConditions = searchColumns
      .map(col => `\`${col}\` LIKE ?`)
      .join(' OR ');
    
    const searchParams = searchColumns.map(() => `%${searchTerm}%`);

    const sql = `
      SELECT * FROM properties_import 
      WHERE ${whereConditions}
      ORDER BY id DESC
      LIMIT ?
    `;

    const properties = db.prepare(sql).all(...searchParams, parseInt(limit));

    console.log(`Found ${properties.length} properties matching "${searchTerm}"`);

    res.json({
      success: true,
      data: properties,
      total: properties.length,
      searchTerm,
      filter
    });

  } catch (error) {
    console.error('Properties search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search properties: ' + error.message
    });
  }
});

// Combined Search endpoint (both chat messages and properties)
app.get('/api/search-all', (req, res) => {
  try {
    const { q: searchTerm, filter, limit = 50 } = req.query;
    
    if (!searchTerm || searchTerm.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Search term is required' 
      });
    }

    console.log(`Combined search for: "${searchTerm}" with filter: ${filter}`);

    // Search chat messages
    let messageQuery = '';
    let messageParams = [];
    
    if (filter) {
      messageQuery = `
        SELECT *, 'chat' as source FROM chat_messages 
        WHERE (message LIKE ? OR location LIKE ? OR agent_description LIKE ?) 
        AND property_type LIKE ?
        ORDER BY id DESC LIMIT ?
      `;
      messageParams = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${filter}%`, Math.floor(limit/2)];
    } else {
      messageQuery = `
        SELECT *, 'chat' as source FROM chat_messages 
        WHERE message LIKE ? OR location LIKE ? OR agent_description LIKE ?
        ORDER BY id DESC LIMIT ?
      `;
      messageParams = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, Math.floor(limit/2)];
    }

    const chatResults = db.prepare(messageQuery).all(...messageParams);

    // Search properties
    const propertyColumns = [
      'Property_Name', 'Property_Category', 'Property_Type', 
      'Regions', 'Description', 'Name', 'Mobile_No'
    ];
    
    const propertyWhereConditions = propertyColumns
      .map(col => `\`${col}\` LIKE ?`)
      .join(' OR ');
    
    const propertyParams = propertyColumns.map(() => `%${searchTerm}%`);
    
    const propertyQuery = `
      SELECT *, 'property' as source FROM properties_import 
      WHERE ${propertyWhereConditions}
      ORDER BY id DESC LIMIT ?
    `;

    const propertyResults = db.prepare(propertyQuery).all(...propertyParams, Math.floor(limit/2));

    const combinedResults = {
      chatMessages: chatResults,
      properties: propertyResults,
      totalChat: chatResults.length,
      totalProperties: propertyResults.length,
      searchTerm,
      filter
    };

    console.log(`Combined search found: ${chatResults.length} chat messages, ${propertyResults.length} properties`);

    res.json({
      success: true,
      data: combinedResults
    });

  } catch (error) {
    console.error('Combined search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform combined search: ' + error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', database: 'SQLite connected' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Real Estate Chat API server running on http://localhost:${PORT}`);
  console.log(`📦 Database file: ${path.join(dbDir, 'real_estate_chat.db')}`);
  console.log(`🔍 API endpoints available at http://localhost:${PORT}/api/`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  console.log('Database connection closed.');
  process.exit(0);
});
