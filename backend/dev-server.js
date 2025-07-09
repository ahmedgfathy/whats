const express = require('express');
const cors = require('cors');
const path = require('path');

// Import API handlers
const statsHandler = require('../api/stats');
const messagesHandler = require('../api/messages');
const dropdownsHandler = require('../api/dropdowns');
const healthHandler = require('../api/health');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Convert Vercel API handlers to Express middleware
const wrapHandler = (handler) => {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Handler Error:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: error.message || 'Internal server error' 
        });
      }
    }
  };
};

// API Routes
app.use('/api/stats', wrapHandler(statsHandler));
app.use('/api/messages', wrapHandler(messagesHandler));
app.use('/api/dropdowns', wrapHandler(dropdownsHandler));
app.use('/api/health', wrapHandler(healthHandler));

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Real Estate CRM Development API Server',
    status: 'running',
    endpoints: [
      'GET /api/stats',
      'GET /api/messages',
      'GET /api/dropdowns',
      'GET /api/health'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development API Server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - GET http://localhost:${PORT}/api/stats`);
  console.log(`   - GET http://localhost:${PORT}/api/messages`);
  console.log(`   - GET http://localhost:${PORT}/api/dropdowns`);
  console.log(`   - GET http://localhost:${PORT}/api/health`);
  console.log(`\n🔗 Frontend should connect to: http://localhost:${PORT}/api`);
});

module.exports = app;
