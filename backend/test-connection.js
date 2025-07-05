const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Current database time:', result.rows[0].now);
    
    // Test basic query
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', versionResult.rows[0].version.split(' ')[0]);
    
    client.release();
    await pool.end();
    console.log('✅ Connection test successful!');
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testConnection();
