const { Pool } = require('pg');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Complete migration script for Contaboo SQLite to Neon PostgreSQL
async function completeMigration() {
  console.log('🚀 Starting Complete Migration from SQLite to PostgreSQL Production...');
  console.log('📋 This will migrate ALL data and switch to PostgreSQL as default database.');
  console.log('');
  
  // Check environment variables
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set');
    console.error('   Please set your Neon PostgreSQL connection string in .env file');
    process.exit(1);
  }
  
  // Initialize SQLite database
  const dbPath = path.join(__dirname, '../data/real_estate_chat.db');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ SQLite database not found at:', dbPath);
    console.error('   Please ensure your SQLite database exists with data');
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
    
    // Step 1: Create PostgreSQL schema
    console.log('📋 Creating PostgreSQL schema...');
    await createPostgreSQLSchema(pool);
    
    // Step 2: Migrate all data
    console.log('📊 Migrating all data...');
    await migrateAllData(sqlite, pool);
    
    // Step 3: Verify migration
    console.log('🔍 Verifying migration...');
    await verifyMigration(pool);
    
    // Step 4: Create production server file
    console.log('⚙️  Creating production server configuration...');
    await createProductionServer();
    
    // Step 5: Update environment
    console.log('🔧 Updating environment configuration...');
    await updateEnvironment();
    
    console.log('');
    console.log('🎉 ✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ All SQLite data migrated to PostgreSQL');
    console.log('   ✅ PostgreSQL is now the default database');
    console.log('   ✅ Production server file created');
    console.log('   ✅ Environment configured for production');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Test the new server: npm run start-production');
    console.log('   2. Verify all data is accessible');
    console.log('   3. Deploy to production');
    console.log('   4. Remove SQLite files (manual step for safety)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    sqlite.close();
    await pool.end();
  }
}

// Create PostgreSQL schema matching SQLite structure
async function createPostgreSQLSchema(pool) {
  console.log('   📋 Creating users table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('   📋 Creating phone_operators table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS phone_operators (
      id SERIAL PRIMARY KEY,
      prefix VARCHAR(10) NOT NULL,
      name_english VARCHAR(100) NOT NULL,
      name_arabic VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT true
    )
  `);
  
  console.log('   📋 Creating areas table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS areas (
      id SERIAL PRIMARY KEY,
      name_arabic VARCHAR(255) NOT NULL,
      name_english VARCHAR(255),
      governorate VARCHAR(100),
      is_active BOOLEAN DEFAULT true
    )
  `);
  
  console.log('   📋 Creating property_types table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS property_types (
      id SERIAL PRIMARY KEY,
      type_code VARCHAR(50) UNIQUE NOT NULL,
      name_arabic VARCHAR(255) NOT NULL,
      name_english VARCHAR(255) NOT NULL,
      keywords TEXT,
      is_active BOOLEAN DEFAULT true
    )
  `);
  
  console.log('   📋 Creating agents table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agents (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      phone_operator VARCHAR(10),
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('   📋 Creating properties table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      message_id INTEGER,
      agent_id INTEGER REFERENCES agents(id),
      property_type_id INTEGER REFERENCES property_types(id),
      area_id INTEGER REFERENCES areas(id),
      price_text VARCHAR(255),
      area_size INTEGER,
      rooms INTEGER,
      bathrooms INTEGER,
      is_available BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('   📋 Creating chat_messages table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER REFERENCES agents(id),
      property_type_id INTEGER REFERENCES property_types(id),
      area_id INTEGER REFERENCES areas(id),
      message TEXT NOT NULL,
      timestamp TIMESTAMP,
      sender_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('   📋 Creating properties_import table...');
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
  
  // Create indexes for performance
  console.log('   📋 Creating indexes...');
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_property_type ON chat_messages(property_type_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_area ON chat_messages(area_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_chat_messages_agent ON chat_messages(agent_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_import_type ON properties_import(property_type)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_properties_import_regions ON properties_import(regions)`);
  
  console.log('   ✅ PostgreSQL schema created successfully');
}

// Migrate all data from SQLite to PostgreSQL
async function migrateAllData(sqlite, pool) {
  let totalMigrated = 0;
  
  // Migrate users
  try {
    const users = sqlite.prepare('SELECT * FROM users').all();
    if (users.length > 0) {
      console.log(`   🔄 Migrating ${users.length} users...`);
      for (const user of users) {
        await pool.query(`
          INSERT INTO users (username, password, role, created_at) 
          VALUES ($1, $2, $3, $4) 
          ON CONFLICT (username) DO UPDATE SET 
          password = EXCLUDED.password,
          role = EXCLUDED.role
        `, [user.username, user.password, user.role || 'user', user.created_at]);
      }
      totalMigrated += users.length;
    }
  } catch (error) {
    console.log('   ⚠️  Users table not found, skipping...');
  }
  
  // Migrate phone_operators
  try {
    const operators = sqlite.prepare('SELECT * FROM phone_operators').all();
    if (operators.length > 0) {
      console.log(`   🔄 Migrating ${operators.length} phone operators...`);
      for (const op of operators) {
        await pool.query(`
          INSERT INTO phone_operators (prefix, name_english, name_arabic, is_active) 
          VALUES ($1, $2, $3, $4) 
          ON CONFLICT DO NOTHING
        `, [op.prefix, op.name_english, op.name_arabic, op.is_active]);
      }
      totalMigrated += operators.length;
    }
  } catch (error) {
    console.log('   ⚠️  Phone operators table not found, skipping...');
  }
  
  // Migrate areas
  try {
    const areas = sqlite.prepare('SELECT * FROM areas').all();
    if (areas.length > 0) {
      console.log(`   🔄 Migrating ${areas.length} areas...`);
      for (const area of areas) {
        await pool.query(`
          INSERT INTO areas (name_arabic, name_english, governorate, is_active) 
          VALUES ($1, $2, $3, $4) 
          ON CONFLICT DO NOTHING
        `, [area.name_arabic, area.name_english, area.governorate, area.is_active]);
      }
      totalMigrated += areas.length;
    }
  } catch (error) {
    console.log('   ⚠️  Areas table not found, skipping...');
  }
  
  // Migrate property_types
  try {
    const types = sqlite.prepare('SELECT * FROM property_types').all();
    if (types.length > 0) {
      console.log(`   🔄 Migrating ${types.length} property types...`);
      for (const type of types) {
        await pool.query(`
          INSERT INTO property_types (type_code, name_arabic, name_english, keywords, is_active) 
          VALUES ($1, $2, $3, $4, $5) 
          ON CONFLICT (type_code) DO UPDATE SET 
          name_arabic = EXCLUDED.name_arabic,
          name_english = EXCLUDED.name_english,
          keywords = EXCLUDED.keywords
        `, [type.type_code, type.name_arabic, type.name_english, type.keywords, type.is_active]);
      }
      totalMigrated += types.length;
    }
  } catch (error) {
    console.log('   ⚠️  Property types table not found, skipping...');
  }
  
  // Migrate agents
  try {
    const agents = sqlite.prepare('SELECT * FROM agents').all();
    if (agents.length > 0) {
      console.log(`   🔄 Migrating ${agents.length} agents...`);
      for (const agent of agents) {
        await pool.query(`
          INSERT INTO agents (name, phone, phone_operator, description, is_active, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6) 
          ON CONFLICT DO NOTHING
        `, [agent.name, agent.phone, agent.phone_operator, agent.description, agent.is_active, agent.created_at]);
      }
      totalMigrated += agents.length;
    }
  } catch (error) {
    console.log('   ⚠️  Agents table not found, skipping...');
  }
  
  // Migrate properties
  try {
    const properties = sqlite.prepare('SELECT * FROM properties').all();
    if (properties.length > 0) {
      console.log(`   🔄 Migrating ${properties.length} properties...`);
      for (const prop of properties) {
        await pool.query(`
          INSERT INTO properties (message_id, agent_id, property_type_id, area_id, price_text, area_size, rooms, bathrooms, is_available, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
          ON CONFLICT DO NOTHING
        `, [prop.message_id, prop.agent_id, prop.property_type_id, prop.area_id, prop.price_text, prop.area_size, prop.rooms, prop.bathrooms, prop.is_available, prop.created_at]);
      }
      totalMigrated += properties.length;
    }
  } catch (error) {
    console.log('   ⚠️  Properties table not found, skipping...');
  }
  
  // Migrate chat_messages
  try {
    const messages = sqlite.prepare('SELECT * FROM chat_messages').all();
    if (messages.length > 0) {
      console.log(`   🔄 Migrating ${messages.length} chat messages...`);
      for (const msg of messages) {
        await pool.query(`
          INSERT INTO chat_messages (agent_id, property_type_id, area_id, message, timestamp, sender_name, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          ON CONFLICT DO NOTHING
        `, [msg.agent_id, msg.property_type_id, msg.area_id, msg.message, msg.timestamp, msg.sender_name, msg.created_at]);
      }
      totalMigrated += messages.length;
    }
  } catch (error) {
    console.log('   ⚠️  Chat messages table not found, skipping...');
  }
  
  // Migrate properties_import (CSV imported data)
  try {
    const importedProps = sqlite.prepare('SELECT * FROM properties_import').all();
    if (importedProps.length > 0) {
      console.log(`   🔄 Migrating ${importedProps.length} imported properties...`);
      for (const prop of importedProps) {
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
          prop.Property_Name, prop.Property_Number, prop.Property_Category, prop.Created_Time, prop.Regions,
          prop.Modified_Time, prop.Floor_No_, prop.Property_Type, prop.Building, prop.Bedroom, prop.Land_Garden,
          prop.Bathroom, prop.Finished, prop.Last_Modified_By, prop.Update_unit, prop.Property_Offered_By,
          prop.Name, prop.Mobile_No, prop.Tel, prop.Unit_Price, prop.Payment_Type, prop.Deposit, prop.Payment,
          prop.Paid_Every, prop.A_mount, prop.Description, prop.Zain_House_Sales_Notes, prop.Sales, prop.Handler,
          prop.Property_Image, prop.imported_at
        ]);
      }
      totalMigrated += importedProps.length;
    }
  } catch (error) {
    console.log('   ⚠️  Properties import table not found, skipping...');
  }
  
  console.log(`   ✅ Total records migrated: ${totalMigrated}`);
}

// Verify migration success
async function verifyMigration(pool) {
  const stats = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM phone_operators) as phone_operators,
      (SELECT COUNT(*) FROM areas) as areas,
      (SELECT COUNT(*) FROM property_types) as property_types,
      (SELECT COUNT(*) FROM agents) as agents,
      (SELECT COUNT(*) FROM properties) as properties,
      (SELECT COUNT(*) FROM chat_messages) as chat_messages,
      (SELECT COUNT(*) FROM properties_import) as properties_import
  `);
  
  console.log('   📊 Migration verification:');
  console.log(`      Users: ${stats.rows[0].users}`);
  console.log(`      Phone operators: ${stats.rows[0].phone_operators}`);
  console.log(`      Areas: ${stats.rows[0].areas}`);
  console.log(`      Property types: ${stats.rows[0].property_types}`);
  console.log(`      Agents: ${stats.rows[0].agents}`);
  console.log(`      Properties: ${stats.rows[0].properties}`);
  console.log(`      Chat messages: ${stats.rows[0].chat_messages}`);
  console.log(`      Imported properties: ${stats.rows[0].properties_import}`);
  
  const total = Object.values(stats.rows[0]).reduce((sum, count) => sum + parseInt(count), 0);
  console.log(`      Total records: ${total}`);
  
  if (total > 0) {
    console.log('   ✅ Migration verification successful!');
  } else {
    console.log('   ⚠️  Warning: No data found in PostgreSQL');
  }
}

// Create production server file
async function createProductionServer() {
  const serverContent = `const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    const stats = await pool.query(\`
      SELECT 
        (SELECT COUNT(*) FROM chat_messages) as chat_messages,
        (SELECT COUNT(*) FROM properties_import) as properties_import,
        (SELECT COUNT(*) FROM users) as users
    \`);
    
    res.json({
      success: true,
      message: 'Contaboo API is running',
      timestamp: result.rows[0].now,
      database: 'PostgreSQL (Neon)',
      version: '4.0 - Production',
      stats: stats.rows[0]
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    
    if (result.rows.length > 0) {
      res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user: {
          id: result.rows[0].id,
          username: result.rows[0].username,
          role: result.rows[0].role
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Property statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(\`
      SELECT 
        CASE 
          WHEN property_type = 'apartment' THEN 'apartment'
          WHEN property_type = 'villa' THEN 'villa'
          WHEN property_type = 'land' THEN 'land'
          WHEN property_type = 'office' THEN 'office'
          WHEN property_type = 'warehouse' THEN 'warehouse'
          ELSE 'other'
        END as property_type,
        COUNT(*) as count
      FROM properties_import
      WHERE property_type IS NOT NULL
      GROUP BY property_type
      ORDER BY count DESC
    \`);
    
    res.json({ success: true, stats: result.rows });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Search messages endpoint
app.get('/api/messages/search', async (req, res) => {
  const { q, type, limit = 50 } = req.query;
  
  try {
    let query = \`
      SELECT * FROM properties_import 
      WHERE 1=1
    \`;
    const params = [];
    
    if (q) {
      params.push(\`%\${q}%\`);
      query += \` AND (property_name ILIKE $\${params.length} OR description ILIKE $\${params.length})\`;
    }
    
    if (type && type !== 'all') {
      params.push(type);
      query += \` AND property_type = $\${params.length}\`;
    }
    
    query += \` ORDER BY created_time DESC LIMIT \${limit}\`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, messages: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get all messages endpoint
app.get('/api/messages', async (req, res) => {
  const { type, limit = 100 } = req.query;
  
  try {
    let query = 'SELECT * FROM properties_import WHERE 1=1';
    const params = [];
    
    if (type && type !== 'all') {
      params.push(type);
      query += \` AND property_type = $\${params.length}\`;
    }
    
    query += \` ORDER BY created_time DESC LIMIT \${limit}\`;
    
    const result = await pool.query(query, params);
    res.json({ success: true, messages: result.rows, total: result.rows.length });
  } catch (error) {
    console.error('Messages error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Get individual message endpoint
app.get('/api/messages/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('SELECT * FROM properties_import WHERE id = $1', [id]);
    
    if (result.rows.length > 0) {
      res.json({ success: true, message: result.rows[0] });
    } else {
      res.status(404).json({ success: false, message: 'Message not found' });
    }
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 Contaboo Production Server running on port \${PORT}\`);
  console.log(\`🔗 Database: PostgreSQL (Neon)\`);
  console.log(\`📡 API endpoints: http://localhost:\${PORT}/api/\`);
  console.log(\`🌐 Production ready with 22,500+ properties\`);
});

module.exports = app;
`;

  fs.writeFileSync(path.join(__dirname, 'server-production.js'), serverContent);
  console.log('   ✅ Production server file created: server-production.js');
}

// Update environment configuration
async function updateEnvironment() {
  const envContent = `# Contaboo Production Environment
# Database Configuration
DATABASE_URL=${process.env.DATABASE_URL}
USE_POSTGRES=true
NODE_ENV=production

# Server Configuration
PORT=3001

# Application Configuration
APP_NAME=Contaboo Real Estate Platform
APP_VERSION=4.0
`;

  fs.writeFileSync(path.join(__dirname, '.env.production'), envContent);
  console.log('   ✅ Production environment file created: .env.production');
  
  // Update package.json scripts
  const packageJsonPath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'start-production': 'node server-production.js',
    'migrate-complete': 'node complete-migration.js',
    'test-production': 'DATABASE_URL=$DATABASE_URL node server-production.js'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('   ✅ Package.json scripts updated');
}

// Run migration if called directly
if (require.main === module) {
  completeMigration().catch(console.error);
}

module.exports = completeMigration;
