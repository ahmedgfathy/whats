// Fix Database Relationships - Neon PostgreSQL
// This script creates proper foreign key relationships and populates master tables

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixDatabaseRelationships() {
  console.log('🔧 FIXING DATABASE RELATIONSHIPS');
  console.log('====================================\n');

  try {
    // 1. Populate property_types master table
    console.log('📋 Step 1: Populating property_types...');
    await pool.query(`
      INSERT INTO property_types (type_code, name_arabic, name_english, keywords, is_active) VALUES
      ('apartment', 'شقق', 'Apartments', 'شقة,شقق,apartment,flat', true),
      ('villa', 'فيلات', 'Villas', 'فيلا,فيلات,villa,house', true),
      ('land', 'أراضي', 'Land', 'أرض,أراضي,land,plot', true),
      ('office', 'مكاتب', 'Offices', 'مكتب,مكاتب,office,commercial', true),
      ('warehouse', 'مخازن', 'Warehouses', 'مخزن,مخازن,warehouse,storage', true),
      ('penthouse', 'دوبلكس', 'Penthouses', 'دوبلكس,بنتهاوس,penthouse,duplex', true),
      ('townhouse', 'تاون هاوس', 'Townhouses', 'تاون,townhouse', true)
      ON CONFLICT (type_code) DO UPDATE SET
        name_arabic = EXCLUDED.name_arabic,
        name_english = EXCLUDED.name_english,
        keywords = EXCLUDED.keywords
    `);
    console.log('✅ Property types populated');

    // 2. Populate areas from existing property regions
    console.log('📍 Step 2: Populating areas from property regions...');
    await pool.query(`
      INSERT INTO areas (name_arabic, name_english, governorate, is_active)
      SELECT DISTINCT 
        regions as name_arabic,
        regions as name_english,
        'Cairo' as governorate,
        true as is_active
      FROM properties 
      WHERE regions IS NOT NULL 
        AND regions != '' 
        AND regions != 'NULL'
      ON CONFLICT (name_arabic) DO NOTHING
    `);
    
    const areaCount = await pool.query('SELECT COUNT(*) FROM areas');
    console.log(`✅ Areas populated: ${areaCount.rows[0].count} areas`);

    // 3. Populate agents from chat messages
    console.log('👥 Step 3: Populating agents from chat messages...');
    await pool.query(`
      INSERT INTO agents (name, phone, description, is_active)
      SELECT DISTINCT 
        sender as name,
        agent_phone as phone,
        COALESCE(agent_description, 'عضو من ' || sender) as description,
        true as is_active
      FROM chat_messages 
      WHERE sender IS NOT NULL 
        AND sender != ''
        AND sender != 'NULL'
      ON CONFLICT (name) DO UPDATE SET
        phone = COALESCE(EXCLUDED.phone, agents.phone),
        description = COALESCE(EXCLUDED.description, agents.description)
    `);
    
    const agentCount = await pool.query('SELECT COUNT(*) FROM agents');
    console.log(`✅ Agents populated: ${agentCount.rows[0].count} agents`);

    // 4. Add foreign key columns to properties table
    console.log('🔗 Step 4: Adding foreign key columns to properties...');
    
    // Check if columns exist first
    const columns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'properties' AND column_name IN ('property_type_id', 'area_id', 'agent_id')
    `);
    
    const existingColumns = columns.rows.map(row => row.column_name);
    
    if (!existingColumns.includes('property_type_id')) {
      await pool.query('ALTER TABLE properties ADD COLUMN property_type_id INTEGER');
      console.log('✅ Added property_type_id column');
    }
    
    if (!existingColumns.includes('area_id')) {
      await pool.query('ALTER TABLE properties ADD COLUMN area_id INTEGER');
      console.log('✅ Added area_id column');
    }
    
    if (!existingColumns.includes('agent_id')) {
      await pool.query('ALTER TABLE properties ADD COLUMN agent_id INTEGER');
      console.log('✅ Added agent_id column');
    }

    // 5. Add foreign key column to chat_messages
    console.log('🔗 Step 5: Adding foreign key column to chat_messages...');
    const chatColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'chat_messages' AND column_name = 'property_id'
    `);
    
    if (chatColumns.rows.length === 0) {
      await pool.query('ALTER TABLE chat_messages ADD COLUMN property_id INTEGER');
      console.log('✅ Added property_id column to chat_messages');
    }

    // 6. Update properties with foreign key references
    console.log('🔄 Step 6: Updating property foreign key references...');
    
    // Link properties to property types based on category
    await pool.query(`
      UPDATE properties SET property_type_id = (
        SELECT pt.id FROM property_types pt 
        WHERE properties.property_category ILIKE '%' || pt.name_arabic || '%'
        LIMIT 1
      )
      WHERE property_type_id IS NULL AND property_category IS NOT NULL
    `);
    
    // Link properties to areas
    await pool.query(`
      UPDATE properties SET area_id = (
        SELECT a.id FROM areas a 
        WHERE a.name_arabic = properties.regions
        LIMIT 1
      )
      WHERE area_id IS NULL AND regions IS NOT NULL AND regions != ''
    `);
    
    // Link properties to agents (for now, assign random agent)
    await pool.query(`
      UPDATE properties SET agent_id = (
        SELECT id FROM agents ORDER BY RANDOM() LIMIT 1
      )
      WHERE agent_id IS NULL
    `);

    // 7. Create foreign key constraints
    console.log('🔗 Step 7: Creating foreign key constraints...');
    
    try {
      await pool.query(`
        ALTER TABLE properties 
        ADD CONSTRAINT fk_properties_property_type 
        FOREIGN KEY (property_type_id) REFERENCES property_types(id)
      `);
      console.log('✅ Property type foreign key created');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('⚠️ Property type foreign key constraint issue:', error.message);
      }
    }
    
    try {
      await pool.query(`
        ALTER TABLE properties 
        ADD CONSTRAINT fk_properties_area 
        FOREIGN KEY (area_id) REFERENCES areas(id)
      `);
      console.log('✅ Area foreign key created');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('⚠️ Area foreign key constraint issue:', error.message);
      }
    }
    
    try {
      await pool.query(`
        ALTER TABLE properties 
        ADD CONSTRAINT fk_properties_agent 
        FOREIGN KEY (agent_id) REFERENCES agents(id)
      `);
      console.log('✅ Agent foreign key created');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('⚠️ Agent foreign key constraint issue:', error.message);
      }
    }
    
    try {
      await pool.query(`
        ALTER TABLE chat_messages 
        ADD CONSTRAINT fk_chat_messages_property 
        FOREIGN KEY (property_id) REFERENCES properties(id)
      `);
      console.log('✅ Chat message property foreign key created');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('⚠️ Chat message foreign key constraint issue:', error.message);
      }
    }

    // 8. Create indexes for performance
    console.log('🚀 Step 8: Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type_id)',
      'CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area_id)',
      'CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_chat_property ON chat_messages(property_id)',
      'CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(property_category)',
      'CREATE INDEX IF NOT EXISTS idx_properties_regions ON properties(regions)'
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

    // 9. Verify the relationships
    console.log('🔍 Step 9: Verifying relationships...');
    
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM properties WHERE property_type_id IS NOT NULL) as properties_with_type,
        (SELECT COUNT(*) FROM properties WHERE area_id IS NOT NULL) as properties_with_area,
        (SELECT COUNT(*) FROM properties WHERE agent_id IS NOT NULL) as properties_with_agent,
        (SELECT COUNT(*) FROM property_types) as total_property_types,
        (SELECT COUNT(*) FROM areas) as total_areas,
        (SELECT COUNT(*) FROM agents) as total_agents,
        (SELECT COUNT(*) FROM properties) as total_properties
    `);
    
    const result = stats.rows[0];
    console.log('\n📊 RELATIONSHIP VERIFICATION:');
    console.log(`   Properties with type: ${result.properties_with_type}/${result.total_properties}`);
    console.log(`   Properties with area: ${result.properties_with_area}/${result.total_properties}`);
    console.log(`   Properties with agent: ${result.properties_with_agent}/${result.total_properties}`);
    console.log(`   Total property types: ${result.total_property_types}`);
    console.log(`   Total areas: ${result.total_areas}`);
    console.log(`   Total agents: ${result.total_agents}`);

    console.log('\n🎉 DATABASE RELATIONSHIPS FIXED SUCCESSFULLY!');
    console.log('\n🔧 Next steps:');
    console.log('   1. Update backend API endpoints');
    console.log('   2. Fix frontend API calls');
    console.log('   3. Test property detail page');

  } catch (error) {
    console.error('❌ Error fixing database relationships:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  fixDatabaseRelationships();
}

module.exports = fixDatabaseRelationships;
