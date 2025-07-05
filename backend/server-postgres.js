const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('🔗 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Initialize database tables
const initializeTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(15,2),
        location VARCHAR(255),
        bedrooms INTEGER,
        bathrooms INTEGER,
        area_sqft INTEGER,
        property_type VARCHAR(50),
        listing_type VARCHAR(20),
        agent_name VARCHAR(255),
        agent_phone VARCHAR(20),
        agent_email VARCHAR(255),
        images TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_property ON messages(property_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_listing ON properties(listing_type)`);
    
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
  }
};

// Initialize database on startup
initializeTables();

// API Routes

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get property by ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Search properties
app.get('/api/properties/search', async (req, res) => {
  try {
    const { q, type, listing_type, min_price, max_price, bedrooms, bathrooms, location } = req.query;
    
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    if (q) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }
    
    if (type) {
      query += ` AND property_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (listing_type) {
      query += ` AND listing_type = $${paramIndex}`;
      params.push(listing_type);
      paramIndex++;
    }
    
    if (min_price) {
      query += ` AND price >= $${paramIndex}`;
      params.push(min_price);
      paramIndex++;
    }
    
    if (max_price) {
      query += ` AND price <= $${paramIndex}`;
      params.push(max_price);
      paramIndex++;
    }
    
    if (bedrooms) {
      query += ` AND bedrooms >= $${paramIndex}`;
      params.push(bedrooms);
      paramIndex++;
    }
    
    if (bathrooms) {
      query += ` AND bathrooms >= $${paramIndex}`;
      params.push(bathrooms);
      paramIndex++;
    }
    
    if (location) {
      query += ` AND location ILIKE $${paramIndex}`;
      params.push(`%${location}%`);
      paramIndex++;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ error: 'Failed to search properties' });
  }
});

// Get statistics for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(CASE WHEN property_type ILIKE '%villa%' THEN 1 END) as villas,
        COUNT(CASE WHEN property_type ILIKE '%apartment%' THEN 1 END) as apartments,
        COUNT(CASE WHEN property_type ILIKE '%penthouse%' THEN 1 END) as penthouses,
        COUNT(CASE WHEN property_type ILIKE '%townhouse%' THEN 1 END) as townhouses,
        COUNT(CASE WHEN property_type ILIKE '%office%' THEN 1 END) as offices,
        COUNT(CASE WHEN payment_type ILIKE '%rent%' THEN 1 END) as for_rent,
        COUNT(CASE WHEN payment_type ILIKE '%sale%' THEN 1 END) as for_sale
      FROM properties
    `);
    
    const stats = result.rows[0];
    
    res.json({
      totalProperties: parseInt(stats.total_properties),
      villas: parseInt(stats.villas),
      apartments: parseInt(stats.apartments),
      penthouses: parseInt(stats.penthouses),
      townhouses: parseInt(stats.townhouses),
      offices: parseInt(stats.offices),
      forRent: parseInt(stats.for_rent),
      forSale: parseInt(stats.for_sale)
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM conversations c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.updated_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get conversation by ID with messages
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const conversationResult = await pool.query(`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM conversations c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `, [id]);
    
    if (conversationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    const messagesResult = await pool.query(`
      SELECT m.*, p.title as property_title, p.location as property_location
      FROM messages m
      LEFT JOIN properties p ON m.property_id = p.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [id]);
    
    const conversation = conversationResult.rows[0];
    conversation.messages = messagesResult.rows;
    
    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Create new conversation
app.post('/api/conversations', async (req, res) => {
  try {
    const { user_id, title } = req.body;
    
    const result = await pool.query(
      'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
      [user_id, title]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Add message to conversation
app.post('/api/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { sender_type, content, property_id } = req.body;
    
    const result = await pool.query(
      'INSERT INTO messages (conversation_id, sender_type, content, property_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, sender_type, content, property_id]
    );
    
    // Update conversation timestamp
    await pool.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Get all messages (for chat interface)
app.get('/api/messages', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.title as property_title, p.location as property_location,
             p.price as property_price, p.images as property_images
      FROM messages m
      LEFT JOIN properties p ON m.property_id = p.id
      ORDER BY m.created_at ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add new message (for chat interface)
app.post('/api/messages', async (req, res) => {
  try {
    const { sender_type, content, property_id } = req.body;
    
    const result = await pool.query(
      'INSERT INTO messages (conversation_id, sender_type, content, property_id) VALUES (1, $1, $2, $3) RETURNING *',
      [sender_type, content, property_id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Contaboo PostgreSQL server running on port ${PORT}`);
  console.log(`🔗 Database: ${process.env.DATABASE_URL ? 'PostgreSQL (Neon)' : 'Not configured'}`);
});

module.exports = app;
