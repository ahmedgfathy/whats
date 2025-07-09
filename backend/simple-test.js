// Simple test to check database connection
const { Pool } = require('pg');

// Replace with your actual database URL
const DATABASE_URL = 'postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT COUNT(*) FROM properties_normalized');
    console.log('✅ Database connection successful');
    console.log('📊 Normalized table records:', result.rows[0].count);
    
    // Test stats query
    const statsResult = await pool.query(`
      SELECT 
        pc.name_en as property_type,
        COUNT(*) as count
      FROM properties_normalized pn
      LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
      WHERE pc.name_en IS NOT NULL 
      GROUP BY pc.name_en
      ORDER BY count DESC
      LIMIT 5
    `);
    
    console.log('📈 Top 5 categories:');
    statsResult.rows.forEach(row => {
      console.log(`  - ${row.property_type}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
