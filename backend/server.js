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
