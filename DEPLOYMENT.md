# Hospital Billing System - Deployment Guide

This project has been restructured into separate frontend and backend folders for cloud deployment.

## Project Structure

```
├── frontend/          # React app for Vercel deployment
├── backend/           # Express API for Render deployment
├── desktop-app/       # Windows desktop version (Electron)
└── DEPLOYMENT.md      # This file
```

## Quick Start

### Frontend (Vercel)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Render)
```bash
cd backend
npm install
npm run dev
```

## Deployment Steps

### 1. Deploy Backend to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Configure environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `FRONTEND_URL`: Your Vercel frontend URL (after step 2)
   - `NODE_ENV`: production
5. Deploy and note the backend URL

### 2. Deploy Frontend to Vercel

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Configure environment variable:
   - `VITE_API_URL`: Your Render backend URL from step 1
4. Deploy

### 3. Update CORS Settings

After both deployments:
1. Update backend `FRONTEND_URL` environment variable with actual Vercel URL
2. Update frontend `VITE_API_URL` environment variable with actual Render URL
3. Redeploy both services

## Features

✅ **Complete Hospital Billing System**
- Patient management
- Service catalog
- Invoice creation and billing
- Print functionality
- Hospital settings
- Indian Rupee (INR) currency
- Mark invoices as paid/pending

✅ **Modern Tech Stack**
- React 18 + TypeScript
- Express.js + PostgreSQL
- TailwindCSS + Radix UI
- Drizzle ORM

✅ **Production Ready**
- CORS configured
- Environment variables
- Build optimization
- Error handling
- Database migrations

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://your-backend-api.render.com
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
FRONTEND_URL=https://your-frontend.vercel.app
PORT=5000
NODE_ENV=production
```

## Database Setup

The backend uses PostgreSQL with Drizzle ORM. Run migrations after deployment:

```bash
npm run db:push
```

## Support

- Frontend: React + Vite + TypeScript
- Backend: Express + PostgreSQL + TypeScript
- Desktop: Electron + SQLite (separate in desktop-app folder)

Both cloud deployments share the same PostgreSQL database and provide a complete hospital billing solution with Indian Rupee currency support.