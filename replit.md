# Hospital Billing System - replit.md

## Overview

This is a comprehensive hospital billing system built with modern web technologies. The application provides a complete solution for managing patients, services, invoices, and hospital settings with a clean, professional interface designed specifically for healthcare billing operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom medical theme colors
- **Build Tool**: Vite for development and building
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Basic authentication (placeholder for production auth)

### Key Components

#### Database Schema
- **Users**: Authentication and role management
- **Patients**: Patient information and contact details
- **Services**: Medical services catalog with pricing
- **Invoices**: Billing records with line items
- **Invoice Items**: Individual services on invoices
- **Hospital Settings**: System configuration and branding

#### API Endpoints
- **Authentication**: `/api/auth/login`
- **Dashboard**: `/api/dashboard/stats`
- **Patients**: CRUD operations at `/api/patients`
- **Services**: CRUD operations at `/api/services`
- **Invoices**: Invoice management at `/api/invoices`
- **Settings**: Hospital configuration at `/api/settings`

#### UI Pages
- **Login**: Authentication interface
- **Dashboard**: Overview with statistics and recent activity
- **Patients**: Patient management with add/edit/delete functionality
- **Billing**: Invoice creation and management
- **Services**: Medical services catalog management
- **Settings**: Hospital configuration and system settings

## Data Flow

1. **Authentication Flow**: Users log in through a simple form, receiving basic user session data
2. **Data Fetching**: TanStack Query handles API calls with caching and error handling
3. **Form Submission**: React Hook Form with Zod validation processes user input
4. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
5. **Real-time Updates**: Query invalidation ensures UI stays synchronized with backend changes

## External Dependencies

### Production Dependencies
- **UI Components**: Comprehensive Radix UI component library
- **Database**: Neon serverless PostgreSQL
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React icon library

### Development Dependencies
- **Build Tools**: Vite, esbuild for production builds
- **Development**: tsx for TypeScript execution
- **Linting**: Built-in TypeScript checking

## Deployment Strategy

### Development
- Uses Vite dev server with HMR
- Express server runs with tsx for TypeScript support
- Replit-specific plugins for development environment

### Production Build
- Frontend: Vite builds React app to `dist/public`
- Backend: esbuild bundles Express server to `dist/index.js`
- Single deployment artifact with static file serving

### Database Management
- Drizzle migrations stored in `./migrations`
- Schema defined in `shared/schema.ts`
- Environment variable `DATABASE_URL` required for database connection

### Environment Requirements
- Node.js with ES module support
- PostgreSQL database (Neon recommended)
- Environment variables for database connection

The application follows a monorepo structure with shared TypeScript types between frontend and backend, ensuring type safety across the entire stack. The medical theme provides a professional healthcare appearance with custom color schemes and iconography suitable for hospital environments.

## Frontend Build Fix (January 29, 2025)

### Issue Resolution
Fixed critical frontend build errors caused by drizzle-orm imports in frontend code:

**Problem**: Frontend was importing schemas from `@shared/schema` which contained drizzle-orm dependencies, causing build failures when trying to bundle for production.

**Solution**:
- Created `frontend/src/lib/types.ts` with frontend-only Zod schemas
- Removed `@shared` alias from frontend vite.config.ts
- Updated patient-modal.tsx and service-modal.tsx to use local types
- Frontend now builds successfully without drizzle-orm dependencies

**Key Changes**:
- ✓ Frontend builds without drizzle-orm imports
- ✓ Proper separation between frontend types and backend schema
- ✓ Maintained type safety with Zod validation
- ✓ Fixed deployment build process for Vercel

## Deployment Architecture (January 27, 2025)

### Separated Frontend/Backend Structure
The project has been restructured into separate folders for deployment:

#### Frontend Folder (`/frontend/`)
- **Technology**: React 18 with TypeScript and Vite
- **Deployment Target**: Vercel
- **Port**: 3000 (development)
- **Features**: Complete React application with all UI components
- **API Integration**: Configured to connect to backend API via environment variables
- **Configuration**: `vercel.json` for SPA routing and environment variables

#### Backend Folder (`/backend/`)
- **Technology**: Express.js with TypeScript
- **Deployment Target**: Render
- **Port**: 5000 (configurable via PORT environment variable)
- **Features**: Complete REST API with PostgreSQL database
- **Database**: Neon serverless PostgreSQL
- **Configuration**: `render.yaml` for deployment settings

#### Key Deployment Features
- **CORS Configuration**: Backend configured to accept requests from frontend domain
- **Environment Variables**: Separate `.env.example` files for each service
- **API Communication**: Frontend uses VITE_API_URL to connect to backend
- **Database**: Shared PostgreSQL database accessible from backend
- **Build Scripts**: Optimized for production deployment

#### Environment Variables
**Frontend (.env)**:
```
VITE_API_URL=https://your-backend-api.render.com
```

**Backend (.env)**:
```
DATABASE_URL=postgresql://user:password@host:port/database
FRONTEND_URL=https://your-frontend.vercel.app
PORT=5000
```

#### Deployment Process
1. **Backend**: Deploy to Render with PostgreSQL database
2. **Frontend**: Deploy to Vercel with backend API URL
3. **Database**: Shared Neon PostgreSQL instance
4. **CORS**: Configured for cross-origin communication

This separation allows for independent scaling and deployment of frontend and backend services while maintaining the shared database and type safety.

## Desktop Application (Windows)

### January 26, 2025 - Desktop Application Structure
A complete Windows desktop version has been created in the `desktop-app/` folder with separated frontend and backend architecture:

#### Backend Architecture (`desktop-app/backend/`)
- **Technology**: Node.js with Express.js
- **Database**: SQLite for complete offline operation
- **Port**: 3000 (separate from web version)
- **Features**: Full REST API with all hospital billing endpoints
- **Storage**: Local SQLite database file (`hospital.db`)

#### Frontend Architecture (`desktop-app/frontend/`)
- **Technology**: React with TypeScript and Vite
- **Styling**: TailwindCSS with medical theme
- **API**: Configured to connect to localhost:3000 backend
- **Build**: Optimized for Electron desktop deployment

#### Desktop Wrapper (`desktop-app/main.js`)
- **Technology**: Electron for native Windows application
- **Features**: Automatic backend startup, window management
- **Default**: 1200x800 window with proper app lifecycle

#### Key Differences from Web Version
- Uses SQLite instead of PostgreSQL for offline operation
- Backend runs on port 3000 instead of 5000
- Electron provides native desktop experience
- Completely self-contained with no external dependencies
- Default login: admin/admin123

#### Installation & Usage
```bash
cd desktop-app
npm install              # Installs all dependencies (backend + frontend + electron)
npm run build           # Builds React frontend for production
npm start               # Starts Electron desktop application
```

#### Development Mode
```bash
cd desktop-app
npm run dev             # Starts backend, frontend dev server, and Electron
```

#### Building for Distribution
```bash
cd desktop-app
npm run pack            # Creates packaged app (unpacked)
npm run dist            # Creates installer (.exe for Windows)
```