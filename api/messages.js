const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
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
      const { id, page = 1, limit = 50, search, type } = req.query;
      
      // If ID is provided, return single message
      if (id) {
        const result = await pool.query(`
          SELECT 
            cm.*,
            p.property_name,
            p.property_category,
            p.regions,
            p.unit_price,
            p.bedroom,
            p.bathroom,
            p.building
          FROM chat_messages cm
          LEFT JOIN properties p ON cm.property_id = p.id
          WHERE cm.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Message not found' });
        }
        
        return res.json(result.rows[0]);
      }
      
      // Otherwise, return list of messages
      const offset = (page - 1) * limit;
      
      // Try normalized table first, fallback to original if needed
      let query, countQuery;
      let params = [];
      let countParams = [];
      let paramCount = 0;
      let countParamCount = 0;
      
      try {
        // Check if normalized table has sufficient data
        const normalizedCountCheck = await pool.query('SELECT COUNT(*) FROM properties_normalized');
        const normalizedCount = parseInt(normalizedCountCheck.rows[0].count);
        
        if (normalizedCount > 1000) {
          // Use normalized table
          query = `
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
          
          countQuery = `
            SELECT COUNT(*) 
            FROM properties_normalized pn
            LEFT JOIN property_categories pc ON pn.property_category_id = pc.id
            LEFT JOIN regions r ON pn.region_id = r.id
            WHERE 1=1
          `;
          
          // Add search filter for normalized table
          if (search) {
            paramCount++;
            query += ` AND (pn.property_name ILIKE $${paramCount} OR pc.name_ar ILIKE $${paramCount} OR pc.name_en ILIKE $${paramCount} OR r.name ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            
            countParamCount++;
            countQuery += ` AND (pn.property_name ILIKE $${countParamCount} OR pc.name_ar ILIKE $${countParamCount} OR pc.name_en ILIKE $${countParamCount} OR r.name ILIKE $${countParamCount})`;
            countParams.push(`%${search}%`);
          }

          // Add type filter for normalized table
          if (type && type !== 'all') {
            paramCount++;
            query += ` AND pc.name_en ILIKE $${paramCount}`;
            params.push(`%${type}%`);
            
            countParamCount++;
            countQuery += ` AND pc.name_en ILIKE $${countParamCount}`;
            countParams.push(`%${type}%`);
          }
          
          query += ` ORDER BY pn.imported_at DESC`;
          
        } else {
          // Use original table as fallback
          query = 'SELECT * FROM properties WHERE 1=1';
          countQuery = 'SELECT COUNT(*) FROM properties WHERE 1=1';
          
          // Add search filter for original table
          if (search) {
            paramCount++;
            query += ` AND (property_name ILIKE $${paramCount} OR property_category ILIKE $${paramCount} OR regions ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            
            countParamCount++;
            countQuery += ` AND (property_name ILIKE $${countParamCount} OR property_category ILIKE $${countParamCount} OR regions ILIKE $${countParamCount})`;
            countParams.push(`%${search}%`);
          }

          // Add type filter for original table
          if (type && type !== 'all') {
            paramCount++;
            query += ` AND property_category ILIKE $${paramCount}`;
            params.push(`%${type}%`);
            
            countParamCount++;
            countQuery += ` AND property_category ILIKE $${countParamCount}`;
            countParams.push(`%${type}%`);
          }
          
          query += ` ORDER BY imported_at DESC`;
        }
      } catch (error) {
        // Fallback to original table on any error
        query = 'SELECT * FROM properties WHERE 1=1';
        countQuery = 'SELECT COUNT(*) FROM properties WHERE 1=1';
        params = [];
        countParams = [];
        paramCount = 0;
        countParamCount = 0;
        
        if (search) {
          paramCount++;
          query += ` AND (property_name ILIKE $${paramCount} OR property_category ILIKE $${paramCount} OR regions ILIKE $${paramCount})`;
          params.push(`%${search}%`);
          
          countParamCount++;
          countQuery += ` AND (property_name ILIKE $${countParamCount} OR property_category ILIKE $${countParamCount} OR regions ILIKE $${countParamCount})`;
          countParams.push(`%${search}%`);
        }

        if (type && type !== 'all') {
          paramCount++;
          query += ` AND property_category ILIKE $${paramCount}`;
          params.push(`%${type}%`);
          
          countParamCount++;
          countQuery += ` AND property_category ILIKE $${countParamCount}`;
          countParams.push(`%${type}%`);
        }
        
        query += ` ORDER BY imported_at DESC`;
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
