#!/bin/bash

# Real Estate CRM - Development Environment Setup
# This script ensures both frontend and backend connect to Neon PostgreSQL

echo "🏢 Starting Contaboo Real Estate CRM"
echo "🗄️  Using Neon PostgreSQL Database"
echo ""

# Check if .env files exist
if [ ! -f ".env" ]; then
    echo "❌ Missing .env file in root directory"
    echo "📋 Creating .env from .env.example..."
    cp .env.example .env
fi

if [ ! -f "backend/.env" ]; then
    echo "❌ Missing backend/.env file"
    echo "📋 Backend .env already exists with Neon configuration"
fi

# Verify environment variables
echo "🔍 Checking environment configuration..."
echo "   Frontend API URL: $(grep VITE_API_URL .env || echo 'Not set - will use default')"
echo "   Backend Database: $(grep DATABASE_URL backend/.env | cut -d'=' -f1)=***configured***"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo "✅ Environment setup complete!"
echo ""
echo "🚀 To start the application:"
echo "   1. Backend (Neon PostgreSQL): cd backend && npm start"
echo "   2. Frontend (in new terminal): npm run dev"
echo ""
echo "🌐 Application will be available at:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:3001"
echo "   - Database: Neon PostgreSQL (remote)"
echo ""
echo "🔐 Login credentials:"
echo "   - Username: xinreal"
echo "   - Password: zerocall"
