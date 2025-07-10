#!/bin/bash

echo "🔍 Testing Contaboo Backend Endpoints..."

BASE_URL="http://localhost:3001/api"

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq . || echo "❌ Health endpoint failed"
echo ""

# Test properties endpoint
echo "2. Testing properties endpoint..."
curl -s "$BASE_URL/properties?limit=3" | jq '. | length' || echo "❌ Properties endpoint failed"
echo ""

# Test stats endpoint
echo "3. Testing stats endpoint..."
curl -s "$BASE_URL/stats" | jq . || echo "❌ Stats endpoint failed"
echo ""

# Test specific property
echo "4. Testing specific property (ID: 1)..."
curl -s "$BASE_URL/properties/1" | jq . || echo "❌ Property by ID endpoint failed"
echo ""

# Test search
echo "5. Testing search endpoint..."
curl -s "$BASE_URL/search-properties?q=شقة&limit=2" | jq . || echo "❌ Search endpoint failed"
echo ""

echo "✅ All tests completed!"
