# Vercel Environment Variables Setup Guide

## 🔧 Frontend Environment Variables for Vercel

You need to add this environment variable in your Vercel dashboard:

### In Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project: `contaboo`
3. Go to Settings → Environment Variables
4. Add this variable:

**Variable Name:** `VITE_API_URL`
**Value:** `/api`
**Environment:** Production, Preview, Development (select all)

### Why this works:
- `/api` is a relative path that points to your Vercel serverless functions
- Your API endpoints are deployed at `/api/health`, `/api/stats`, etc.
- This allows the frontend to call the backend on the same domain

### Current Issue:
Your frontend is currently trying to call `http://localhost:3001/api` even in production,
which obviously won't work when deployed to Vercel.

## 🚀 Quick Fix:

1. Add `VITE_API_URL=/api` to Vercel environment variables
2. Redeploy your project (or it will auto-redeploy when you change env vars)
3. Your app will immediately work with live data

## 🧪 Test After Fix:
Your frontend will call `/api/stats` instead of `http://localhost:3001/api/stats`
