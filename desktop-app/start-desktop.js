#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🏥 Starting Hospital Billing Desktop Application...');

// Check if frontend is built
const frontendDist = path.join(__dirname, 'frontend', 'dist', 'index.html');
if (!fs.existsSync(frontendDist)) {
  console.log('❌ Frontend not built. Building now...');
  const buildProcess = spawn('npm', ['run', 'build'], {
    cwd: __dirname,
    stdio: 'inherit'
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Frontend built successfully');
      startApp();
    } else {
      console.log('❌ Frontend build failed');
      process.exit(1);
    }
  });
} else {
  console.log('✅ Frontend already built');
  startApp();
}

function startApp() {
  console.log('🚀 Starting backend server...');
  
  // Start backend
  const backend = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'pipe'
  });

  backend.stdout.on('data', (data) => {
    console.log(`Backend: ${data.toString().trim()}`);
    if (data.toString().includes('running on port 3000')) {
      console.log('✅ Backend ready, starting Electron...');
      
      // Start Electron
      const electron = spawn('npx', ['electron', '.'], {
        cwd: __dirname,
        stdio: 'inherit'
      });

      electron.on('close', () => {
        console.log('🔸 Electron closed, stopping backend...');
        backend.kill();
        process.exit(0);
      });
    }
  });

  backend.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data.toString().trim()}`);
  });

  backend.on('close', (code) => {
    console.log(`Backend exited with code ${code}`);
  });

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('🛑 Shutting down...');
    backend.kill();
    process.exit(0);
  });
}