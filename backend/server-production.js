const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// PostgreSQL connection (Production Database)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection on startup
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ PostgreSQL connection error:', err.message);
    process.exit(1);
  });

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM chat_messages) as chat_messages,
        (SELECT COUNT(*) FROM properties_import) as properties_import,
        (SELECT COUNT(*) FROM users) as users
    `);
    
    res.json({
      success: true,
      message: 'Contaboo Production API is running',
      timestamp: result.rows[0].now,
      database: 'PostgreSQL (Neon)',
      version: '4.0 - Production',
      features: [
        'PostgreSQL as default database',
        'Full data migration completed',
        'Production-ready performance',
        '22,500+ property records',
        'Arabic language support',
        'WhatsApp chat processing'
      ],
      stats: {
        chat_messages: parseInt(stats.rows[0].chat_messages),
        properties_import: parseInt(stats.rows[0].properties_import),
        users: parseInt(stats.rows[0].users),
        total: parseInt(stats.rows[0].chat_messages) + parseInt(stats.rows[0].properties_import) + parseInt(stats.rows[0].users)
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          role: result.rows[0].role || 'user'
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Property statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    // Get stats from both chat_messages and properties_import
    const chatStats = await pool.query(`
      SELECT 
        CASE 
          WHEN property_type = 'apartment' OR property_type LIKE '%شقة%' THEN 'apartment'
          WHEN property_type = 'villa' OR property_type LIKE '%فيلا%' OR property_type LIKE '%villa%' THEN 'villa'
          WHEN property_type = 'land' OR property_type LIKE '%أرض%' OR property_type LIKE '%land%' THEN 'land'
          WHEN property_type = 'office' OR property_type LIKE '%مكتب%' OR property_type LIKE '%office%' THEN 'office'
          WHEN property_type = 'warehouse' OR property_type LIKE '%مخزن%' OR property_type LIKE '%warehouse%' THEN 'warehouse'
          ELSE 'other'
        END as property_type,
        COUNT(*) as count
      FROM chat_messages
      WHERE property_type IS NOT NULL
      GROUP BY 
        CASE 
          WHEN property_type = 'apartment' OR property_type LIKE '%شقة%' THEN 'apartment'
          WHEN property_type = 'villa' OR property_type LIKE '%فيلا%' OR property_type LIKE '%villa%' THEN 'villa'
          WHEN property_type = 'land' OR property_type LIKE '%أرض%' OR property_type LIKE '%land%' THEN 'land'
          WHEN property_type = 'office' OR property_type LIKE '%مكتب%' OR property_type LIKE '%office%' THEN 'office'
          WHEN property_type = 'warehouse' OR property_type LIKE '%مخزن%' OR property_type LIKE '%warehouse%' THEN 'warehouse'
          ELSE 'other'
        END
    `);
    
    const importStats = await pool.query(`
      SELECT 
        CASE 
          WHEN property_type LIKE '%apartment%' OR property_type LIKE '%شقة%' THEN 'apartment'
          WHEN property_type LIKE '%villa%' OR property_type LIKE '%فيلا%' THEN 'villa'
          WHEN property_type LIKE '%land%' OR property_type LIKE '%أرض%' THEN 'land'
          WHEN property_type LIKE '%office%' OR property_type LIKE '%مكتب%' THEN 'office'
          WHEN property_type LIKE '%warehouse%' OR property_type LIKE '%مخزن%' THEN 'warehouse'
          ELSE 'other'
        END as property_type,
        COUNT(*) as count
      FROM properties_import
      WHERE property_type IS NOT NULL
      GROUP BY 
        CASE 
          WHEN property_type LIKE '%apartment%' OR property_type LIKE '%شقة%' THEN 'apartment'
          WHEN property_type LIKE '%villa%' OR property_type LIKE '%فيلا%' THEN 'villa'
          WHEN property_type LIKE '%land%' OR property_type LIKE '%أرض%' THEN 'land'
          WHEN property_type LIKE '%office%' OR property_type LIKE '%مكتب%' THEN 'office'
          WHEN property_type LIKE '%warehouse%' OR property_type LIKE '%مخزن%' THEN 'warehouse'
          ELSE 'other'
        END
    `);
    
    // Combine and aggregate stats
    const combinedStats = {};
    
    chatStats.rows.forEach(row => {
      combinedStats[row.property_type] = (combinedStats[row.property_type] || 0) + parseInt(row.count);
    });
    
    importStats.rows.forEach(row => {
      combinedStats[row.property_type] = (combinedStats[row.property_type] || 0) + parseInt(row.count);
    });
    
    const stats = Object.entries(combinedStats).map(([property_type, count]) => ({
      property_type,
      count
    }));
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Combined search endpoint
app.get('/api/search-all', async (req, res) => {
  const { q, type, limit = 50 } = req.query;
  
  try {
    let chatQuery = 'SELECT *, \'chat\' as source_type FROM chat_messages WHERE 1=1';
    let importQuery = 'SELECT *, \'import\' as source_type FROM properties_import WHERE 1=1';
    const params = [];
    
    if (q) {
      params.push(`%${q}%`);
      chatQuery += ` AND (message ILIKE $${params.length} OR sender ILIKE $${params.length})`;
      importQuery += ` AND (property_name ILIKE $${params.length} OR description ILIKE $${params.length})`;
    }
    
    if (type && type !== 'all') {
      params.push(type);
      chatQuery += ` AND property_type = $${params.length}`;
      importQuery += ` AND property_type ILIKE $${params.length}`;
    }
    
    chatQuery += ` ORDER BY created_at DESC LIMIT ${Math.floor(limit/2)}`;
    importQuery += ` ORDER BY created_time DESC LIMIT ${Math.floor(limit/2)}`;
    
    const [chatResults, importResults] = await Promise.all([
      pool.query(chatQuery, params),
      pool.query(importQuery, params)
    ]);
    
    res.json({ 
      success: true, 
      chatMessages: chatResults.rows,
      importedProperties: importResults.rows,
      total: chatResults.rows.length + importResults.rows.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Search messages endpoint (for backward compatibility)
app.get('/api/messages/search', async (req, res) => {
  const { q, type, limit = 50 } = req.query;
  
  try {
    let query = 'SELECT * FROM chat_messages WHERE 1=1';
    const params = [];
    
    if (q) {
      params.push(`%${q}%`);
      query += ` AND (message ILIKE $${params.length} OR sender ILIKE $${params.length})`;
    }
    
    if (type && type !== 'all') {
      params.push(type);
      query += ` AND property_type = $${params.length}`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT ${limit}`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, messages: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get all messages endpoint
app.get('/api/messages', async (req, res) => {
  const { type, limit = 100 } = req.query;
  
  try {
    let query = 'SELECT * FROM properties_import WHERE 1=1';
    const params = [];
    
    if (type && type !== 'all') {
      params.push(`%${type}%`);
      query += ` AND property_type ILIKE $${params.length}`;
    }
    
    query += ` ORDER BY created_time DESC LIMIT ${limit}`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, messages: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get individual message endpoint
app.get('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Try chat_messages first, then properties_import
    let result = await pool.query('SELECT *, \'chat\' as source_type FROM chat_messages WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      result = await pool.query('SELECT *, \'import\' as source_type FROM properties_import WHERE id = $1', [id]);
    }
    
    if (result.rows.length > 0) {
      res.json({ success: true, message: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Message not found' });
    }
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// WhatsApp import endpoint
app.post('/api/import/whatsapp', async (req, res) => {
  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: 'Invalid messages format' });
  }
  
  try {
    let imported = 0;
    let skipped = 0;
    
    for (const messageData of messages) {
      const { sender, message, timestamp } = messageData;
      
      if (!sender || !message) {
        skipped++;
        continue;
      }
      
      try {
        await pool.query(`
          INSERT INTO chat_messages (
            sender, message, timestamp, property_type, keywords,
            location, price, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          sender,
          message,
          timestamp || new Date().toISOString(),
          messageData.property_type || 'other',
          messageData.keywords || '',
          messageData.location || '',
          messageData.price || '',
          new Date().toISOString()
        ]);
        imported++;
      } catch (err) {
        if (!err.message.includes('duplicate')) {
          console.error('Import error for message:', err.message);
        }
        skipped++;
      }
    }
    
    res.json({ 
      success: true, 
      message: `تم استيراد ${imported} رسالة، تم تخطي ${skipped} رسالة`,
      imported,
      skipped
    });
  } catch (error) {
    console.error('WhatsApp import error:', error);
    res.status(500).json({ success: false, message: 'خطأ في استيراد البيانات' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    
    app.listen(PORT, () => {
      console.log(`🚀 Contaboo Production Server running on port ${PORT}`);
      console.log(`🔗 Database: PostgreSQL (Neon)`);
      console.log(`📡 API endpoints: http://localhost:${PORT}/api/`);
      console.log(`🌐 Production ready with PostgreSQL as default database`);
      console.log(`📊 Features: WhatsApp import, CSV import, Arabic support, 22,500+ properties`);
      console.log(`🔧 Version: 4.0 - Production with PostgreSQL`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down gracefully...');
  await pool.end();
  console.log('✅ Database connections closed.');
  process.exit(0);
});

module.exports = app;
