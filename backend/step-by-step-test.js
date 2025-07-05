const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

console.log('🔍 Starting step-by-step migration...');

// Step 1: Test SQLite connection
console.log('Step 1: Testing SQLite...');
const dbPath = path.join(__dirname, '../data/real_estate_chat.db');
const sqlite = new Database(dbPath);

const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('✅ SQLite tables:', tables.map(t => t.name));

const messageCount = sqlite.prepare("SELECT COUNT(*) as count FROM chat_messages").get();
console.log('✅ SQLite messages count:', messageCount.count);

sqlite.close();

// Step 2: Test PostgreSQL connection
console.log('\nStep 2: Testing PostgreSQL...');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()')
  .then(result => {
    console.log('✅ PostgreSQL connected at:', result.rows[0].now);
    return pool.end();
  })
  .then(() => {
    console.log('✅ Connection test completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ PostgreSQL connection failed:', error.message);
    process.exit(1);
  });
