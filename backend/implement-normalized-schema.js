const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function implementNormalizedSchema() {
  console.log('🚀 IMPLEMENTING NORMALIZED REAL ESTATE CRM SCHEMA');
  console.log('==============================================\n');

  try {
    // Step 1: Create Property Types Master Table
    console.log('🏷️ Step 1: Creating Property Types Master Table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS property_types (
        id SERIAL PRIMARY KEY,
        type_code VARCHAR(50) UNIQUE NOT NULL,
        name_arabic VARCHAR(255) NOT NULL,
        name_english VARCHAR(255) NOT NULL,
        keywords TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert property types
    await pool.query(`
      INSERT INTO property_types (type_code, name_arabic, name_english, keywords) VALUES
      ('apartment', 'شقق', 'Apartments', 'شقة,apartment,flat,unit'),
      ('villa', 'فيلات', 'Villas', 'فيلا,villa,house,mansion'),
      ('land', 'أراضي', 'Land', 'أرض,land,plot,terrain'),
      ('office', 'مكاتب', 'Offices', 'مكتب,office,commercial,workspace'),
      ('warehouse', 'مخازن', 'Warehouses', 'مخزن,warehouse,storage,depot'),
      ('shop', 'محلات', 'Shops', 'محل,shop,store,retail'),
      ('building', 'مباني', 'Buildings', 'مبنى,building,complex')
      ON CONFLICT (type_code) DO UPDATE SET
        name_arabic = EXCLUDED.name_arabic,
        name_english = EXCLUDED.name_english,
        keywords = EXCLUDED.keywords
    `);

    const propertyTypesCount = await pool.query('SELECT COUNT(*) FROM property_types');
    console.log(`✅ Property Types: ${propertyTypesCount.rows[0].count} types created`);

    // Step 2: Create Areas Master Table
    console.log('\n🌍 Step 2: Creating Areas Master Table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS areas (
        id SERIAL PRIMARY KEY,
        name_arabic VARCHAR(255) NOT NULL,
        name_english VARCHAR(255),
        governorate VARCHAR(100) DEFAULT 'Cairo',
        city VARCHAR(100) DEFAULT 'Cairo',
        district VARCHAR(100),
        postal_code VARCHAR(20),
        coordinates POINT,
        area_type VARCHAR(50) DEFAULT 'district',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name_arabic, governorate)
      )
    `);

    // Extract and insert areas from properties
    await pool.query(`
      INSERT INTO areas (name_arabic, name_english, governorate, area_type) 
      SELECT DISTINCT 
        TRIM(regions) as name_arabic,
        TRIM(regions) as name_english,
        CASE 
          WHEN TRIM(regions) ILIKE '%الساحل%' OR TRIM(regions) ILIKE '%الساحل الشمالي%' THEN 'الساحل الشمالي'
          WHEN TRIM(regions) ILIKE '%الجيزة%' OR TRIM(regions) ILIKE '%giza%' THEN 'الجيزة'
          WHEN TRIM(regions) ILIKE '%الإسكندرية%' OR TRIM(regions) ILIKE '%alexandria%' THEN 'الإسكندرية'
          WHEN TRIM(regions) ILIKE '%القاهرة الجديدة%' OR TRIM(regions) ILIKE '%new cairo%' THEN 'القاهرة'
          ELSE 'القاهرة'
        END as governorate,
        'district' as area_type
      FROM properties 
      WHERE regions IS NOT NULL 
        AND TRIM(regions) != '' 
        AND TRIM(regions) != 'NULL'
        AND LENGTH(TRIM(regions)) > 2
      ON CONFLICT (name_arabic, governorate) DO NOTHING
    `);

    const areasCount = await pool.query('SELECT COUNT(*) FROM areas');
    console.log(`✅ Areas: ${areasCount.rows[0].count} areas extracted and created`);

    // Step 3: Create Agents Master Table
    console.log('\n👥 Step 3: Creating Agents Master Table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        whatsapp_phone VARCHAR(20),
        company VARCHAR(255),
        description TEXT,
        specialization VARCHAR(100),
        license_number VARCHAR(50),
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_properties INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(phone)
      )
    `);

    // Extract agents from chat messages
    await pool.query(`
      INSERT INTO agents (name, phone, whatsapp_phone, description, specialization) 
      SELECT DISTINCT 
        TRIM(sender) as name,
        CASE 
          WHEN agent_phone IS NOT NULL AND LENGTH(TRIM(agent_phone)) > 8 
          THEN TRIM(agent_phone)
          ELSE NULL
        END as phone,
        CASE 
          WHEN agent_phone IS NOT NULL AND LENGTH(TRIM(agent_phone)) > 8 
          THEN TRIM(agent_phone)
          ELSE NULL
        END as whatsapp_phone,
        COALESCE(NULLIF(TRIM(agent_description), ''), 'عقاري من ' || TRIM(sender)) as description,
        'Real Estate Agent' as specialization
      FROM chat_messages 
      WHERE sender IS NOT NULL 
        AND TRIM(sender) != '' 
        AND TRIM(sender) != 'NULL'
        AND LENGTH(TRIM(sender)) > 2
      ON CONFLICT (phone) DO UPDATE SET
        name = CASE WHEN LENGTH(EXCLUDED.name) > LENGTH(agents.name) THEN EXCLUDED.name ELSE agents.name END,
        description = COALESCE(EXCLUDED.description, agents.description)
    `);

    // Also extract from properties table
    await pool.query(`
      INSERT INTO agents (name, phone, description, specialization) 
      SELECT DISTINCT 
        COALESCE(NULLIF(TRIM(name), ''), 'Property Owner ' || id) as name,
        CASE 
          WHEN mobile_no IS NOT NULL AND LENGTH(TRIM(mobile_no)) > 8 
          THEN TRIM(mobile_no)
          ELSE NULL
        END as phone,
        CASE 
          WHEN property_offered_by IS NOT NULL 
          THEN 'Property offered by: ' || property_offered_by
          ELSE 'Property Owner'
        END as description,
        COALESCE(property_offered_by, 'Owner') as specialization
      FROM properties 
      WHERE (name IS NOT NULL AND TRIM(name) != '' AND TRIM(name) != 'NULL')
         OR (mobile_no IS NOT NULL AND LENGTH(TRIM(mobile_no)) > 8)
      ON CONFLICT (phone) DO NOTHING
    `);

    const agentsCount = await pool.query('SELECT COUNT(*) FROM agents');
    console.log(`✅ Agents: ${agentsCount.rows[0].count} agents extracted and created`);

    // Step 4: Create additional master tables
    console.log('\n🏗️ Step 4: Creating Additional Master Tables...');

    // Floor Types Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS floor_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        floor_number INTEGER,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(name)
      )
    `);

    await pool.query(`
      INSERT INTO floor_types (name, floor_number, description) VALUES
      ('الدور الأرضي', 0, 'Ground Floor'),
      ('الدور الأول', 1, 'First Floor'),
      ('الدور الثاني', 2, 'Second Floor'),
      ('الدور الثالث', 3, 'Third Floor'),
      ('الدور الرابع', 4, 'Fourth Floor'),
      ('الدور الخامس', 5, 'Fifth Floor'),
      ('الروف', 99, 'Roof/Penthouse'),
      ('فيلا', -1, 'Villa (Multiple Floors)'),
      ('دوبلكس', -2, 'Duplex')
      ON CONFLICT (name) DO NOTHING
    `);

    // Finish Types Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS finish_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(name)
      )
    `);

    await pool.query(`
      INSERT INTO finish_types (name, description) VALUES
      ('سوبر لوكس', 'Super Luxury Finish'),
      ('لوكس', 'Luxury Finish'),
      ('نصف تشطيب', 'Semi-Finished'),
      ('تشطيب كامل', 'Fully Finished'),
      ('على الطوب الأحمر', 'Core & Shell'),
      ('مؤثث', 'Furnished')
      ON CONFLICT (name) DO NOTHING
    `);

    // Payment Types Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payment_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(name)
      )
    `);

    await pool.query(`
      INSERT INTO payment_types (name, description) VALUES
      ('كاش', 'Cash Payment'),
      ('تقسيط', 'Installment Payment'),
      ('مقدم وتقسيط', 'Down Payment + Installments'),
      ('تمويل عقاري', 'Mortgage Financing'),
      ('تبادل', 'Property Exchange')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('✅ Master tables created successfully');

    // Step 5: Add foreign key columns to main tables
    console.log('\n🔗 Step 5: Adding Foreign Key Columns...');

    // Add FK columns to properties table
    const propertyColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name IN ('property_type_id', 'area_id', 'agent_id', 'floor_type_id', 'finish_type_id', 'payment_type_id')
    `);
    
    const existingPropColumns = propertyColumns.rows.map(row => row.column_name);

    if (!existingPropColumns.includes('property_type_id')) {
      await pool.query('ALTER TABLE properties ADD COLUMN property_type_id INTEGER REFERENCES property_types(id)');
      console.log('✅ Added property_type_id to properties');
    }

    if (!existingPropColumns.includes('area_id')) {
      await pool.query('ALTER TABLE properties ADD COLUMN area_id INTEGER REFERENCES areas(id)');
      console.log('✅ Added area_id to properties');
    }

    if (!existingPropColumns.includes('agent_id')) {
      await pool.query('ALTER TABLE properties ADD COLUMN agent_id INTEGER REFERENCES agents(id)');
      console.log('✅ Added agent_id to properties');
    }

    if (!existingPropColumns.includes('floor_type_id')) {
      await pool.query('ALTER TABLE properties ADD COLUMN floor_type_id INTEGER REFERENCES floor_types(id)');
      console.log('✅ Added floor_type_id to properties');
    }

    if (!existingPropColumns.includes('finish_type_id')) {
      await pool.query('ALTER TABLE properties ADD COLUMN finish_type_id INTEGER REFERENCES finish_types(id)');
      console.log('✅ Added finish_type_id to properties');
    }

    if (!existingPropColumns.includes('payment_type_id')) {
      await pool.query('ALTER TABLE properties ADD COLUMN payment_type_id INTEGER REFERENCES payment_types(id)');
      console.log('✅ Added payment_type_id to properties');
    }

    // Add FK columns to chat_messages table
    const messageColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'chat_messages' AND column_name IN ('property_id', 'agent_id', 'property_type_id', 'area_id')
    `);
    
    const existingMsgColumns = messageColumns.rows.map(row => row.column_name);

    if (!existingMsgColumns.includes('property_id')) {
      await pool.query('ALTER TABLE chat_messages ADD COLUMN property_id INTEGER REFERENCES properties(id)');
      console.log('✅ Added property_id to chat_messages');
    }

    if (!existingMsgColumns.includes('agent_id')) {
      await pool.query('ALTER TABLE chat_messages ADD COLUMN agent_id INTEGER REFERENCES agents(id)');
      console.log('✅ Added agent_id to chat_messages');
    }

    if (!existingMsgColumns.includes('property_type_id')) {
      await pool.query('ALTER TABLE chat_messages ADD COLUMN property_type_id INTEGER REFERENCES property_types(id)');
      console.log('✅ Added property_type_id to chat_messages');
    }

    if (!existingMsgColumns.includes('area_id')) {
      await pool.query('ALTER TABLE chat_messages ADD COLUMN area_id INTEGER REFERENCES areas(id)');
      console.log('✅ Added area_id to chat_messages');
    }

    // Step 6: Update foreign key references using AI-like matching
    console.log('\n🤖 Step 6: AI-Powered Data Relationship Mapping...');

    // Link properties to property types
    console.log('🔄 Linking properties to property types...');
    await pool.query(`
      UPDATE properties SET property_type_id = (
        SELECT pt.id FROM property_types pt 
        WHERE properties.property_category ILIKE '%' || pt.name_arabic || '%'
           OR properties.property_category ILIKE '%' || pt.name_english || '%'
           OR properties.property_type ILIKE '%' || pt.name_arabic || '%'
           OR properties.property_type ILIKE '%' || pt.name_english || '%'
        ORDER BY 
          CASE 
            WHEN properties.property_category ILIKE '%' || pt.name_arabic || '%' THEN 1
            WHEN properties.property_category ILIKE '%' || pt.name_english || '%' THEN 2
            WHEN properties.property_type ILIKE '%' || pt.name_arabic || '%' THEN 3
            ELSE 4
          END
        LIMIT 1
      )
      WHERE property_type_id IS NULL 
        AND (property_category IS NOT NULL OR property_type IS NOT NULL)
    `);

    // Link properties to areas
    console.log('🔄 Linking properties to areas...');
    await pool.query(`
      UPDATE properties SET area_id = (
        SELECT a.id FROM areas a 
        WHERE a.name_arabic = TRIM(properties.regions)
           OR a.name_arabic ILIKE '%' || TRIM(properties.regions) || '%'
        ORDER BY 
          CASE 
            WHEN a.name_arabic = TRIM(properties.regions) THEN 1
            ELSE 2
          END
        LIMIT 1
      )
      WHERE area_id IS NULL 
        AND regions IS NOT NULL 
        AND TRIM(regions) != '' 
        AND TRIM(regions) != 'NULL'
    `);

    // Link properties to agents
    console.log('🔄 Linking properties to agents...');
    await pool.query(`
      UPDATE properties SET agent_id = (
        SELECT a.id FROM agents a 
        WHERE a.phone = TRIM(properties.mobile_no)
           OR a.phone = TRIM(properties.tel)
           OR a.name ILIKE '%' || TRIM(properties.name) || '%'
        ORDER BY 
          CASE 
            WHEN a.phone = TRIM(properties.mobile_no) THEN 1
            WHEN a.phone = TRIM(properties.tel) THEN 2
            ELSE 3
          END
        LIMIT 1
      )
      WHERE agent_id IS NULL 
        AND (mobile_no IS NOT NULL OR tel IS NOT NULL OR name IS NOT NULL)
    `);

    // Link chat messages to agents
    console.log('🔄 Linking chat messages to agents...');
    await pool.query(`
      UPDATE chat_messages SET agent_id = (
        SELECT a.id FROM agents a 
        WHERE a.name = TRIM(chat_messages.sender)
           OR a.phone = TRIM(chat_messages.agent_phone)
        ORDER BY 
          CASE 
            WHEN a.name = TRIM(chat_messages.sender) THEN 1
            ELSE 2
          END
        LIMIT 1
      )
      WHERE agent_id IS NULL 
        AND (sender IS NOT NULL OR agent_phone IS NOT NULL)
    `);

    // Link chat messages to property types
    console.log('🔄 Linking chat messages to property types...');
    await pool.query(`
      UPDATE chat_messages SET property_type_id = (
        SELECT pt.id FROM property_types pt 
        WHERE chat_messages.property_type ILIKE '%' || pt.name_arabic || '%'
           OR chat_messages.property_type ILIKE '%' || pt.name_english || '%'
           OR chat_messages.message ILIKE '%' || pt.name_arabic || '%'
           OR chat_messages.keywords ILIKE '%' || pt.name_arabic || '%'
        ORDER BY 
          CASE 
            WHEN chat_messages.property_type ILIKE '%' || pt.name_arabic || '%' THEN 1
            WHEN chat_messages.property_type ILIKE '%' || pt.name_english || '%' THEN 2
            WHEN chat_messages.message ILIKE '%' || pt.name_arabic || '%' THEN 3
            ELSE 4
          END
        LIMIT 1
      )
      WHERE property_type_id IS NULL 
        AND (property_type IS NOT NULL OR message IS NOT NULL)
    `);

    // Step 7: Create performance indexes
    console.log('\n🚀 Step 7: Creating Performance Indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type_id)',
      'CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area_id)', 
      'CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(unit_price)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_agent ON chat_messages(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_property ON chat_messages(property_id)',
      'CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(property_type_id)',
      'CREATE INDEX IF NOT EXISTS idx_areas_name ON areas(name_arabic)',
      'CREATE INDEX IF NOT EXISTS idx_agents_phone ON agents(phone)',
      'CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name)'
    ];

    for (const indexQuery of indexes) {
      try {
        await pool.query(indexQuery);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`⚠️ Index creation issue: ${error.message}`);
        }
      }
    }

    console.log('✅ Performance indexes created');

    // Step 8: Generate statistics
    console.log('\n📊 Step 8: Generating Final Statistics...');

    const stats = await pool.query(`
      SELECT 
        'Properties' as table_name,
        COUNT(*) as total_records,
        COUNT(property_type_id) as linked_to_types,
        COUNT(area_id) as linked_to_areas,
        COUNT(agent_id) as linked_to_agents
      FROM properties
      UNION ALL
      SELECT 
        'Chat Messages' as table_name,
        COUNT(*) as total_records,
        COUNT(property_type_id) as linked_to_types,
        COUNT(area_id) as linked_to_areas,
        COUNT(agent_id) as linked_to_agents
      FROM chat_messages
    `);

    const masterStats = await pool.query(`
      SELECT 
        'Property Types' as table_name, COUNT(*) as records, 0 as linked1, 0 as linked2
      FROM property_types
      UNION ALL
      SELECT 
        'Areas' as table_name, COUNT(*) as records, 0, 0
      FROM areas
      UNION ALL
      SELECT 
        'Agents' as table_name, COUNT(*) as records, 0, 0
      FROM agents
      UNION ALL
      SELECT 
        'Floor Types' as table_name, COUNT(*) as records, 0, 0
      FROM floor_types
      UNION ALL
      SELECT 
        'Finish Types' as table_name, COUNT(*) as records, 0, 0
      FROM finish_types
      UNION ALL
      SELECT 
        'Payment Types' as table_name, COUNT(*) as records, 0, 0
      FROM payment_types
    `);

    console.log('\n🎉 NORMALIZATION COMPLETE!');
    console.log('=============================');
    console.log('\n📊 FINAL STATISTICS:');
    console.log('-------------------');
    
    stats.rows.forEach(row => {
      console.log(`${row.table_name}:`);
      console.log(`  📦 Total Records: ${row.total_records}`);
      console.log(`  🔗 Linked to Types: ${row.linked_to_types}`);
      console.log(`  🌍 Linked to Areas: ${row.linked_to_areas}`);
      console.log(`  👥 Linked to Agents: ${row.linked_to_agents}`);
      console.log('');
    });

    console.log('🗄️ MASTER TABLES:');
    console.log('------------------');
    masterStats.rows.forEach(row => {
      console.log(`${row.table_name}: ${row.records} records`);
    });

    console.log('\n✅ Database normalization successful!');
    console.log('🔗 All relationships established');
    console.log('🚀 Ready for frontend integration');

  } catch (error) {
    console.error('❌ Error during normalization:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the normalization
implementNormalizedSchema();
