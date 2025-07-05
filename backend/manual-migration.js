const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

console.log('🚀 Starting manual migration...');

// Configure PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,  // 30 second timeout
  idleTimeoutMillis: 30000,
  max: 10
});

async function manualMigration() {
  try {
    // Test connection first
    console.log('🔍 Testing PostgreSQL connection...');
    const client = await pool.connect();
    console.log('✅ Connected to Neon PostgreSQL');
    client.release();
    
    // Create tables
    console.log('📋 Creating tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        property_name TEXT,
        property_type TEXT,
        regions TEXT,
        unit_price TEXT,
        mobile_no TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT,
        property_type TEXT,
        location TEXT,
        price TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tables created');
    
    // Load SQLite data
    console.log('📊 Loading SQLite data...');
    const dbPath = path.join(__dirname, '../data/real_estate_chat.db');
    const sqlite = new Database(dbPath);
    
    const chatMessages = sqlite.prepare('SELECT * FROM chat_messages LIMIT 100').all();
    console.log(`Found ${chatMessages.length} messages to migrate`);
    
    // Insert messages in batches
    let inserted = 0;
    for (const message of chatMessages) {
      try {
        await pool.query(`
          INSERT INTO chat_messages (sender, message, timestamp, property_type, location, price)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [message.sender, message.message, message.timestamp, message.property_type, message.location, message.price]);
        inserted++;
        
        if (inserted % 10 === 0) {
          console.log(`Inserted ${inserted} messages...`);
        }
      } catch (error) {
        console.log(`⚠️  Error inserting message ${message.id}: ${error.message}`);
      }
    }
    
    console.log(`✅ Migrated ${inserted} messages`);
    
    // Verify
    const result = await pool.query('SELECT COUNT(*) FROM chat_messages');
    console.log(`✅ Total messages in PostgreSQL: ${result.rows[0].count}`);
    
    sqlite.close();
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await pool.end();
    console.log('🏁 Migration process completed');
  }
}

manualMigration().catch(console.error);
