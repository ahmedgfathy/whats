// Vercel serverless function for individual property by ID
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ error: 'Property ID is required' });
      }
      
      // Check if we have relationships set up
      const hasRelationships = await pool.query(`
        SELECT COUNT(*) as count FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'property_type_id'
      `);
      
      let result;
      if (hasRelationships.rows[0].count > 0) {
        // Use relationship-based query
        result = await pool.query(`
          SELECT 
            p.*,
            pt.name_arabic as property_type_name_ar,
            pt.name_english as property_type_name_en,
            a.name_arabic as area_name_ar,
            a.name_english as area_name_en,
            ag.name as agent_name,
            ag.phone as agent_phone,
            ag.description as agent_description
          FROM properties p
          LEFT JOIN property_types pt ON p.property_type_id = pt.id
          LEFT JOIN areas a ON p.area_id = a.id
          LEFT JOIN agents ag ON p.agent_id = ag.id
          WHERE p.id = $1
        `, [id]);
      } else {
        // Fallback to basic query
        result = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
      }
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      const property = result.rows[0];
      
      // Also get related chat messages if available
      try {
        const messagesResult = await pool.query(`
          SELECT * FROM chat_messages 
          WHERE property_id = $1 
          ORDER BY created_at DESC 
          LIMIT 10
        `, [id]);
        
        property.related_messages = messagesResult.rows;
      } catch (error) {
        // If relationship doesn't exist yet, just skip
        property.related_messages = [];
      }
      
      res.json(property);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      res.status(200).json(result.rows[0]);
      
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Property by ID API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
