#!/bin/bash

echo "🚀 Starting Contaboo Backend Server..."

# Change to backend directory
cd "$(dirname "$0")/backend"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found in backend directory!"
    exit 1
fi

# Kill any existing processes on port 3001
echo "🔄 Checking for existing processes on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

# Start the server
echo "📡 Starting PostgreSQL server on port 3001..."
node server-postgres.js

echo "✅ Server started successfully!"
echo "🌐 Backend API: http://localhost:3001/api"
echo "🔗 Health check: http://localhost:3001/api/health"
