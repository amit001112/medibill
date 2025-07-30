# Hospital Billing System - Backend API

This is the Express.js backend API for the Hospital Billing System with PostgreSQL database.

## Features

- RESTful API endpoints for hospital billing operations
- PostgreSQL database with Drizzle ORM
- User authentication system
- Patient management
- Service catalog management
- Invoice creation and management
- Hospital settings configuration
- CORS enabled for frontend integration

## Tech Stack

- Node.js with Express.js
- TypeScript
- PostgreSQL with Neon serverless
- Drizzle ORM
- Zod for validation
- CORS for cross-origin requests

## Environment Variables

Create a `.env` file based on `.env.example`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/hospital_billing
FRONTEND_URL=http://localhost:3000
PORT=5000
```

## Development

```bash
npm install
npm run dev
```

## Database Setup

```bash
npm run db:push
```

## Deployment on Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `NODE_ENV`: production
4. Deploy automatically on push to main branch

The `render.yaml` configuration includes database setup and environment variables.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Services
- `GET /api/services` - List all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Invoices
- `GET /api/invoices` - List all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id/status` - Update invoice status
- `DELETE /api/invoices/:id` - Delete invoice

### Settings
- `GET /api/settings` - Get hospital settings
- `PUT /api/settings` - Update hospital settings

## Build

```bash
npm run build
```

This creates a bundled `dist/index.js` file for production deployment.