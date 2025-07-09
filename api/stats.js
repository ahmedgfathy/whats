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
      // Try normalized table first, fallback to original table if needed
      let result;
      try {
        result = await pool.query(`
          SELECT 
            pc.name_en as property_type,
            COUNT(*) as count
          FROM properties_normalized pn
          LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
          WHERE pc.name_en IS NOT NULL 
          GROUP BY pc.name_en
          ORDER BY count DESC
        `);
        
        // If normalized table has very few records, fallback to original
        const totalNormalized = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
        if (totalNormalized < 1000) {
          console.log('Using fallback to original table due to ongoing migration');
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
        }
      } catch (error) {
        console.error('Error with normalized query, using fallback:', error);
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
      }

      const stats = result.rows;
      
      res.status(200).json({
        success: true,
        stats: stats
      });
    } catch (error) {
      console.error('Stats API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
