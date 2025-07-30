const { app, BrowserWindow } = require('electron');
const express = require('express');
const cors = require('cors');
const path = require('path');

let mainWindow;
let server;

// Simple backend server
function startBackend() {
  const backend = express();
  backend.use(cors());
  backend.use(express.json());

  // Sample data
  const patients = [
    { id: 1, name: 'Sarah Johnson', phone: '+91-9876543210', status: 'active' },
    { id: 2, name: 'Michael Davis', phone: '+91-9876543211', status: 'active' },
    { id: 3, name: 'John Smith', phone: '+91-9876543212', status: 'active' }
  ];

  const stats = {
    totalPatients: 3,
    totalInvoices: 0,
    monthlyRevenue: 0,
    pendingBills: 0
  };

  // API routes
  backend.get('/api/dashboard/stats', (req, res) => {
    res.json(stats);
  });

  backend.get('/api/patients', (req, res) => {
    res.json(patients);
  });

  backend.get('/api/invoices', (req, res) => {
    res.json([]);
  });

  // Start server
  server = backend.listen(3000, () => {
    console.log('Backend running on port 3000');
    createWindow();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    title: 'Hospital Billing Desktop',
    icon: null
  });

  // Load the built frontend
  const frontendPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  mainWindow.loadFile(frontendPath);

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (server) {
      server.close();
    }
    app.quit();
  });
}

app.whenReady().then(() => {
  startBackend();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (server) {
      server.close();
    }
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    startBackend();
  }
});