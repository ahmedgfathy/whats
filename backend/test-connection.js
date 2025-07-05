const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing PostgreSQL connection to Neon...');
  console.log('Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Not configured');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL database');
    
    const result = await client.query('SELECT NOW()');
    console.log('⏰ Current database time:', result.rows[0].now);
    
    // Test basic query
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL version:', versionResult.rows[0].version.split(' ')[0]);
    
    // Check if any tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 Existing tables:', tablesResult.rows.length);
    
    client.release();
    await pool.end();
    console.log('✅ Connection test successful!');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    await pool.end();
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
