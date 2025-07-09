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
      
      let query = `
        SELECT 
          pn.*,
          pc.name_ar as category_ar,
          pc.name_en as category_en,
          r.name as region_name,
          lt.name as listing_type_name,
          ft.name as floor_type_name,
          finst.name as finish_type_name
        FROM properties_normalized pn
        LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
        LEFT JOIN regions r ON pn.region_id = r.id
        LEFT JOIN listing_types lt ON pn.listing_type_id = lt.id
        LEFT JOIN floor_types ft ON pn.floor_type_id = ft.id
        LEFT JOIN finish_types finst ON pn.finish_type_id = finst.id
        WHERE 1=1
      `;
      let params = [];
      let paramCount = 0;

      // Add search filter
      if (search) {
        paramCount++;
        query += ` AND (pn.property_name ILIKE $${paramCount} OR pc.name_ar ILIKE $${paramCount} OR pc.name_en ILIKE $${paramCount} OR r.name ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      // Add type filter
      if (type && type !== 'all') {
        paramCount++;
        query += ` AND pc.name_en ILIKE $${paramCount}`;
        params.push(`%${type}%`);
      }

      // Add pagination
      query += ` ORDER BY pn.imported_at DESC`;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);
      
      // Get total count
      let countQuery = `
        SELECT COUNT(*) 
        FROM properties_normalized pn
        LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
        LEFT JOIN regions r ON pn.region_id = r.id
        WHERE 1=1
      `;
      let countParams = [];
      let countParamCount = 0;
      
      if (search) {
        countParamCount++;
        countQuery += ` AND (pn.property_name ILIKE $${countParamCount} OR pc.name_ar ILIKE $${countParamCount} OR pc.name_en ILIKE $${countParamCount} OR r.name ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }
      
      if (type && type !== 'all') {
        countParamCount++;
        countQuery += ` AND pc.name_en ILIKE $${countParamCount}`;
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
