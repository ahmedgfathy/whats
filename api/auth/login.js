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

  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;

      // Simple hardcoded authentication
      if (username === 'xinreal' && password === 'zerocall') {
        res.status(200).json({
          success: true,
          message: 'Login successful',
          user: { username, role: 'admin' }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
    } catch (error) {
      console.error('Auth API error:', error);
      res.status(500).json({
        success: false,
        error: 'Authentication failed'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
