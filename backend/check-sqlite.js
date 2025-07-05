const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Check SQLite database structure
function checkSQLiteStructure() {
  const dbPath = path.join(__dirname, '../data/real_estate_chat.db');
  
  if (!fs.existsSync(dbPath)) {
    console.error('❌ Database not found at:', dbPath);
    return;
  }

  const sqlite = new Database(dbPath);
  
  try {
    // Get all tables
    const tables = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all();
    
    console.log('📋 Tables in database:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
      
      // Get table schema
      const schema = sqlite.prepare(`PRAGMA table_info(${table.name})`).all();
      console.log(`    Columns: ${schema.map(col => `${col.name} (${col.type})`).join(', ')}`);
      
      // Get row count
      const count = sqlite.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      console.log(`    Rows: ${count.count}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    sqlite.close();
  }
}

checkSQLiteStructure();
