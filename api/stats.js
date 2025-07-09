const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      let result;
      let dataSource = 'original';
      let migrationProgress = 'using_original';
      
      try {
        // First check if normalized table has sufficient data
        const normalizedCountResult = await pool.query('SELECT COUNT(*) FROM properties_normalized');
        const normalizedCount = parseInt(normalizedCountResult.rows[0].count);
        
        console.log(`📊 Found ${normalizedCount} records in normalized table`);
        
        if (normalizedCount >= 1000) {
          // Use normalized data with proper categories
          console.log('✅ Using normalized table data');
          result = await pool.query(`
            SELECT 
              pc.name_en as property_type,
              COUNT(*) as count
            FROM properties_normalized pn
            LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
            WHERE pc.name_en IS NOT NULL 
            GROUP BY pc.name_en, pc.id
            ORDER BY count DESC
          `);
          dataSource = 'normalized';
          migrationProgress = 'using_normalized';
        } else {
          throw new Error('Insufficient normalized data');
        }
        
      } catch (normalizedError) {
        console.log('🔄 Falling back to original table with clean data');
        
        // Use clean view if available, otherwise original table
        try {
          result = await pool.query(`
            SELECT 
              CASE 
                WHEN property_category LIKE '%شقق%' OR property_category LIKE '%دوبلكس%' OR property_category LIKE '%روف%' THEN 'Compound Apartments'
                WHEN property_category LIKE '%فيلا%' OR property_category LIKE '%تاون%' OR property_category LIKE '%توين%' THEN 'Independent Villas'
                WHEN property_category LIKE '%أرض%' OR property_category LIKE '%اراضي%' THEN 'Land & Local Villas'
                WHEN property_category LIKE '%محل%' OR property_category LIKE '%اداري%' THEN 'Commercial & Administrative'
                WHEN property_category LIKE '%ساحل%' THEN 'North Coast'
                WHEN property_category LIKE '%سخنة%' THEN 'Ain Sokhna'
                WHEN property_category LIKE '%رحاب%' OR property_category LIKE '%مدينتي%' THEN 'Rehab & Madinaty'
                ELSE 'Various Areas'
              END as property_type,
              COUNT(*) as count
            FROM properties_clean
            GROUP BY property_type
            ORDER BY count DESC
          `);
          dataSource = 'clean_original';
          migrationProgress = 'using_clean_data';
        } catch (cleanError) {
          // Final fallback to original table
          result = await pool.query(`
            SELECT 
              CASE 
                WHEN property_category LIKE '%شقق%' OR property_category LIKE '%دوبلكس%' OR property_category LIKE '%روف%' THEN 'Compound Apartments'
                WHEN property_category LIKE '%فيلا%' OR property_category LIKE '%تاون%' OR property_category LIKE '%توين%' THEN 'Independent Villas'
                WHEN property_category LIKE '%أرض%' OR property_category LIKE '%اراضي%' THEN 'Land & Local Villas'
                WHEN property_category LIKE '%محل%' OR property_category LIKE '%اداري%' THEN 'Commercial & Administrative'
                WHEN property_category LIKE '%ساحل%' THEN 'North Coast'
                WHEN property_category LIKE '%سخنة%' THEN 'Ain Sokhna'
                WHEN property_category LIKE '%رحاب%' OR property_category LIKE '%مدينتي%' THEN 'Rehab & Madinaty'
                ELSE 'Various Areas'
              END as property_type,
              COUNT(*) as count
            FROM properties 
            WHERE property_category IS NOT NULL 
              AND property_category != ''
              AND property_category NOT LIKE '%.jpg%'
            GROUP BY property_type
            ORDER BY count DESC
          `);
          dataSource = 'original';
          migrationProgress = 'using_raw_data';
        }
      }

      const stats = result.rows;
      
      // Ensure we always return data
      if (!stats || stats.length === 0) {
        return res.status(200).json({
          success: true,
          stats: [
            { property_type: 'Compound Apartments', count: 0 },
            { property_type: 'Independent Villas', count: 0 },
            { property_type: 'Land & Local Villas', count: 0 },
            { property_type: 'Commercial & Administrative', count: 0 },
            { property_type: 'North Coast', count: 0 },
            { property_type: 'Ain Sokhna', count: 0 },
            { property_type: 'Rehab & Madinaty', count: 0 },
            { property_type: 'Various Areas', count: 0 }
          ],
          dataSource: 'fallback',
          migrationProgress: 'no_data',
          message: 'No data available, showing empty categories'
        });
      }
      
      res.status(200).json({
        success: true,
        stats: stats,
        dataSource: dataSource,
        migrationProgress: migrationProgress,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Stats API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
        details: error.message,
        dataSource: 'error',
        migrationProgress: 'error'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
