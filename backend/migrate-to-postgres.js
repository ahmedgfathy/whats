const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Try to load better-sqlite3, but don't fail if it's not available
let Database;
try {
  Database = require('better-sqlite3');
} catch (error) {
  console.error('❌ SQLite3 not available. Please install it first:');
  console.error('   npm install better-sqlite3');
  process.exit(1);
}

// Migration script to transfer data from SQLite to PostgreSQL
async function migrateToPostgres() {
  console.log('🔄 Starting migration from SQLite to PostgreSQL...');
  
  // Initialize SQLite database
  const dbPath = path.join(__dirname, '../database/real_estate.db');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ SQLite database not found at:', dbPath);
    process.exit(1);
  }
  
  const sqlite = new Database(dbPath);
  
  // Initialize PostgreSQL connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  try {
    // Create tables in PostgreSQL
    console.log('📋 Creating tables in PostgreSQL...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(15,2),
        location VARCHAR(255),
        bedrooms INTEGER,
        bathrooms INTEGER,
        area_sqft INTEGER,
        property_type VARCHAR(50),
        listing_type VARCHAR(20),
        agent_name VARCHAR(255),
        agent_phone VARCHAR(20),
        agent_email VARCHAR(255),
        images TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        sender_type VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for better performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_property ON messages(property_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_listing ON properties(listing_type)`);
    
    console.log('✅ Tables created successfully');
    
    // Migrate data
    console.log('📊 Migrating data...');
    
    // Migrate users
    const users = sqlite.prepare('SELECT * FROM users').all();
    if (users.length > 0) {
      console.log(`🔄 Migrating ${users.length} users...`);
      for (const user of users) {
        await pool.query(
          'INSERT INTO users (name, email, phone, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
          [user.name, user.email, user.phone, user.created_at]
        );
      }
    }
    
    // Migrate properties
    const properties = sqlite.prepare('SELECT * FROM properties').all();
    if (properties.length > 0) {
      console.log(`🔄 Migrating ${properties.length} properties...`);
      for (const property of properties) {
        await pool.query(
          `INSERT INTO properties (title, description, price, location, bedrooms, bathrooms, area_sqft, 
           property_type, listing_type, agent_name, agent_phone, agent_email, images, created_at, updated_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [property.title, property.description, property.price, property.location, property.bedrooms,
           property.bathrooms, property.area_sqft, property.property_type, property.listing_type,
           property.agent_name, property.agent_phone, property.agent_email, property.images,
           property.created_at, property.updated_at]
        );
      }
    }
    
    // Migrate conversations
    const conversations = sqlite.prepare('SELECT * FROM conversations').all();
    if (conversations.length > 0) {
      console.log(`🔄 Migrating ${conversations.length} conversations...`);
      for (const conversation of conversations) {
        await pool.query(
          'INSERT INTO conversations (user_id, title, created_at, updated_at) VALUES ($1, $2, $3, $4)',
          [conversation.user_id, conversation.title, conversation.created_at, conversation.updated_at]
        );
      }
    }
    
    // Migrate messages
    const messages = sqlite.prepare('SELECT * FROM messages').all();
    if (messages.length > 0) {
      console.log(`🔄 Migrating ${messages.length} messages...`);
      for (const message of messages) {
        await pool.query(
          'INSERT INTO messages (conversation_id, sender_type, content, property_id, created_at) VALUES ($1, $2, $3, $4, $5)',
          [message.conversation_id, message.sender_type, message.content, message.property_id, message.created_at]
        );
      }
    }
    
    // Migrate inquiries
    const inquiries = sqlite.prepare('SELECT * FROM inquiries').all();
    if (inquiries.length > 0) {
      console.log(`🔄 Migrating ${inquiries.length} inquiries...`);
      for (const inquiry of inquiries) {
        await pool.query(
          'INSERT INTO inquiries (user_id, property_id, message, status, created_at) VALUES ($1, $2, $3, $4, $5)',
          [inquiry.user_id, inquiry.property_id, inquiry.message, inquiry.status, inquiry.created_at]
        );
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('🔍 Verifying data integrity...');
    
    // Verify migration
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM properties) as properties,
        (SELECT COUNT(*) FROM conversations) as conversations,
        (SELECT COUNT(*) FROM messages) as messages,
        (SELECT COUNT(*) FROM inquiries) as inquiries
    `);
    
    console.log('📊 Migration Summary:');
    console.log(`   Users: ${stats.rows[0].users}`);
    console.log(`   Properties: ${stats.rows[0].properties}`);
    console.log(`   Conversations: ${stats.rows[0].conversations}`);
    console.log(`   Messages: ${stats.rows[0].messages}`);
    console.log(`   Inquiries: ${stats.rows[0].inquiries}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    sqlite.close();
    await pool.end();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToPostgres().catch(console.error);
}

module.exports = migrateToPostgres;
