const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Add icon if available
    show: false, // Don't show until ready
  });

  // Load the frontend - check if dist exists first
  const frontendPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  if (require('fs').existsSync(frontendPath)) {
    mainWindow.loadFile(frontendPath);
  } else {
    // Fallback to development server or show error
    console.error('Frontend dist folder not found. Please run "npm run build" first.');
    mainWindow.loadURL('data:text/html,<h1 style="text-align:center;margin-top:200px;">Frontend not built. Please run "npm run build" first.</h1>');
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  return new Promise((resolve, reject) => {
    const backendPath = path.join(__dirname, 'backend');
    
    // Start the backend server with proper ES module support
    backendProcess = spawn('node', ['server.js'], {
      cwd: backendPath,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'production' }
    });

    let backendReady = false;

    backendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Backend: ${output}`);
      if ((output.includes('Server running on port') || output.includes('listening on port') || output.includes('running on port')) && !backendReady) {
        backendReady = true;
        resolve();
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
      if (code !== 0 && !backendReady) {
        reject(new Error(`Backend process exited with code ${code}`));
      }
    });

    backendProcess.on('error', (error) => {
      console.error('Backend process error:', error);
      reject(error);
    });

    // Resolve after a longer delay if no specific message is found
    setTimeout(() => {
      if (!backendReady) {
        console.log('Backend timeout reached, assuming it started');
        resolve();
      }
    }, 5000);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

// App event handlers
app.whenReady().then(async () => {
  try {
    console.log('Starting Hospital Billing Desktop Application...');
    
    // Start backend first
    await startBackend();
    console.log('Backend started successfully');
    
    // Then create the window
    createWindow();
    console.log('Frontend window created');
    
  } catch (error) {
    console.error('Failed to start application:', error);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// Handle app quit
process.on('exit', () => {
  stopBackend();
});

process.on('SIGINT', () => {
  stopBackend();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopBackend();
  process.exit(0);
});