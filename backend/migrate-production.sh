#!/bin/bash

echo "🚀 Contaboo Migration to PostgreSQL Production"
echo "=============================================="

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "   Please ensure your Neon PostgreSQL connection is configured"
    exit 1
fi

# Install PostgreSQL client if not installed
echo "📦 Installing PostgreSQL client..."
npm install pg --save

# Run the migration
echo "🔄 Starting migration process..."
echo ""

cat > migrate-now.js << 'EOF'
const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

async function migrateNow() {
  console.log('🚀 Starting Migration Process...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL:', result.rows[0].now.toISOString());
    
    // Create schema
    console.log('📋 Creating PostgreSQL schema...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
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
        keywords TEXT,
        location TEXT,
        price TEXT,
        agent_phone TEXT,
        agent_description TEXT,
        full_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties_import (
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
    
    console.log('✅ Schema created');
    
    // Open SQLite
    const dbPath = path.join(__dirname, '../data/real_estate_chat.db');
    const sqlite = new Database(dbPath);
    
    // Insert default user
    console.log('👤 Creating default user...');
    await pool.query(`
      INSERT INTO users (username, password) 
      VALUES ('xinreal', 'zerocall') 
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
    `);
    
    // Migrate chat messages if they exist
    try {
      const messages = sqlite.prepare('SELECT * FROM chat_messages').all();
      if (messages.length > 0) {
        console.log(`🔄 Migrating ${messages.length} chat messages...`);
        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];
          await pool.query(`
            INSERT INTO chat_messages (
              sender, message, timestamp, property_type, keywords,
              location, price, agent_phone, agent_description,
              full_description, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT DO NOTHING
          `, [
            msg.sender, msg.message, msg.timestamp, msg.property_type,
            msg.keywords, msg.location, msg.price, msg.agent_phone,
            msg.agent_description, msg.full_description, msg.created_at
          ]);
          
          if ((i + 1) % 100 === 0) {
            console.log(`   Migrated ${i + 1} messages...`);
          }
        }
        console.log(`✅ ${messages.length} chat messages migrated`);
      }
    } catch (e) {
      console.log('⚠️  No chat_messages table found');
    }
    
    // Migrate properties_import if they exist
    try {
      const properties = sqlite.prepare('SELECT * FROM properties_import').all();
      if (properties.length > 0) {
        console.log(`🔄 Migrating ${properties.length} imported properties...`);
        for (let i = 0; i < properties.length; i++) {
          const prop = properties[i];
          await pool.query(`
            INSERT INTO properties_import (
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
            prop.Property_Name || prop.property_name,
            prop.Property_Number || prop.property_number,
            prop.Property_Category || prop.property_category,
            prop.Created_Time || prop.created_time,
            prop.Regions || prop.regions,
            prop.Modified_Time || prop.modified_time,
            prop.Floor_No_ || prop.floor_no,
            prop.Property_Type || prop.property_type,
            prop.Building || prop.building,
            prop.Bedroom || prop.bedroom,
            prop.Land_Garden || prop.land_garden,
            prop.Bathroom || prop.bathroom,
            prop.Finished || prop.finished,
            prop.Last_Modified_By || prop.last_modified_by,
            prop.Update_unit || prop.update_unit,
            prop.Property_Offered_By || prop.property_offered_by,
            prop.Name || prop.name,
            prop.Mobile_No || prop.mobile_no,
            prop.Tel || prop.tel,
            prop.Unit_Price || prop.unit_price,
            prop.Payment_Type || prop.payment_type,
            prop.Deposit || prop.deposit,
            prop.Payment || prop.payment,
            prop.Paid_Every || prop.paid_every,
            prop.A_mount || prop.amount,
            prop.Description || prop.description,
            prop.Zain_House_Sales_Notes || prop.zain_house_sales_notes,
            prop.Sales || prop.sales,
            prop.Handler || prop.handler,
            prop.Property_Image || prop.property_image,
            prop.imported_at || new Date().toISOString()
          ]);
          
          if ((i + 1) % 1000 === 0) {
            console.log(`   Migrated ${i + 1} properties...`);
          }
        }
        console.log(`✅ ${properties.length} imported properties migrated`);
      }
    } catch (e) {
      console.log('⚠️  No properties_import table found');
    }
    
    // Verify
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM chat_messages) as chat_messages,
        (SELECT COUNT(*) FROM properties_import) as properties_import
    `);
    
    console.log('');
    console.log('📊 Migration Results:');
    console.log(`   Users: ${stats.rows[0].users}`);
    console.log(`   Chat messages: ${stats.rows[0].chat_messages}`);
    console.log(`   Imported properties: ${stats.rows[0].properties_import}`);
    
    const total = parseInt(stats.rows[0].users) + parseInt(stats.rows[0].chat_messages) + parseInt(stats.rows[0].properties_import);
    console.log(`   Total records: ${total}`);
    
    sqlite.close();
    await pool.end();
    
    console.log('');
    console.log('🎉 ✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('🚀 Your database is now running on PostgreSQL');
    console.log('   All SQLite data has been migrated to Neon PostgreSQL');
    console.log('   You can now use server-production.js for production');
    console.log('');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateNow();
EOF

echo "🔄 Running migration script..."
node migrate-now.js

echo ""
echo "🧪 Testing production server..."
echo "   Starting server for 5 seconds to test..."

timeout 5s node server-production.js &
SERVER_PID=$!

sleep 2

# Test API endpoints
echo "📡 Testing API endpoints..."
curl -s http://localhost:3001/api/health | head -20

sleep 3

# Kill the test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "✅ Migration script completed!"
echo ""
echo "🚀 To start your production server:"
echo "   node server-production.js"
echo ""
echo "📋 Next steps:"
echo "   1. Test all endpoints work correctly"
echo "   2. Deploy to Vercel/production"
echo "   3. Remove SQLite files after confirming everything works"
echo ""

# Clean up
rm migrate-now.js
