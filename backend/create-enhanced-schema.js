// ENHANCED DATABASE SCHEMA - Including WhatsApp Messages Normalization
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createEnhancedNormalizedSchema() {
  try {
    console.log('🚀 CREATING ENHANCED NORMALIZED SCHEMA WITH WHATSAPP MESSAGES');
    console.log('==============================================================\n');

    // 1. Create agents table (from WhatsApp messages)
    console.log('👤 Creating agents table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Create enhanced locations table
    console.log('📍 Creating enhanced locations table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        name_ar VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        region_type VARCHAR(50), -- district, compound, area
        parent_location_id INTEGER REFERENCES locations(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Create normalized messages table
    console.log('💬 Creating normalized messages table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages_normalized (
        id SERIAL PRIMARY KEY,
        original_message_id INTEGER,
        agent_id INTEGER REFERENCES agents(id),
        message_content TEXT NOT NULL,
        timestamp_original VARCHAR(100),
        parsed_timestamp TIMESTAMP,
        
        -- Extracted property information
        property_type_id INTEGER REFERENCES property_categories(id),
        location_id INTEGER REFERENCES locations(id),
        price_text VARCHAR(100),
        price_numeric DECIMAL(15,2),
        currency VARCHAR(10) DEFAULT 'EGP',
        
        -- Property details extracted from message
        area_size DECIMAL(10,2),
        area_unit VARCHAR(20) DEFAULT 'متر',
        bedrooms INTEGER,
        bathrooms INTEGER,
        floors INTEGER,
        has_kitchen BOOLEAN DEFAULT false,
        has_garden BOOLEAN DEFAULT false,
        has_parking BOOLEAN DEFAULT false,
        has_elevator BOOLEAN DEFAULT false,
        
        -- Classification
        listing_type_id INTEGER REFERENCES listing_types(id), -- sale/rent
        keywords TEXT[],
        
        -- Metadata
        processed BOOLEAN DEFAULT false,
        confidence_score DECIMAL(3,2), -- AI classification confidence
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Create message-property relationships table
    console.log('🔗 Creating message-property relationships table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_property_relationships (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES messages_normalized(id),
        property_id INTEGER REFERENCES properties_normalized(id),
        relationship_type VARCHAR(50), -- 'extracted_from', 'similar_to', 'duplicate_of'
        confidence_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5. Add indexes for performance
    console.log('🚀 Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_messages_agent ON messages_normalized(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_property_type ON messages_normalized(property_type_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_location ON messages_normalized(location_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages_normalized(parsed_timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_messages_price ON messages_normalized(price_numeric)',
      'CREATE INDEX IF NOT EXISTS idx_messages_content_text ON messages_normalized USING gin(to_tsvector(\'arabic\', message_content))',
      'CREATE INDEX IF NOT EXISTS idx_locations_name_ar ON locations(name_ar)',
      'CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name)',
      'CREATE INDEX IF NOT EXISTS idx_msg_prop_rel_message ON message_property_relationships(message_id)',
      'CREATE INDEX IF NOT EXISTS idx_msg_prop_rel_property ON message_property_relationships(property_id)'
    ];

    for (const indexQuery of indexes) {
      await pool.query(indexQuery);
    }

    // 6. Insert sample agents (from messages.json data)
    console.log('👥 Inserting sample agents...');
    const sampleAgents = [
      { name: 'أحمد السمسار', phone: '01234567890', description: 'سمسار عقاري محترف متخصص في العقارات السكنية والتجارية' },
      { name: 'محمد العقاري', phone: '01234567891', description: 'خبير عقاري في التجمع الخامس والشيخ زايد' },
      { name: 'فاطمة الوكيلة', phone: '01234567892', description: 'وكيل عقاري نسائي متخصص في الشقق العائلية' },
      { name: 'علي المطور', phone: '01234567893', description: 'مطور عقاري ومستثمر في العقارات التجارية' },
      { name: 'نور الهدى', phone: '01234567894', description: 'استشاري عقاري للمشاريع السكنية الجديدة' }
    ];

    for (const agent of sampleAgents) {
      await pool.query(`
        INSERT INTO agents (name, phone, description) 
        VALUES ($1, $2, $3) 
        ON CONFLICT DO NOTHING
      `, [agent.name, agent.phone, agent.description]);
    }

    // 7. Insert sample locations
    console.log('🏙️ Inserting sample locations...');
    const sampleLocations = [
      { name_ar: 'الحي العاشر', name_en: '10th District', region_type: 'district' },
      { name_ar: 'التجمع الخامس', name_en: 'New Cairo 5th Settlement', region_type: 'area' },
      { name_ar: 'الشيخ زايد', name_en: 'Sheikh Zayed', region_type: 'area' },
      { name_ar: 'مدينة نصر', name_en: 'Nasr City', region_type: 'area' },
      { name_ar: 'المعادي', name_en: 'Maadi', region_type: 'area' },
      { name_ar: 'الزمالك', name_en: 'Zamalek', region_type: 'area' },
      { name_ar: 'القاهرة الجديدة', name_en: 'New Cairo', region_type: 'area' },
      { name_ar: 'كمبوند ميفيدا', name_en: 'Mivida Compound', region_type: 'compound' },
      { name_ar: 'كمبوند الرحاب', name_en: 'Rehab Compound', region_type: 'compound' },
      { name_ar: 'مدينتي', name_en: 'Madinaty', region_type: 'compound' }
    ];

    for (const location of sampleLocations) {
      await pool.query(`
        INSERT INTO locations (name_ar, name_en, region_type) 
        VALUES ($1, $2, $3) 
        ON CONFLICT DO NOTHING
      `, [location.name_ar, location.name_en, location.region_type]);
    }

    // 8. Create data analysis function
    console.log('📊 Creating data analysis functions...');
    await pool.query(`
      CREATE OR REPLACE FUNCTION analyze_message_duplicates()
      RETURNS TABLE(
        total_messages BIGINT,
        unique_messages BIGINT,
        duplicate_count BIGINT,
        duplicate_percentage DECIMAL
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          COUNT(*)::BIGINT as total_messages,
          COUNT(DISTINCT message)::BIGINT as unique_messages,
          (COUNT(*) - COUNT(DISTINCT message))::BIGINT as duplicate_count,
          ROUND(((COUNT(*) - COUNT(DISTINCT message))::DECIMAL / COUNT(*) * 100), 2) as duplicate_percentage
        FROM properties
        WHERE message IS NOT NULL AND message != '';
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('\n✅ Enhanced normalized schema created successfully!');
    console.log('\n📋 NEW TABLES CREATED:');
    console.log('  - agents (WhatsApp message senders)');
    console.log('  - locations (enhanced location data)');
    console.log('  - messages_normalized (processed WhatsApp messages)');
    console.log('  - message_property_relationships (links messages to properties)');
    
    console.log('\n🔧 READY FOR:');
    console.log('  1. WhatsApp message processing and normalization');
    console.log('  2. Agent information extraction');
    console.log('  3. Location standardization');
    console.log('  4. Property-message relationship mapping');
    console.log('  5. Advanced search and filtering');

  } catch (error) {
    console.error('❌ Error creating enhanced schema:', error);
  } finally {
    await pool.end();
  }
}

createEnhancedNormalizedSchema();
