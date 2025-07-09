#!/bin/zsh
echo "🔍 Testing Node.js..."
node --version || echo "❌ Node.js not found"

echo "🔍 Testing npm..."
npm --version || echo "❌ npm not found"

echo "🔍 Checking current directory..."
pwd

echo "🔍 Checking if pg module exists..."
cd /Users/ahmedgomaa/Downloads/Contaboo
npm list pg 2>/dev/null || echo "❌ pg module not found"

echo "🔍 Testing simple Node.js execution..."
echo "console.log('Hello from Node.js');" | node || echo "❌ Node.js execution failed"

echo "✅ Debug complete"
