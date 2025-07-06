#!/bin/bash

# Contaboo Database Setup Script
echo "🚀 Setting up Contaboo with Neon PostgreSQL"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Install PostgreSQL dependencies
echo "📦 Installing PostgreSQL dependencies..."
npm install pg dotenv --save

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database Configuration
USE_POSTGRES=true
DATABASE_URL=your_neon_connection_string_here

# Example:
# DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/contaboo_db?sslmode=require

# Server Configuration
PORT=3001
NODE_ENV=development
EOF
    echo "✅ .env file created. Please update it with your Neon connection string."
else
    echo "✅ .env file already exists"
fi

# Check if we have PostgreSQL connection
echo "🔍 Checking PostgreSQL setup..."
if grep -q "your_neon_connection_string_here" .env; then
    echo "⚠️  Please update your .env file with your Neon connection string"
    echo "   1. Go to https://neon.tech"
    echo "   2. Create a new project called 'Contaboo'"
    echo "   3. Copy the connection string"
    echo "   4. Update the DATABASE_URL in .env"
    echo ""
    echo "📖 Then run: npm run start-postgres"
else
    echo "✅ Database URL configured"
    echo "🚀 Starting PostgreSQL server..."
    npm run start-postgres
fi

echo ""
echo "🎉 Setup complete!"
echo "📚 See NEON_SETUP_GUIDE.md for detailed instructions"
