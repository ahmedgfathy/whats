#!/bin/bash

echo "🚀 Starting Contaboo Backend Server..."

# Kill any existing Node.js processes
pkill -f "node.*server" 2>/dev/null || true

# Wait a moment
sleep 2

# Change to backend directory
cd /home/xinreal/Contaboo/backend

# Check if required files exist
if [ ! -f "server-postgres.js" ]; then
    echo "❌ server-postgres.js not found!"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Start the server
echo "📡 Starting PostgreSQL server..."
node server-postgres.js &

# Get the process ID
PID=$!

# Wait a moment for server to start
sleep 5

# Check if server is running
if ps -p $PID > /dev/null; then
    echo "✅ Server started successfully (PID: $PID)"
    echo "🌐 Server running at http://localhost:3001"
    
    # Test the server
    echo "🧪 Testing server endpoints..."
    curl -s http://localhost:3001/api/stats | head -100
else
    echo "❌ Server failed to start"
    exit 1
fi
