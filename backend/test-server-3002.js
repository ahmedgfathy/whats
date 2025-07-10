// Minimal test server to verify backend is working
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = 3002; // Use different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    server: 'test-server',
    port: PORT 
  });
});

// Test properties endpoint
app.get('/api/properties', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await pool.query(`
      SELECT id, property_name, property_category, price, regions, imported_at
      FROM properties 
      ORDER BY imported_at DESC 
      LIMIT $1
    `, [parseInt(limit)]);
    
    console.log(`✅ Properties query returned ${result.rows.length} rows`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Test stats endpoint
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
    console.log('✅ Stats query result:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Properties: http://localhost:${PORT}/api/properties`);
  console.log(`   Stats: http://localhost:${PORT}/api/stats`);
});
