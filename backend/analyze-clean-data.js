// Data Cleaning and Duplicate Analysis
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://neondb_owner:npg_jyLVBR2De0mZ@ep-floral-water-a2ow4nw4-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function analyzeAndCleanData() {
  try {
    console.log('🔍 COMPREHENSIVE DATA ANALYSIS AND CLEANING');
    console.log('===========================================\n');

    // 1. Basic statistics
    console.log('📊 1. BASIC STATISTICS');
    console.log('----------------------');
    
    const totalRecords = await pool.query('SELECT COUNT(*) FROM properties');
    console.log(`Total records in properties table: ${totalRecords.rows[0].count}`);

    // 2. Analyze duplicates by message content
    console.log('\n🔍 2. DUPLICATE ANALYSIS BY MESSAGE CONTENT');
    console.log('--------------------------------------------');
    
    const duplicateAnalysis = await pool.query(`
      WITH message_counts AS (
        SELECT 
          message, 
          COUNT(*) as occurrence_count,
          MIN(id) as first_id,
          MAX(id) as last_id
        FROM properties 
        WHERE message IS NOT NULL 
          AND message != ''
          AND LENGTH(message) > 10
        GROUP BY message
      )
      SELECT 
        COUNT(*) as total_unique_messages,
        COUNT(CASE WHEN occurrence_count > 1 THEN 1 END) as duplicated_messages,
        SUM(occurrence_count) as total_message_records,
        SUM(CASE WHEN occurrence_count > 1 THEN occurrence_count - 1 ELSE 0 END) as duplicate_records
      FROM message_counts
    `);

    const dupStats = duplicateAnalysis.rows[0];
    console.log(`📈 Duplicate Statistics:`);
    console.log(`  - Unique messages: ${dupStats.total_unique_messages}`);
    console.log(`  - Messages with duplicates: ${dupStats.duplicated_messages}`);
    console.log(`  - Total message records: ${dupStats.total_message_records}`);
    console.log(`  - Duplicate records to remove: ${dupStats.duplicate_records}`);

    // 3. Show worst duplicate examples
    console.log('\n🔍 3. WORST DUPLICATE EXAMPLES');
    console.log('-------------------------------');
    
    const worstDuplicates = await pool.query(`
      SELECT 
        LEFT(message, 100) as message_preview,
        COUNT(*) as count
      FROM properties 
      WHERE message IS NOT NULL AND message != ''
      GROUP BY message
      HAVING COUNT(*) > 5
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `);

    worstDuplicates.rows.forEach(row => {
      console.log(`  - "${row.message_preview}..." appears ${row.count} times`);
    });

    // 4. Analyze data quality issues
    console.log('\n🔍 4. DATA QUALITY ISSUES');
    console.log('-------------------------');
    
    const qualityIssues = await pool.query(`
      SELECT 
        COUNT(CASE WHEN message IS NULL OR message = '' THEN 1 END) as empty_messages,
        COUNT(CASE WHEN message LIKE '%test%' OR message LIKE '%Test%' OR message LIKE '%TEST%' THEN 1 END) as test_messages,
        COUNT(CASE WHEN property_category LIKE '%.jpg%' OR property_category LIKE '%.png%' OR property_category LIKE '%.jpeg%' THEN 1 END) as image_filenames,
        COUNT(CASE WHEN LENGTH(message) < 10 THEN 1 END) as very_short_messages,
        COUNT(CASE WHEN message LIKE '%Lorem%' OR message LIKE '%ipsum%' THEN 1 END) as lorem_ipsum,
        COUNT(CASE WHEN property_name LIKE '%test%' OR property_name LIKE '%Test%' THEN 1 END) as test_properties
      FROM properties
    `);

    const quality = qualityIssues.rows[0];
    console.log(`🚨 Quality Issues Found:`);
    console.log(`  - Empty messages: ${quality.empty_messages}`);
    console.log(`  - Test messages: ${quality.test_messages}`);
    console.log(`  - Image filenames as categories: ${quality.image_filenames}`);
    console.log(`  - Very short messages (<10 chars): ${quality.very_short_messages}`);
    console.log(`  - Lorem ipsum text: ${quality.lorem_ipsum}`);
    console.log(`  - Test properties: ${quality.test_properties}`);

    // 5. Calculate clean data estimate
    console.log('\n📊 5. CLEAN DATA ESTIMATE');
    console.log('-------------------------');
    
    const cleanDataQuery = await pool.query(`
      WITH duplicates_removed AS (
        SELECT 
          DISTINCT ON (message) *
        FROM properties 
        WHERE message IS NOT NULL 
          AND message != ''
          AND LENGTH(message) >= 10
          AND message NOT LIKE '%test%'
          AND message NOT LIKE '%Test%'
          AND message NOT LIKE '%Lorem%'
          AND property_category NOT LIKE '%.jpg%'
          AND property_category NOT LIKE '%.png%'
          AND property_name NOT LIKE '%test%'
      )
      SELECT COUNT(*) as clean_records
      FROM duplicates_removed
    `);

    const cleanCount = cleanDataQuery.rows[0].clean_records;
    const originalCount = parseInt(totalRecords.rows[0].count);
    const duplicateCount = parseInt(dupStats.duplicate_records);
    const qualityIssueCount = parseInt(quality.test_messages) + 
                             parseInt(quality.image_filenames) + 
                             parseInt(quality.lorem_ipsum);

    console.log(`📈 Data Summary:`);
    console.log(`  - Original records: ${originalCount.toLocaleString()}`);
    console.log(`  - Duplicate records: ${duplicateCount.toLocaleString()}`);
    console.log(`  - Quality issue records: ${qualityIssueCount.toLocaleString()}`);
    console.log(`  - Estimated clean records: ${cleanCount.toLocaleString()}`);
    console.log(`  - Data cleaning savings: ${((originalCount - cleanCount) / originalCount * 100).toFixed(1)}%`);

    // 6. Create clean data view
    console.log('\n🔧 6. CREATING CLEAN DATA VIEW');
    console.log('-------------------------------');
    
    await pool.query(`
      CREATE OR REPLACE VIEW properties_clean AS
      SELECT DISTINCT ON (message)
        id,
        property_name,
        property_number,
        property_category,
        message,
        created_time,
        regions,
        modified_time,
        floor_no,
        finish_type,
        offered_by,
        price,
        payment_type,
        listing_type,
        phone,
        whatsapp,
        email
      FROM properties 
      WHERE message IS NOT NULL 
        AND message != ''
        AND LENGTH(message) >= 10
        AND message NOT ILIKE '%test%'
        AND message NOT ILIKE '%lorem%'
        AND property_category NOT LIKE '%.jpg%'
        AND property_category NOT LIKE '%.png%'
        AND (property_name IS NULL OR property_name NOT ILIKE '%test%')
      ORDER BY message, id
    `);

    console.log('✅ Created properties_clean view with deduplication');

    // 7. Recommendations
    console.log('\n💡 7. RECOMMENDATIONS');
    console.log('----------------------');
    
    if (duplicateCount > originalCount * 0.3) {
      console.log('🚨 HIGH DUPLICATE RATE (>30%)!');
      console.log('   Action: Use properties_clean view for migration');
    }
    
    if (qualityIssueCount > 1000) {
      console.log('🚨 SIGNIFICANT DATA QUALITY ISSUES!');
      console.log('   Action: Implement data validation before import');
    }
    
    console.log(`\n✅ RECOMMENDATION: Migrate ${cleanCount.toLocaleString()} clean records instead of ${originalCount.toLocaleString()}`);
    console.log('   This will save processing time and improve data quality');

  } catch (error) {
    console.error('❌ Analysis error:', error);
  } finally {
    await pool.end();
  }
}

analyzeAndCleanData();
