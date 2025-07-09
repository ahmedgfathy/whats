// Data Quality Analysis Script for Real Estate CRM
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function analyzeDataQuality() {
  try {
    console.log('🔍 COMPREHENSIVE DATA QUALITY ANALYSIS');
    console.log('=====================================\n');

    // 1. Check original properties table for duplicates
    console.log('📊 1. ANALYZING ORIGINAL PROPERTIES TABLE');
    console.log('------------------------------------------');
    
    const totalOriginal = await pool.query('SELECT COUNT(*) FROM properties');
    console.log(`Total records in properties table: ${totalOriginal.rows[0].count}`);
    
    // Check for duplicates by message content
    const duplicatesByMessage = await pool.query(`
      SELECT message, COUNT(*) as count 
      FROM properties 
      WHERE message IS NOT NULL AND message != ''
      GROUP BY message 
      HAVING COUNT(*) > 1 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    console.log(`\nDuplicate messages found: ${duplicatesByMessage.rows.length}`);
    if (duplicatesByMessage.rows.length > 0) {
      console.log('Top duplicate messages:');
      duplicatesByMessage.rows.forEach(row => {
        console.log(`  - "${row.message.substring(0, 50)}..." appears ${row.count} times`);
      });
    }
    
    // Check for duplicates by property details
    const duplicatesByDetails = await pool.query(`
      SELECT property_name, property_category, regions, COUNT(*) as count
      FROM properties 
      WHERE property_name IS NOT NULL 
        AND property_category IS NOT NULL
        AND regions IS NOT NULL
      GROUP BY property_name, property_category, regions
      HAVING COUNT(*) > 1 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    console.log(`\nDuplicate property combinations: ${duplicatesByDetails.rows.length}`);
    if (duplicatesByDetails.rows.length > 0) {
      console.log('Top duplicate property combinations:');
      duplicatesByDetails.rows.forEach(row => {
        console.log(`  - ${row.property_name} | ${row.property_category} | ${row.regions}: ${row.count} times`);
      });
    }

    // 2. Check WhatsApp messages table structure
    console.log('\n📱 2. ANALYZING WHATSAPP MESSAGES TABLE');
    console.log('---------------------------------------');
    
    try {
      const messagesTableInfo = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        ORDER BY ordinal_position
      `);
      
      if (messagesTableInfo.rows.length > 0) {
        console.log('Messages table structure:');
        messagesTableInfo.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
        const messagesCount = await pool.query('SELECT COUNT(*) FROM messages');
        console.log(`\nTotal messages: ${messagesCount.rows[0].count}`);
        
        // Sample messages
        const sampleMessages = await pool.query('SELECT * FROM messages LIMIT 3');
        console.log('\nSample messages:');
        sampleMessages.rows.forEach((msg, index) => {
          console.log(`  ${index + 1}. ID: ${msg.id}, Content: "${String(msg.content || msg.message || 'N/A').substring(0, 100)}..."`);
        });
        
      } else {
        console.log('❌ Messages table not found or has no columns');
      }
    } catch (error) {
      console.log(`❌ Error analyzing messages table: ${error.message}`);
    }

    // 3. Analyze data patterns in original properties
    console.log('\n📈 3. DATA PATTERNS ANALYSIS');
    console.log('-----------------------------');
    
    const propertyCategories = await pool.query(`
      SELECT property_category, COUNT(*) as count
      FROM properties 
      WHERE property_category IS NOT NULL 
        AND property_category != ''
        AND property_category NOT LIKE '%.jpg%'
      GROUP BY property_category 
      ORDER BY count DESC 
      LIMIT 15
    `);
    
    console.log('Top property categories:');
    propertyCategories.rows.forEach(row => {
      console.log(`  - ${row.property_category}: ${row.count}`);
    });
    
    // Check for suspicious patterns
    const suspiciousPatterns = await pool.query(`
      SELECT 
        COUNT(CASE WHEN message LIKE '%test%' OR message LIKE '%Test%' THEN 1 END) as test_messages,
        COUNT(CASE WHEN property_name LIKE '%test%' OR property_name LIKE '%Test%' THEN 1 END) as test_properties,
        COUNT(CASE WHEN property_category LIKE '%.jpg%' OR property_category LIKE '%.png%' THEN 1 END) as image_categories,
        COUNT(CASE WHEN LENGTH(message) < 10 THEN 1 END) as very_short_messages,
        COUNT(CASE WHEN message IS NULL OR message = '' THEN 1 END) as empty_messages
      FROM properties
    `);
    
    console.log('\nSuspicious patterns detected:');
    const patterns = suspiciousPatterns.rows[0];
    console.log(`  - Test messages: ${patterns.test_messages}`);
    console.log(`  - Test properties: ${patterns.test_properties}`);
    console.log(`  - Image file categories: ${patterns.image_categories}`);
    console.log(`  - Very short messages (<10 chars): ${patterns.very_short_messages}`);
    console.log(`  - Empty messages: ${patterns.empty_messages}`);

    // 4. Check normalized table progress
    console.log('\n🔄 4. NORMALIZED TABLE STATUS');
    console.log('------------------------------');
    
    try {
      const normalizedCount = await pool.query('SELECT COUNT(*) FROM properties_normalized');
      console.log(`Records in normalized table: ${normalizedCount.rows[0].count}`);
      
      const normalizedCategories = await pool.query(`
        SELECT 
          pc.name_en,
          pc.name_ar,
          COUNT(*) as count
        FROM properties_normalized pn
        JOIN property_categories pc ON pn.property_category_id = pc.id
        GROUP BY pc.id, pc.name_en, pc.name_ar
        ORDER BY count DESC
      `);
      
      console.log('\nNormalized categories:');
      normalizedCategories.rows.forEach(row => {
        console.log(`  - ${row.name_en} (${row.name_ar}): ${row.count}`);
      });
      
    } catch (error) {
      console.log(`Error checking normalized table: ${error.message}`);
    }

    // 5. Recommendation for data cleaning
    console.log('\n💡 5. DATA QUALITY RECOMMENDATIONS');
    console.log('-----------------------------------');
    
    const totalDuplicates = duplicatesByMessage.rows.reduce((sum, row) => sum + (row.count - 1), 0);
    const totalSuspicious = parseInt(patterns.test_messages) + 
                           parseInt(patterns.test_properties) + 
                           parseInt(patterns.image_categories);
    
    console.log(`📊 Summary:`);
    console.log(`  - Total original records: ${totalOriginal.rows[0].count}`);
    console.log(`  - Estimated duplicates: ${totalDuplicates}`);
    console.log(`  - Suspicious/test data: ${totalSuspicious}`);
    console.log(`  - Clean data estimate: ${parseInt(totalOriginal.rows[0].count) - totalDuplicates - totalSuspicious}`);
    
    if (totalDuplicates > 1000) {
      console.log('\n⚠️  HIGH DUPLICATE COUNT DETECTED!');
      console.log('   Recommendation: Implement deduplication before migration');
    }
    
    if (totalSuspicious > 500) {
      console.log('\n⚠️  SUSPICIOUS DATA DETECTED!');
      console.log('   Recommendation: Clean test/invalid data before migration');
    }

  } catch (error) {
    console.error('❌ Analysis error:', error);
  } finally {
    await pool.end();
  }
}

analyzeDataQuality();
