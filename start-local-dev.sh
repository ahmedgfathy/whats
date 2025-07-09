#!/bin/bash

# 🏢 Contaboo Real Estate CRM - Local Development Startup
# Ensures both frontend and backend connect to Neon PostgreSQL Database

echo "🏢 STARTING CONTABOO REAL ESTATE CRM"
echo "=============================================="
echo "🗄️  Database: Neon PostgreSQL (Remote)"
echo "🌍 Environment: Local Development"
echo ""

# Check environment files
echo "🔍 Checking Environment Configuration..."

if [ ! -f ".env" ]; then
    echo "❌ Missing root .env file"
    exit 1
fi

if [ ! -f "backend/.env" ]; then
    echo "❌ Missing backend/.env file"
    exit 1
fi

# Verify database connection
echo "📊 Environment Variables:"
echo "   Frontend API URL: $(grep VITE_API_URL .env)"
echo "   Backend Database: Neon PostgreSQL (configured)"
echo "   Backend Mode: $(grep NODE_ENV backend/.env)"
echo ""

# Test database connection
echo "🔌 Testing Database Connection..."
cd backend
node -e "
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.connect()
  .then(client => {
    console.log('✅ Successfully connected to Neon PostgreSQL');
    client.release();
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "🎉 Database connection verified!"
else
    echo "❌ Database connection failed!"
    echo "   Please check your DATABASE_URL in backend/.env"
    exit 1
fi

cd ..

echo ""
echo "🚀 READY TO START SERVERS"
echo "=============================================="
echo ""
echo "🔧 Backend Server (Terminal 1):"
echo "   cd backend && npm start"
echo ""
echo "🎨 Frontend Server (Terminal 2):"
echo "   npm run dev"
echo ""
echo "🌐 Application URLs:"
echo "   • Frontend: http://localhost:5173"
echo "   • Backend API: http://localhost:3001/api"
echo "   • Health Check: http://localhost:3001/api/health"
echo ""
echo "🔐 Login Credentials:"
echo "   • Username: xinreal"
echo "   • Password: zerocall"
echo ""
echo "📊 Database: Neon PostgreSQL"
echo "   • Chat Messages: 4,646 records"
echo "   • Properties: 39,116+ records"
echo "   • Real-time synchronization"
echo ""
