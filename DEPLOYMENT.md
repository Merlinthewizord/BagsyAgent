# BagsyAgent Deployment Guide

## Quick Fix for Vercel Deployment Error

**Error:** "No Next.js version detected"

**Solution:** In Vercel project settings, set:
- **Root Directory**: `frontend`
- **Framework Preset**: Next.js

This tells Vercel where to find your Next.js app.

## Project Structure

- `frontend/` - Next.js frontend application
- `server/` - Express.js backend API server

## Deploying Frontend to Vercel

### Method 1: Vercel Dashboard (Easiest)

1. Go to vercel.com and import your GitHub repository
2. **Important Settings:**
   - Root Directory: `frontend`
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = your backend URL

### Method 2: Vercel CLI

```bash
cd frontend
vercel
```

## Deploying Backend

Deploy the `server/` directory to Railway, Render, or Fly.io

### Environment Variables for Backend:
- `PORT=3001`
- `FRONTEND_URL=https://your-frontend.vercel.app`
- `BOT_API_KEY=your-secret-key` (optional)

## Testing Locally

Frontend:
```bash
cd frontend && npm install && npm run dev
```

Backend:
```bash
cd server && npm install && npm run dev
```
