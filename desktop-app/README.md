# Hospital Billing Desktop Application

A complete offline Windows desktop application for hospital billing management built with Node.js, React, SQLite, and Electron.

## Architecture

### Backend (`/backend/`)
- **Technology**: Node.js + Express.js
- **Database**: SQLite for complete offline operation
- **Port**: 3000 (localhost only)
- **Features**: Full REST API with authentication, patient management, service catalog, billing system

### Frontend (`/frontend/`)
- **Technology**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with medical theme
- **State Management**: React Query for server state
- **Routing**: React Router for navigation

### Desktop Wrapper (`/main.js`)
- **Technology**: Electron for native Windows application
- **Features**: Automatic backend startup, window management, proper app lifecycle

## Features

- **Patient Management**: Add, edit, view patient information
- **Service Catalog**: Manage medical services with pricing
- **Billing System**: Create invoices, track payments
- **Hospital Settings**: Configure hospital information and tax rates
- **Dashboard**: Overview of patients, revenue, and pending bills
- **Offline Operation**: Complete SQLite database, no internet required

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd desktop-app
   ```

2. **Install all dependencies**
   ```bash
   npm install
   ```
   This automatically installs both backend and frontend dependencies.

3. **Build the frontend**
   ```bash
   npm run build
   ```

4. **Start the application**
   ```bash
   npm start
   ```

### Development Mode

For development with hot reload:

```bash
npm run dev
```

This starts:
- Backend server on http://localhost:3000
- Frontend dev server with hot reload
- Electron window automatically

## Default Login

- **Username**: admin
- **Password**: admin123

## Database

The application uses SQLite with the database file stored at `backend/hospital.db`. The database is automatically created and seeded with sample data on first run.

### Sample Data Includes:
- Admin user account
- 3 sample patients
- 4 medical services
- Hospital settings
- Sample invoices

## Building for Distribution

### Create Application Package
```bash
npm run pack
```

### Create Installer (.exe for Windows)
```bash
npm run dist
```

The built application will be in the `dist-electron/` directory.

## Project Structure

```
desktop-app/
├── main.js                 # Electron main process
├── package.json            # Root package configuration
├── backend/                # Express.js API server
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   └── hospital.db        # SQLite database (created on first run)
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # API client and utilities
│   │   └── App.tsx        # Main application component
│   ├── dist/              # Built frontend (after npm run build)
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

### Patients
- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create new service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `PUT /api/invoices/:id/status` - Update invoice status

### Settings
- `GET /api/settings` - Get hospital settings
- `PUT /api/settings` - Update hospital settings

## Customization

### Adding New Features
1. **Backend**: Add new routes in `backend/server.js`
2. **Frontend**: Create new pages in `frontend/src/pages/`
3. **Database**: Modify table creation in `backend/server.js`

### Styling
- Medical theme colors are defined in `frontend/src/index.css`
- TailwindCSS classes are used throughout components
- Custom CSS classes follow BEM methodology

### Configuration
- Backend port can be changed in `backend/server.js`
- Frontend API base URL is in `frontend/src/lib/api.ts`
- Electron window settings are in `main.js`

## Troubleshooting

### Backend Won't Start
- Check if port 3000 is already in use
- Verify Node.js version (18+ required)
- Check `backend/hospital.db` file permissions

### Frontend Build Issues
- Run `npm run frontend:install` to reinstall dependencies
- Clear `frontend/dist` and rebuild
- Check TypeScript compilation errors

### Electron Issues
- Update Electron: `npm install electron@latest`
- Clear electron cache: `npx electron-builder clean`
- Check main.js for path issues

## License

MIT License - Feel free to modify and distribute as needed.