// Vercel serverless function for health check
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

  if (req.method === 'GET') {
    try {
      // Test database connection
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      res.status(200).json({ 
        success: true, 
        message: 'API is running', 
        database: 'PostgreSQL connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database connection error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Database connection failed',
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
