const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const { limit = 1000 } = req.query;
    const result = await pool.query(`SELECT * FROM properties ORDER BY imported_at DESC LIMIT $1`, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_properties,
        COUNT(CASE WHEN property_category ILIKE '%فيلات%' THEN 1 END) as villas,
        COUNT(CASE WHEN property_category ILIKE '%شقق%' THEN 1 END) as apartments,
        COUNT(CASE WHEN property_category ILIKE '%دوبلكس%' THEN 1 END) as penthouses,
        COUNT(CASE WHEN property_category ILIKE '%تاون%' THEN 1 END) as townhouses,
        COUNT(CASE WHEN property_category ILIKE '%محلات%' OR property_category ILIKE '%اداري%' THEN 1 END) as offices,
        COUNT(CASE WHEN property_category ILIKE '%اراضي%' THEN 1 END) as land
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
      land: parseInt(stats.land)
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Search properties
app.get('/api/search-properties', async (req, res) => {
  try {
    const { q, filter, limit = 100 } = req.query;
    
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database error:', err.message));
