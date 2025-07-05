const { Pool } = require('pg');
require('dotenv').config();

async function testNeonConnection() {
  console.log('🔍 Testing Neon connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connected successfully at:', result.rows[0].now);
    
    // Create a simple test table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert test data
    await pool.query(`
      INSERT INTO test_table (name) VALUES ('Test Migration') 
      ON CONFLICT DO NOTHING
    `);
    
    // Read back
    const testResult = await pool.query('SELECT * FROM test_table');
    console.log('✅ Test data:', testResult.rows);
    
    // Clean up
    await pool.query('DROP TABLE test_table');
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await pool.end();
  }
}

testNeonConnection();
