const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkTableStructure() {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      ORDER BY ordinal_position
    `);
    
    console.log('Properties table columns:');
    result.rows.forEach(row => {
      console.log(`${row.column_name} - ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();
