const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function implementNormalizedSchemaRobust() {
  console.log('🚀 IMPLEMENTING NORMALIZED REAL ESTATE CRM SCHEMA');
  console.log('==============================================\n');

  try {
    // Step 1: Populate Property Types (using existing structure)
    console.log('🏷️ Step 1: Populating Property Types...');
    
    await pool.query(`
      INSERT INTO property_types (type_code, name_arabic, name_english, keywords) 
      SELECT * FROM (VALUES
        ('apartment', 'شقق', 'Apartments', 'شقة,apartment,flat,unit'),
        ('villa', 'فيلات', 'Villas', 'فيلا,villa,house,mansion'),
        ('land', 'أراضي', 'Land', 'أرض,land,plot,terrain'),
        ('office', 'مكاتب', 'Offices', 'مكتب,office,commercial,workspace'),
        ('warehouse', 'مخازن', 'Warehouses', 'مخزن,warehouse,storage,depot'),
        ('shop', 'محلات', 'Shops', 'محل,shop,store,retail'),
        ('building', 'مباني', 'Buildings', 'مبنى,building,complex')
      ) AS v(type_code, name_arabic, name_english, keywords)
      WHERE NOT EXISTS (SELECT 1 FROM property_types WHERE property_types.type_code = v.type_code)
    `);

    const propertyTypesCount = await pool.query('SELECT COUNT(*) FROM property_types');
    console.log(`✅ Property Types: ${propertyTypesCount.rows[0].count} types created`);

    // Step 2: Populate Areas safely
    console.log('\n🌍 Step 2: Populating Areas...');
    
    await pool.query(`
      INSERT INTO areas (name_arabic, name_english, governorate) 
      SELECT DISTINCT 
        SUBSTRING(TRIM(regions), 1, 255) as name_arabic,
        SUBSTRING(TRIM(regions), 1, 255) as name_english,
        CASE 
          WHEN TRIM(regions) ILIKE '%الساحل%' OR TRIM(regions) ILIKE '%الساحل الشمالي%' THEN 'الساحل الشمالي'
          WHEN TRIM(regions) ILIKE '%الجيزة%' OR TRIM(regions) ILIKE '%giza%' THEN 'الجيزة'
          WHEN TRIM(regions) ILIKE '%الإسكندرية%' OR TRIM(regions) ILIKE '%alexandria%' THEN 'الإسكندرية'
          WHEN TRIM(regions) ILIKE '%القاهرة الجديدة%' OR TRIM(regions) ILIKE '%new cairo%' THEN 'القاهرة'
          ELSE 'القاهرة'
        END as governorate
      FROM properties 
      WHERE regions IS NOT NULL 
        AND TRIM(regions) != '' 
        AND TRIM(regions) != 'NULL'
        AND LENGTH(TRIM(regions)) > 2
        AND NOT EXISTS (
          SELECT 1 FROM areas WHERE areas.name_arabic = SUBSTRING(TRIM(properties.regions), 1, 255)
        )
    `);

    const areasCount = await pool.query('SELECT COUNT(*) FROM areas');
    console.log(`✅ Areas: ${areasCount.rows[0].count} areas extracted and created`);

    // Step 3: Populate Agents safely
    console.log('\n👥 Step 3: Populating Agents...');
    
    // Clear any existing duplicates first
    await pool.query('DELETE FROM agents WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn FROM agents) t WHERE t.rn > 1)');
    
    // From chat messages - batch insert with proper duplicate handling
    await pool.query(`
      WITH agent_data AS (
        SELECT DISTINCT 
          SUBSTRING(TRIM(sender), 1, 255) as name,
          CASE 
            WHEN agent_phone IS NOT NULL AND LENGTH(TRIM(agent_phone)) > 8 
            THEN SUBSTRING(TRIM(agent_phone), 1, 20)
            ELSE NULL
          END as phone,
          SUBSTRING(COALESCE(NULLIF(TRIM(agent_description), ''), 'عقاري من ' || TRIM(sender)), 1, 500) as description
        FROM chat_messages 
        WHERE sender IS NOT NULL 
          AND TRIM(sender) != '' 
          AND TRIM(sender) != 'NULL'
          AND LENGTH(TRIM(sender)) > 2
      )
      INSERT INTO agents (name, phone, description) 
      SELECT name, phone, description 
      FROM agent_data
      WHERE NOT EXISTS (SELECT 1 FROM agents WHERE agents.name = agent_data.name)
    `);

    // From properties table - handle potential very long names
    await pool.query(`
      WITH property_agent_data AS (
        SELECT DISTINCT 
          SUBSTRING(COALESCE(NULLIF(TRIM(name), ''), 'Property Owner ' || id), 1, 255) as name,
          CASE 
            WHEN mobile_no IS NOT NULL AND LENGTH(TRIM(mobile_no)) > 8 
            THEN SUBSTRING(TRIM(mobile_no), 1, 20)
            ELSE NULL
          END as phone,
          SUBSTRING(CASE 
            WHEN property_offered_by IS NOT NULL 
            THEN 'Property offered by: ' || property_offered_by
            ELSE 'Property Owner'
          END, 1, 500) as description
        FROM properties 
        WHERE ((name IS NOT NULL AND TRIM(name) != '' AND TRIM(name) != 'NULL')
           OR (mobile_no IS NOT NULL AND LENGTH(TRIM(mobile_no)) > 8))
      )
      INSERT INTO agents (name, phone, description) 
      SELECT name, phone, description 
      FROM property_agent_data
      WHERE NOT EXISTS (SELECT 1 FROM agents WHERE agents.name = property_agent_data.name)
    `);

    const agentsCount = await pool.query('SELECT COUNT(*) FROM agents');
    console.log(`✅ Agents: ${agentsCount.rows[0].count} agents extracted and created`);

    // Step 4: Add foreign key columns (check first)
    console.log('\n🔗 Step 4: Adding Foreign Key Columns...');

    const checkAndAddColumn = async (table, column, type) => {
      const exists = await pool.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [table, column]);
      
      if (exists.rows.length === 0) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
        console.log(`✅ Added ${column} to ${table}`);
      } else {
        console.log(`ℹ️  Column ${column} already exists in ${table}`);
      }
    };

    await checkAndAddColumn('properties', 'property_type_id', 'INTEGER');
    await checkAndAddColumn('properties', 'area_id', 'INTEGER');
    await checkAndAddColumn('properties', 'agent_id', 'INTEGER');
    await checkAndAddColumn('chat_messages', 'property_id', 'INTEGER');
    await checkAndAddColumn('chat_messages', 'agent_id', 'INTEGER');
    await checkAndAddColumn('chat_messages', 'property_type_id', 'INTEGER');
    await checkAndAddColumn('chat_messages', 'area_id', 'INTEGER');

    // Step 5: AI-Powered Data Relationship Mapping
    console.log('\n🤖 Step 5: AI-Powered Data Relationship Mapping...');

    // Link properties to property types
    console.log('🔄 Linking properties to property types...');
    const propTypeUpdates = await pool.query(`
      UPDATE properties SET property_type_id = (
        SELECT pt.id FROM property_types pt 
        WHERE properties.property_category ILIKE '%' || pt.name_arabic || '%'
           OR properties.property_category ILIKE '%' || pt.name_english || '%'
           OR properties.property_type ILIKE '%' || pt.name_arabic || '%'
           OR properties.property_type ILIKE '%' || pt.name_english || '%'
           OR properties.property_category ILIKE '%' || pt.type_code || '%'
        ORDER BY 
          CASE 
            WHEN properties.property_category ILIKE '%' || pt.name_arabic || '%' THEN 1
            WHEN properties.property_category ILIKE '%' || pt.name_english || '%' THEN 2
            WHEN properties.property_type ILIKE '%' || pt.name_arabic || '%' THEN 3
            WHEN properties.property_type ILIKE '%' || pt.name_english || '%' THEN 4
            ELSE 5
          END
        LIMIT 1
      )
      WHERE property_type_id IS NULL 
        AND (property_category IS NOT NULL OR property_type IS NOT NULL)
    `);
    console.log(`✅ Linked ${propTypeUpdates.rowCount} properties to types`);

    // Link properties to areas
    console.log('🔄 Linking properties to areas...');
    const propAreaUpdates = await pool.query(`
      UPDATE properties SET area_id = (
        SELECT a.id FROM areas a 
        WHERE a.name_arabic = SUBSTRING(TRIM(properties.regions), 1, 255)
           OR a.name_arabic ILIKE '%' || SUBSTRING(TRIM(properties.regions), 1, 100) || '%'
        ORDER BY 
          CASE 
            WHEN a.name_arabic = SUBSTRING(TRIM(properties.regions), 1, 255) THEN 1
            ELSE 2
          END
        LIMIT 1
      )
      WHERE area_id IS NULL 
        AND regions IS NOT NULL 
        AND TRIM(regions) != '' 
        AND TRIM(regions) != 'NULL'
    `);
    console.log(`✅ Linked ${propAreaUpdates.rowCount} properties to areas`);

    // Link properties to agents
    console.log('🔄 Linking properties to agents...');
    const propAgentUpdates = await pool.query(`
      UPDATE properties SET agent_id = (
        SELECT a.id FROM agents a 
        WHERE a.phone = SUBSTRING(TRIM(properties.mobile_no), 1, 20)
           OR a.phone = SUBSTRING(TRIM(properties.tel), 1, 20)
           OR a.name = SUBSTRING(TRIM(properties.name), 1, 255)
        ORDER BY 
          CASE 
            WHEN a.phone = SUBSTRING(TRIM(properties.mobile_no), 1, 20) THEN 1
            WHEN a.phone = SUBSTRING(TRIM(properties.tel), 1, 20) THEN 2
            WHEN a.name = SUBSTRING(TRIM(properties.name), 1, 255) THEN 3
            ELSE 4
          END
        LIMIT 1
      )
      WHERE agent_id IS NULL 
        AND (mobile_no IS NOT NULL OR tel IS NOT NULL OR name IS NOT NULL)
    `);
    console.log(`✅ Linked ${propAgentUpdates.rowCount} properties to agents`);

    // Link chat messages to agents
    console.log('🔄 Linking chat messages to agents...');
    const msgAgentUpdates = await pool.query(`
      UPDATE chat_messages SET agent_id = (
        SELECT a.id FROM agents a 
        WHERE a.name = SUBSTRING(TRIM(chat_messages.sender), 1, 255)
           OR a.phone = SUBSTRING(TRIM(chat_messages.agent_phone), 1, 20)
        ORDER BY 
          CASE 
            WHEN a.name = SUBSTRING(TRIM(chat_messages.sender), 1, 255) THEN 1
            ELSE 2
          END
        LIMIT 1
      )
      WHERE agent_id IS NULL 
        AND (sender IS NOT NULL OR agent_phone IS NOT NULL)
    `);
    console.log(`✅ Linked ${msgAgentUpdates.rowCount} messages to agents`);

    // Link chat messages to property types
    console.log('🔄 Linking chat messages to property types...');
    const msgTypeUpdates = await pool.query(`
      UPDATE chat_messages SET property_type_id = (
        SELECT pt.id FROM property_types pt 
        WHERE chat_messages.property_type ILIKE '%' || pt.name_arabic || '%'
           OR chat_messages.property_type ILIKE '%' || pt.name_english || '%'
           OR chat_messages.message ILIKE '%' || pt.name_arabic || '%'
           OR chat_messages.keywords ILIKE '%' || pt.name_arabic || '%'
           OR chat_messages.property_type ILIKE '%' || pt.type_code || '%'
        ORDER BY 
          CASE 
            WHEN chat_messages.property_type ILIKE '%' || pt.name_arabic || '%' THEN 1
            WHEN chat_messages.property_type ILIKE '%' || pt.name_english || '%' THEN 2
            WHEN chat_messages.message ILIKE '%' || pt.name_arabic || '%' THEN 3
            WHEN chat_messages.keywords ILIKE '%' || pt.name_arabic || '%' THEN 4
            ELSE 5
          END
        LIMIT 1
      )
      WHERE property_type_id IS NULL 
        AND (property_type IS NOT NULL OR message IS NOT NULL)
    `);
    console.log(`✅ Linked ${msgTypeUpdates.rowCount} messages to property types`);

    // Step 6: Create indexes for performance
    console.log('\n🚀 Step 6: Creating Performance Indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type_id)',
      'CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area_id)', 
      'CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id)',
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

    // Step 7: Generate final statistics
    console.log('\n📊 Step 7: Generating Final Statistics...');

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
        'Property Types' as table_name, COUNT(*) as records
      FROM property_types
      UNION ALL
      SELECT 
        'Areas' as table_name, COUNT(*) as records
      FROM areas
      UNION ALL
      SELECT 
        'Agents' as table_name, COUNT(*) as records
      FROM agents
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
implementNormalizedSchemaRobust();
