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
      const { page = 1, limit = 50, search, type } = req.query;
      const offset = (page - 1) * limit;
      
      let query = 'SELECT * FROM properties WHERE 1=1';
      let params = [];
      let paramCount = 0;

      // Add search filter
      if (search) {
        paramCount++;
        query += ` AND (property_name ILIKE $${paramCount} OR property_category ILIKE $${paramCount} OR regions ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      // Add type filter
      if (type && type !== 'all') {
        paramCount++;
        query += ` AND property_category ILIKE $${paramCount}`;
        params.push(`%${type}%`);
      }

      // Add pagination
      query += ` ORDER BY created_time DESC`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      
      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM properties WHERE 1=1';
      let countParams = [];
      let countParamCount = 0;
      
      if (search) {
        countParamCount++;
        countQuery += ` AND (property_name ILIKE $${countParamCount} OR property_category ILIKE $${countParamCount} OR regions ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }
      
      if (type && type !== 'all') {
        countParamCount++;
        countQuery += ` AND property_category ILIKE $${countParamCount}`;
        countParams.push(`%${type}%`);
      }
      
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.status(200).json({
        success: true,
        messages: result.rows,
        total: total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      console.error('Messages API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch messages'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
