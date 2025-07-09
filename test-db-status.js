const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testDatabaseStatus() {
  try {
    console.log('🔍 Testing database connectivity...');
    
    // Test basic connection
    const testQuery = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Check normalized table count
    const normalizedResult = await pool.query('SELECT COUNT(*) as count FROM properties_normalized');
    console.log(`📊 Normalized table records: ${normalizedResult.rows[0].count}`);
    
    // Check original table count
    const originalResult = await pool.query('SELECT COUNT(*) as count FROM properties');
    console.log(`📊 Original table records: ${originalResult.rows[0].count}`);
    
    // Test stats query from normalized table
    const statsResult = await pool.query(`
      SELECT 
        pc.name_en as property_type,
        COUNT(*) as count
      FROM properties_normalized pn
      LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
      WHERE pc.name_en IS NOT NULL 
      GROUP BY pc.name_en
      ORDER BY count DESC
      LIMIT 8
    `);
    
    console.log('📈 Current category stats from normalized table:');
    statsResult.rows.forEach(row => {
      console.log(`  - ${row.property_type}: ${row.count}`);
    });
    
    // Test fallback query from original table
    const fallbackResult = await pool.query(`
      SELECT 
        CASE 
          WHEN property_category LIKE '%شقق%' OR property_category LIKE '%دوبلكس%' OR property_category LIKE '%روف%' THEN 'Compound Apartments'
          WHEN property_category LIKE '%فيلا%' OR property_category LIKE '%تاون%' OR property_category LIKE '%توين%' THEN 'Independent Villas'
          WHEN property_category LIKE '%أرض%' OR property_category LIKE '%اراضي%' THEN 'Land & Local Villas'
          WHEN property_category LIKE '%محل%' OR property_category LIKE '%اداري%' THEN 'Commercial & Administrative'
          WHEN property_category LIKE '%ساحل%' THEN 'North Coast'
          WHEN property_category LIKE '%سخنة%' THEN 'Ain Sokhna'
          WHEN property_category LIKE '%رحاب%' OR property_category LIKE '%مدينتي%' THEN 'Rehab & Madinaty'
          ELSE 'Various Areas'
        END as property_type,
        COUNT(*) as count
      FROM properties 
      WHERE property_category IS NOT NULL 
        AND property_category != ''
        AND property_category NOT LIKE '%.jpg%'
      GROUP BY property_type
      ORDER BY count DESC
      LIMIT 8
    `);
    
    console.log('📈 Fallback category stats from original table:');
    fallbackResult.rows.forEach(row => {
      console.log(`  - ${row.property_type}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

testDatabaseStatus();
