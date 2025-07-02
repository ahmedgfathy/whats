import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Create database directory if it doesn't exist
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'real_estate_chat.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Chat messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT,
      property_type TEXT,
      keywords TEXT,
      location TEXT,
      price TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default user
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (username, password) 
    VALUES (?, ?)
  `);
  insertUser.run('xinreal', 'zerocall');
};

// Initialize database
createTables();

// Helper functions
export const insertMessage = (messageData) => {
  const stmt = db.prepare(`
    INSERT INTO chat_messages (sender, message, timestamp, property_type, keywords, location, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    messageData.sender,
    messageData.message,
    messageData.timestamp,
    messageData.property_type,
    messageData.keywords,
    messageData.location,
    messageData.price
  );
};

export const searchMessages = (searchTerm, propertyType = null, limit = 100) => {
  let query = `
    SELECT * FROM chat_messages 
    WHERE message LIKE ?
  `;
  let params = [`%${searchTerm}%`];
  
  if (propertyType && propertyType !== 'all') {
    query += ` AND property_type = ?`;
    params.push(propertyType);
  }
  
  query += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(limit);
  
  const stmt = db.prepare(query);
  return stmt.all(...params);
};

export const getAllMessages = (propertyType = null, limit = 100) => {
  let query = `SELECT * FROM chat_messages`;
  let params = [];
  
  if (propertyType && propertyType !== 'all') {
    query += ` WHERE property_type = ?`;
    params.push(propertyType);
  }
  
  query += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(limit);
  
  const stmt = db.prepare(query);
  return stmt.all(...params);
};

export const authenticateUser = (username, password) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?');
  return stmt.get(username, password);
};

export const getPropertyTypeStats = () => {
  const stmt = db.prepare(`
    SELECT 
      property_type,
      COUNT(*) as count
    FROM chat_messages 
    WHERE property_type IS NOT NULL
    GROUP BY property_type
  `);
  return stmt.all();
};

export default db;
