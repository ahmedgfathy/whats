const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Custom migration script for Contaboo SQLite to Neon PostgreSQL
async function migrateContabooToNeon() {
  console.log('🚀 Starting Contaboo migration from SQLite to Neon PostgreSQL...');
  
  // Initialize SQLite database
  const dbPath = path.join(__dirname, '../data/real_estate_chat.db');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ SQLite database not found at:', dbPath);
    process.exit(1);
  }
  
  const sqlite = new Database(dbPath);
  
  // Initialize Neon PostgreSQL connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔗 Connected to Neon PostgreSQL database');
    
    // Create tables based on your SQLite structure
    console.log('📋 Creating PostgreSQL tables...');
    
    // Create properties table based on properties_import structure
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id SERIAL PRIMARY KEY,
        property_name TEXT,
        property_number TEXT,
        property_category TEXT,
        created_time TEXT,
        regions TEXT,
        modified_time TEXT,
        floor_no TEXT,
        property_type TEXT,
        building TEXT,
        bedroom TEXT,
        land_garden TEXT,
        bathroom TEXT,
        finished TEXT,
        last_modified_by TEXT,
        update_unit TEXT,
        property_offered_by TEXT,
        name TEXT,
        mobile_no TEXT,
        tel TEXT,
        unit_price TEXT,
        payment_type TEXT,
        deposit TEXT,
        payment TEXT,
        paid_every TEXT,
        amount TEXT,
        description TEXT,
        zain_house_sales_notes TEXT,
        sales TEXT,
        handler TEXT,
        property_image TEXT,
        imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create chat_messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT,
        property_type TEXT,
        keywords TEXT,
        location TEXT,
        price TEXT,
        agent_phone TEXT,
        agent_description TEXT,
        full_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sender, message)
      )
    `);
    
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(regions)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_property_type ON chat_messages(property_type)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_location ON chat_messages(location)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages(sender)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON chat_messages(timestamp)`);
    
    console.log('✅ PostgreSQL tables created successfully');
    
    // Migrate data
    console.log('📊 Starting data migration...');
    
    // Migrate properties_import to properties
    const properties = sqlite.prepare('SELECT * FROM properties_import').all();
    if (properties.length > 0) {
      console.log(`🔄 Migrating ${properties.length} properties...`);
      for (const property of properties) {
        await pool.query(`
          INSERT INTO properties (
            property_name, property_number, property_category, created_time, regions,
            modified_time, floor_no, property_type, building, bedroom, land_garden,
            bathroom, finished, last_modified_by, update_unit, property_offered_by,
            name, mobile_no, tel, unit_price, payment_type, deposit, payment,
            paid_every, amount, description, zain_house_sales_notes, sales, handler,
            property_image, imported_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
          ) ON CONFLICT DO NOTHING
        `, [
          property.Property_Name, property.Property_Number, property.Property_Category,
          property.Created_Time, property.Regions, property.Modified_Time, property.Floor_No_,
          property.Property_Type, property.Building, property.Bedroom, property.Land_Garden,
          property.Bathroom, property.Finished, property.Last_Modified_By, property.Update_unit,
          property.Property_Offered_By, property.Name, property.Mobile_No, property.Tel,
          property.Unit_Price, property.Payment_Type, property.Deposit, property.Payment,
          property.Paid_Every, property.A_mount, property.Description, property.Zain_House_Sales_Notes,
          property.Sales, property.Handler, property.Property_Image, property.imported_at
        ]);
      }
    }
    
    // Migrate chat_messages
    const chatMessages = sqlite.prepare('SELECT * FROM chat_messages').all();
    if (chatMessages.length > 0) {
      console.log(`🔄 Migrating ${chatMessages.length} chat messages...`);
      let migrated = 0;
      for (const message of chatMessages) {
        try {
          await pool.query(`
            INSERT INTO chat_messages (
              sender, message, timestamp, property_type, keywords, location,
              price, agent_phone, agent_description, full_description, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (sender, message) DO NOTHING
          `, [
            message.sender, message.message, message.timestamp, message.property_type,
            message.keywords, message.location, message.price, message.agent_phone,
            message.agent_description, message.full_description, message.created_at
          ]);
          migrated++;
        } catch (error) {
          console.log(`⚠️  Skipping duplicate message: ${error.message}`);
        }
      }
      console.log(`✅ Migrated ${migrated} chat messages`);
    }
    
    // Migrate users if they exist
    try {
      const users = sqlite.prepare('SELECT * FROM users').all();
      if (users.length > 0) {
        console.log(`🔄 Migrating ${users.length} users...`);
        for (const user of users) {
          await pool.query(`
            INSERT INTO users (name, email, phone, created_at) 
            VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING
          `, [user.name, user.email, user.phone, user.created_at]);
        }
      }
    } catch (error) {
      console.log('📝 No users table found, skipping user migration');
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('🔍 Verifying data integrity...');
    
    // Verify migration
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM properties) as properties,
        (SELECT COUNT(*) FROM chat_messages) as messages,
        (SELECT COUNT(*) FROM users) as users
    `);
    
    console.log('📊 Migration Summary:');
    console.log(`   Properties: ${stats.rows[0].properties}`);
    console.log(`   Chat Messages: ${stats.rows[0].messages}`);
    console.log(`   Users: ${stats.rows[0].users}`);
    
    // Test some queries
    console.log('🧪 Testing queries...');
    
    const propertyTypes = await pool.query(`
      SELECT property_type, COUNT(*) as count 
      FROM properties 
      WHERE property_type IS NOT NULL 
      GROUP BY property_type 
      ORDER BY count DESC 
      LIMIT 5
    `);
    
    console.log('🏠 Top property types:');
    propertyTypes.rows.forEach(row => {
      console.log(`   ${row.property_type}: ${row.count}`);
    });
    
    const messageStats = await pool.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT sender) as unique_senders,
        COUNT(DISTINCT property_type) as property_types
      FROM chat_messages
    `);
    
    console.log('💬 Message statistics:');
    console.log(`   Total messages: ${messageStats.rows[0].total_messages}`);
    console.log(`   Unique senders: ${messageStats.rows[0].unique_senders}`);
    console.log(`   Property types mentioned: ${messageStats.rows[0].property_types}`);
    
    console.log('🎉 Migration to Neon PostgreSQL completed successfully!');
    
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
  migrateContabooToNeon().catch(console.error);
}

module.exports = migrateContabooToNeon;
