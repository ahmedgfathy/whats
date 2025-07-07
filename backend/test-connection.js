const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  try {
    console.log('Testing connection to:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***@'));
    
    const client = await pool.connect();
    console.log('✅ Successfully connected to database');
    
    // Test if tables exist
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    console.log('Available tables:', result.rows.map(r => r.table_name));
    
    // Test properties table
    const propertiesCount = await client.query('SELECT COUNT(*) FROM properties');
    console.log('Properties count:', propertiesCount.rows[0].count);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Error details:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
