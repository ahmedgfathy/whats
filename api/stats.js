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
      const result = await pool.query(`
        SELECT 
          property_category as property_type,
          COUNT(*) as count
        FROM properties 
        WHERE property_category IS NOT NULL 
        GROUP BY property_category
        ORDER BY count DESC
      `);

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
