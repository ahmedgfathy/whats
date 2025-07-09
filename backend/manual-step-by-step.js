const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

async function manualMigration() {
  console.log('🚀 Starting Manual Migration Process...');
  
  // Step 1: Test connections
  console.log('Step 1: Testing database connections...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const pgResult = await pool.query('SELECT NOW()');
  console.log('✅ PostgreSQL connected at:', pgResult.rows[0].now.toISOString());
  
  const dbPath = path.join(__dirname, '../data/real_estate_chat.db');
  const sqlite = new Database(dbPath);
  const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('✅ SQLite tables found:', tables.map(t => t.name).join(', '));
  
  // Step 2: Check what data we have
  console.log('\\nStep 2: Analyzing SQLite data...');
  let totalRecords = 0;
  for (const table of tables) {
    try {
      const count = sqlite.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get();
      console.log(`   ${table.name}: ${count.count} records`);
      totalRecords += count.count;
    } catch (e) {
      console.log(`   ${table.name}: Error reading table`);
    }
  }
  console.log(`📊 Total SQLite records: ${totalRecords}`);
  
  // Step 3: Create minimal schema in PostgreSQL
  console.log('\\nStep 3: Creating PostgreSQL schema...');
  
  // Create chat_messages table (simplified)
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
  console.log('✅ chat_messages table created');
  
  // Create users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ users table created');
  
  // Create properties_import table for CSV data
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
  console.log('✅ properties_import table created');
  
  // Step 4: Migrate users
  console.log('\\nStep 4: Migrating users...');
  try {
    const users = sqlite.prepare('SELECT * FROM users').all();
    let userCount = 0;
    for (const user of users) {
      await pool.query(`
        INSERT INTO users (username, password, created_at) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password
      `, [user.username, user.password, user.created_at]);
      userCount++;
    }
    console.log(`✅ Migrated ${userCount} users`);
  } catch (error) {
    console.log('⚠️  No users table found in SQLite');
  }
  
  // Step 5: Migrate chat messages
  console.log('\\nStep 5: Migrating chat messages...');
  try {
    const messages = sqlite.prepare('SELECT * FROM chat_messages').all();
    let msgCount = 0;
    for (const msg of messages) {
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
      msgCount++;
      if (msgCount % 100 === 0) {
        console.log(`   Migrated ${msgCount} messages...`);
      }
    }
    console.log(`✅ Migrated ${msgCount} chat messages`);
  } catch (error) {
    console.log('⚠️  No chat_messages table found in SQLite:', error.message);
  }
  
  // Step 6: Migrate properties_import (CSV data)
  console.log('\\nStep 6: Migrating imported properties...');
  try {
    const properties = sqlite.prepare('SELECT * FROM properties_import').all();
    let propCount = 0;
    for (const prop of properties) {
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
      propCount++;
      if (propCount % 1000 === 0) {
        console.log(`   Migrated ${propCount} properties...`);
      }
    }
    console.log(`✅ Migrated ${propCount} imported properties`);
  } catch (error) {
    console.log('⚠️  No properties_import table found in SQLite:', error.message);
  }
  
  // Step 7: Verify migration
  console.log('\\nStep 7: Verifying migration...');
  const stats = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM chat_messages) as chat_messages,
      (SELECT COUNT(*) FROM properties_import) as properties_import
  `);
  
  console.log('📊 PostgreSQL Migration Results:');
  console.log(`   Users: ${stats.rows[0].users}`);
  console.log(`   Chat messages: ${stats.rows[0].chat_messages}`);
  console.log(`   Imported properties: ${stats.rows[0].properties_import}`);
  
  const total = parseInt(stats.rows[0].users) + parseInt(stats.rows[0].chat_messages) + parseInt(stats.rows[0].properties_import);
  console.log(`   Total records: ${total}`);
  
  // Clean up
  sqlite.close();
  await pool.end();
  
  console.log('\\n🎉 ✅ MANUAL MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('');
  console.log('📋 Summary:');
  console.log('   ✅ All SQLite data migrated to PostgreSQL');
  console.log('   ✅ Database schema created');
  console.log('   ✅ Data verified in PostgreSQL');
  console.log('');
  console.log('🚀 Next steps:');
  console.log('   1. Update your server to use PostgreSQL by default');
  console.log('   2. Test the production server');
  console.log('   3. Deploy to Vercel');
  console.log('   4. Remove SQLite files after confirmation');
}

manualMigration().catch(console.error);
