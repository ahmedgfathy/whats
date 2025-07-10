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
      // Get all dropdown data for the frontend
      const results = await Promise.all([
        pool.query('SELECT id, name_ar, name_en FROM property_categories WHERE is_active = true ORDER BY name_en'),
        pool.query('SELECT id, name FROM regions WHERE is_active = true ORDER BY name'),
        pool.query('SELECT id, name, floor_number FROM floor_types WHERE is_active = true ORDER BY floor_number NULLS LAST, name'),
        pool.query('SELECT id, name FROM listing_types WHERE is_active = true ORDER BY name'),
        pool.query('SELECT id, name FROM finish_types WHERE is_active = true ORDER BY name'),
        pool.query('SELECT id, name FROM offered_by_types WHERE is_active = true ORDER BY name'),
        pool.query('SELECT id, name FROM payment_types WHERE is_active = true ORDER BY name'),
        pool.query('SELECT id, name, months FROM payment_frequencies WHERE is_active = true ORDER BY months NULLS LAST, name')
      ]);

      const dropdownData = {
        propertyCategories: results[0].rows,
        regions: results[1].rows,
        floorTypes: results[2].rows,
        listingTypes: results[3].rows,
        finishTypes: results[4].rows,
        offeredByTypes: results[5].rows,
        paymentTypes: results[6].rows,
        paymentFrequencies: results[7].rows
      };

      res.status(200).json({
        success: true,
        data: dropdownData
      });
    } catch (error) {
      console.error('Dropdowns API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dropdown data'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
