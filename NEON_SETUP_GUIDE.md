# Contaboo - Neon Database Setup Guide

## Step 1: Create Neon Database

1. Go to [Neon.tech](https://neon.tech)
2. Sign up/login with your GitHub account
3. Create a new project called "Contaboo"
4. Choose region closest to your users
5. Copy the connection string

## Step 2: Setup Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
USE_POSTGRES=true
DATABASE_URL=your_neon_connection_string_here

# Example:
# DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/contaboo_db?sslmode=require

# Server Configuration
PORT=3001
NODE_ENV=production
```

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

## Step 4: Run Migration

```bash
# This will transfer all your SQLite data to PostgreSQL
npm run migrate
```

## Step 5: Start PostgreSQL Server

```bash
# Start the PostgreSQL-enabled server
npm run start-postgres
```

## Step 6: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend:**
   ```bash
   cd /path/to/Contaboo
   vercel
   ```

3. **Deploy Backend:**
   ```bash
   cd backend
   vercel
   ```

4. **Set Environment Variables in Vercel:**
   - Go to your Vercel dashboard
   - Add `DATABASE_URL` with your Neon connection string
   - Set `NODE_ENV=production`

## Step 7: Update Frontend API URL

Update your frontend to use the deployed backend URL:

```javascript
// In your frontend config
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.vercel.app' 
  : 'http://localhost:3001';
```

## Verification Steps

1. **Test Local PostgreSQL:**
   ```bash
   curl http://localhost:3001/api/health
   curl http://localhost:3001/api/stats
   ```

2. **Test Migration:**
   Check that all your properties and messages are present in the new database.

3. **Test Deployed Version:**
   ```bash
   curl https://your-backend-url.vercel.app/api/health
   ```

## Benefits of This Setup

- ✅ **Serverless**: Automatically scales with traffic
- ✅ **Fast**: Global CDN and edge functions
- ✅ **Reliable**: Built-in backup and monitoring
- ✅ **Cost-effective**: Pay only for what you use
- ✅ **Easy deployment**: One command deployment

## Troubleshooting

### Connection Issues
- Ensure your Neon database allows connections from 0.0.0.0/0
- Check that SSL is enabled in production
- Verify your connection string format

### Migration Issues
- Make sure your SQLite database exists and is readable
- Check PostgreSQL table permissions
- Verify foreign key constraints are properly handled

### Vercel Deployment Issues
- Ensure environment variables are set correctly
- Check function timeout limits (max 10 seconds for hobby plan)
- Verify your API routes are in the correct structure
