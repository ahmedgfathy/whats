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
        property_name TEXT,
        property_number TEXT,
        property_category TEXT,
        created_time TEXT,
        regions TEXT,
        modified_time TEXT,
        floor_no TEXT,
        property_type TEXT,
        building TEXT,
        bedroom TEXT,
        land_garden TEXT,
        bathroom TEXT,
        finished TEXT,
        last_modified_by TEXT,
        update_unit TEXT,
        property_offered_by TEXT,
        name TEXT,
        mobile_no TEXT,
        tel TEXT,
        unit_price TEXT,
        payment_type TEXT,
        deposit TEXT,
        payment TEXT,
        paid_every TEXT,
        amount TEXT,
        description TEXT,
        zain_house_sales_notes TEXT,
        sales TEXT,
        handler TEXT,
        property_image TEXT,
        imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_property ON chat_messages(property_type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type)`);
    
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
    const { limit = 1000 } = req.query;
    
    // Check if we have relationships set up
    const hasRelationships = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'property_type_id'
    `);
    
    let query;
    if (hasRelationships.rows[0].count > 0) {
      // Use relationship-based query for better data
      query = `
        SELECT 
          p.*,
          pt.name_arabic as property_type_name_ar,
          pt.name_english as property_type_name_en,
          a.name_arabic as area_name_ar,
          a.name_english as area_name_en,
          ag.name as agent_name,
          ag.phone as agent_phone
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.id
        LEFT JOIN areas a ON p.area_id = a.id
        LEFT JOIN agents ag ON p.agent_id = ag.id
        ORDER BY p.imported_at DESC 
        LIMIT $1
      `;
    } else {
      // Fallback to basic query
      query = 'SELECT * FROM properties ORDER BY imported_at DESC LIMIT $1';
    }
    
    const result = await pool.query(query, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get property by ID with related data
app.get('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get property with related data
    const result = await pool.query(`
      SELECT 
        p.*,
        pt.name_arabic as property_type_name_ar,
        pt.name_english as property_type_name_en,
        a.name_arabic as area_name_ar,
        a.name_english as area_name_en,
        ag.name as agent_name,
        ag.phone as agent_phone,
        ag.description as agent_description
      FROM properties p
      LEFT JOIN property_types pt ON p.property_type_id = pt.id
      LEFT JOIN areas a ON p.area_id = a.id
      LEFT JOIN agents ag ON p.agent_id = ag.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const property = result.rows[0];
    
    // Also get related chat messages for this property
    const messagesResult = await pool.query(`
      SELECT * FROM chat_messages 
      WHERE property_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [id]);
    
    // Add related messages to property data
    property.related_messages = messagesResult.rows;
    
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Get message by ID (for backward compatibility)
app.get('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        cm.*,
        p.property_name,
        p.property_category,
        p.regions,
        p.unit_price,
        p.bedroom,
        p.bathroom
      FROM chat_messages cm
      LEFT JOIN properties p ON cm.property_id = p.id
      WHERE cm.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Failed to fetch message' });
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

// Search properties endpoint
app.get('/api/search-properties', async (req, res) => {
  try {
    const { q, filter, limit = 100 } = req.query;
    
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Add search filters
    if (q) {
      query += ` AND (property_name ILIKE $${paramIndex} OR property_category ILIKE $${paramIndex} OR regions ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${q}%`);
      paramIndex++;
    }
    
    if (filter && filter !== 'all') {
      query += ` AND property_category ILIKE $${paramIndex}`;
      params.push(`%${filter}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY imported_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ error: 'Failed to search properties' });
  }
});

// Get statistics for dashboard
app.get('/api/stats', async (req, res) => {
  try {
    // Check if we have the new relationship structure
    const hasRelationships = await pool.query(`
      SELECT COUNT(*) as count FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name = 'property_type_id'
    `);
    
    let result;
    if (hasRelationships.rows[0].count > 0) {
      // Use new relationship-based query
      console.log('Using relationship-based stats');
      result = await pool.query(`
        SELECT 
          COUNT(*) as total_properties,
          COUNT(CASE WHEN pt.type_code = 'villa' THEN 1 END) as villas,
          COUNT(CASE WHEN pt.type_code = 'apartment' THEN 1 END) as apartments,
          COUNT(CASE WHEN pt.type_code = 'penthouse' THEN 1 END) as penthouses,
          COUNT(CASE WHEN pt.type_code = 'townhouse' THEN 1 END) as townhouses,
          COUNT(CASE WHEN pt.type_code = 'office' THEN 1 END) as offices,
          COUNT(CASE WHEN pt.type_code = 'land' THEN 1 END) as land
        FROM properties p
        LEFT JOIN property_types pt ON p.property_type_id = pt.id
      `);
    } else {
      // Fallback to category-based query
      console.log('Using category-based stats (fallback)');
      result = await pool.query(`
        SELECT 
          COUNT(*) as total_properties,
          COUNT(CASE WHEN property_category ILIKE '%فيلات%' OR property_category ILIKE '%فيلا%' OR property_category ILIKE '%villa%' THEN 1 END) as villas,
          COUNT(CASE WHEN property_category ILIKE '%شقق%' OR property_category ILIKE '%شقة%' OR property_category ILIKE '%apartment%' THEN 1 END) as apartments,
          COUNT(CASE WHEN property_category ILIKE '%دوبلكس%' OR property_category ILIKE '%duplex%' OR property_category ILIKE '%penthouse%' THEN 1 END) as penthouses,
          COUNT(CASE WHEN property_category ILIKE '%تاون%' OR property_category ILIKE '%townhouse%' THEN 1 END) as townhouses,
          COUNT(CASE WHEN property_category ILIKE '%محلات%' OR property_category ILIKE '%اداري%' OR property_category ILIKE '%مكتب%' OR property_category ILIKE '%office%' OR property_category ILIKE '%commercial%' THEN 1 END) as offices,
          COUNT(CASE WHEN property_category ILIKE '%اراضي%' OR property_category ILIKE '%أرض%' OR property_category ILIKE '%land%' THEN 1 END) as land
        FROM properties
      `);
    }
    
    // Also get category breakdown for debugging
    const categoriesResult = await pool.query(`
      SELECT property_category, COUNT(*) as count 
      FROM properties 
      WHERE property_category IS NOT NULL 
      GROUP BY property_category 
      ORDER BY count DESC
      LIMIT 10
    `);
    
    const stats = result.rows[0];
    
    res.json({
      totalProperties: parseInt(stats.total_properties),
      villas: parseInt(stats.villas),
      apartments: parseInt(stats.apartments),
      penthouses: parseInt(stats.penthouses),
      townhouses: parseInt(stats.townhouses),
      offices: parseInt(stats.offices),
      land: parseInt(stats.land),
      categories: categoriesResult.rows, // Include actual categories for debugging
      usingRelationships: hasRelationships.rows[0].count > 0
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
