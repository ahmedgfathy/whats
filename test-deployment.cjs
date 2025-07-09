// Test script to verify local backend connection to Neon
const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function testConnection() {
  console.log('🔍 Testing Neon Database Connection...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Neon PostgreSQL');
    
    // Test basic queries
    const healthCheck = await client.query('SELECT NOW() as timestamp');
    console.log('📊 Current time:', healthCheck.rows[0].timestamp);
    
    // Test tables
    const tableCount = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM chat_messages) as chat_messages,
        (SELECT COUNT(*) FROM properties_import) as properties_import,
        (SELECT COUNT(*) FROM users) as users
    `);
    
    console.log('📊 Database stats:', tableCount.rows[0]);
    
    // Test stats query (like the API does)
    const statsQuery = await client.query(`
      SELECT 
        pc.name_en as property_type,
        COUNT(*) as count
      FROM properties_normalized pn
      LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
      WHERE pc.name_en IS NOT NULL 
      GROUP BY pc.name_en, pc.id
      ORDER BY count DESC
      LIMIT 5
    `);
    
    console.log('📈 Top property types:');
    statsQuery.rows.forEach(row => {
      console.log(`   ${row.property_type}: ${row.count}`);
    });
    
    client.release();
    await pool.end();
    
    console.log('✅ All tests passed! Database is working correctly.');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Try fallback queries
    try {
      const client = await pool.connect();
      const fallbackStats = await client.query(`
        SELECT property_category, COUNT(*) as count 
        FROM properties 
        WHERE property_category IS NOT NULL 
        GROUP BY property_category 
        ORDER BY count DESC 
        LIMIT 5
      `);
      
      console.log('📈 Fallback stats from properties table:');
      fallbackStats.rows.forEach(row => {
        console.log(`   ${row.property_category}: ${row.count}`);
      });
      
      client.release();
      
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError.message);
    }
    
    await pool.end();
  }
}

testConnection();
