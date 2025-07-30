# Hospital Billing System - Frontend

This is the React frontend for the Hospital Billing System, built with Vite and TypeScript.

## Features

- Patient management
- Service catalog management
- Invoice creation and billing
- Print functionality for invoices
- Hospital settings configuration
- Indian Rupee (INR) currency support
- Mark invoices as paid/pending

## Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Radix UI components
- TanStack Query for API state management
- React Hook Form with Zod validation
- Wouter for routing

## Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_API_URL=http://localhost:5000
```

For production deployment on Vercel, set:
```
VITE_API_URL=https://your-backend-api.render.com
```

## Development

```bash
npm install
npm run dev
```

## Deployment on Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variable `VITE_API_URL` to your backend API URL
3. Deploy automatically on push to main branch

The `vercel.json` configuration handles SPA routing and environment variables.

## Build

```bash
npm run build
```

The build output will be in the `dist` directory.