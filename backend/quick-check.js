// Quick database structure check
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    console.log('🔍 Checking database structure...');
    
    // List all tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check properties table
    const propertiesCount = await pool.query('SELECT COUNT(*) FROM properties');
    console.log(`\n📊 Properties table: ${propertiesCount.rows[0].count} records`);
    
    // Check for duplicates quickly
    const duplicateCheck = await pool.query(`
      SELECT COUNT(*) as total_records,
             COUNT(DISTINCT message) as unique_messages,
             COUNT(*) - COUNT(DISTINCT message) as potential_duplicates
      FROM properties 
      WHERE message IS NOT NULL AND message != ''
    `);
    
    const dup = duplicateCheck.rows[0];
    console.log(`📈 Duplicate analysis:`);
    console.log(`  - Total records with messages: ${dup.total_records}`);
    console.log(`  - Unique messages: ${dup.unique_messages}`);
    console.log(`  - Potential duplicates: ${dup.potential_duplicates}`);
    
    // Check normalized table if exists
    try {
      const normalizedCount = await pool.query('SELECT COUNT(*) FROM properties_normalized');
      console.log(`\n🔄 Normalized table: ${normalizedCount.rows[0].count} records`);
    } catch (error) {
      console.log('\n❌ Normalized table not accessible');
    }
    
    // Check if messages table exists
    const messageTableExists = tables.rows.find(t => t.table_name === 'messages');
    if (messageTableExists) {
      const messagesCount = await pool.query('SELECT COUNT(*) FROM messages');
      console.log(`\n💬 Messages table: ${messagesCount.rows[0].count} records`);
      
      // Sample message
      const sampleMessage = await pool.query('SELECT * FROM messages LIMIT 1');
      if (sampleMessage.rows.length > 0) {
        console.log('Sample message structure:', Object.keys(sampleMessage.rows[0]));
      }
    } else {
      console.log('\n❌ Messages table not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
