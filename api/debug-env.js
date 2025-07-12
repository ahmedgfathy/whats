// Debug endpoint to check environment variables
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const debugInfo = {
      success: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set',
        // Include first part of database URL for verification
        DATABASE_URL_PREVIEW: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] : 'Not set'
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(debugInfo);
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
