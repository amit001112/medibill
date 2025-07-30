import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'hospital.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Patients table
    db.run(`CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      date_of_birth TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Services table
    db.run(`CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Invoices table
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      patient_id TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      subtotal TEXT NOT NULL,
      tax_rate TEXT NOT NULL,
      tax_amount TEXT NOT NULL,
      total TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id)
    )`);

    // Invoice items table
    db.run(`CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price TEXT NOT NULL,
      total TEXT NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices (id),
      FOREIGN KEY (service_id) REFERENCES services (id)
    )`);

    // Hospital settings table
    db.run(`CREATE TABLE IF NOT EXISTS hospital_settings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      logo_url TEXT,
      currency TEXT DEFAULT 'USD',
      tax_rate TEXT DEFAULT '0',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Seed initial data
    seedInitialData();
  });
}

function seedInitialData() {
  // Check if admin user exists
  db.get("SELECT id FROM users WHERE username = 'admin'", (err, row) => {
    if (!row) {
      // Create admin user
      db.run(`INSERT INTO users (id, username, password, name, role) 
              VALUES (?, ?, ?, ?, ?)`, 
              [nanoid(), 'admin', 'admin123', 'Administrator', 'admin']);

      // Create sample patients
      const patients = [
        { name: 'John Smith', email: 'john.smith@email.com', phone: '+1-555-0123', address: '123 Main St, City, State 12345', dateOfBirth: '1980-05-15' },
        { name: 'Sarah Johnson', email: 'sarah.johnson@email.com', phone: '+1-555-0124', address: '456 Oak Ave, City, State 12345', dateOfBirth: '1975-08-22' },
        { name: 'Michael Davis', email: 'michael.davis@email.com', phone: '+1-555-0125', address: '789 Pine St, City, State 12345', dateOfBirth: '1992-12-03' }
      ];

      patients.forEach(patient => {
        db.run(`INSERT INTO patients (id, name, email, phone, address, date_of_birth, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [nanoid(), patient.name, patient.email, patient.phone, patient.address, patient.dateOfBirth, 'active']);
      });

      // Create sample services
      const services = [
        { name: 'General Consultation', description: 'Standard medical consultation with primary care physician', category: 'consultation', price: '150.00' },
        { name: 'Blood Test', description: 'Complete blood count and basic metabolic panel', category: 'diagnostic', price: '85.00' },
        { name: 'X-Ray Chest', description: 'Chest X-ray imaging', category: 'diagnostic', price: '120.00' },
        { name: 'Physical Therapy Session', description: 'One hour physical therapy session', category: 'treatment', price: '95.00' }
      ];

      services.forEach(service => {
        db.run(`INSERT INTO services (id, name, description, category, price, is_active) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [nanoid(), service.name, service.description, service.category, service.price, 1]);
      });

      // Create hospital settings
      db.run(`INSERT INTO hospital_settings (id, name, address, phone, email, currency, tax_rate) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [nanoid(), 'City General Hospital', '123 Healthcare Ave, Medical City, MC 12345', '+1-555-0199', 'admin@cityhospital.com', 'USD', '8.5']);
    }
  });
}

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};
  
  db.get("SELECT COUNT(*) as count FROM patients", (err, result) => {
    stats.totalPatients = result.count;
    
    db.get("SELECT COUNT(*) as count FROM invoices", (err, result) => {
      stats.totalInvoices = result.count;
      
      db.get("SELECT SUM(CAST(total AS REAL)) as revenue FROM invoices WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')", (err, result) => {
        stats.monthlyRevenue = result.revenue || 0;
        
        db.get("SELECT COUNT(*) as count FROM invoices WHERE status = 'pending'", (err, result) => {
          stats.pendingBills = result.count;
          res.json(stats);
        });
      });
    });
  });
});

// Patients
app.get('/api/patients', (req, res) => {
  db.all("SELECT * FROM patients ORDER BY created_at DESC", (err, patients) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(patients);
  });
});

app.post('/api/patients', (req, res) => {
  const { name, email, phone, address, dateOfBirth } = req.body;
  const id = nanoid();
  
  db.run(`INSERT INTO patients (id, name, email, phone, address, date_of_birth, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [id, name, email, phone, address, dateOfBirth, 'active'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.get("SELECT * FROM patients WHERE id = ?", [id], (err, patient) => {
      res.json(patient);
    });
  });
});

app.put('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, dateOfBirth, status } = req.body;
  
  db.run(`UPDATE patients SET name = ?, email = ?, phone = ?, address = ?, date_of_birth = ?, status = ? 
          WHERE id = ?`,
          [name, email, phone, address, dateOfBirth, status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.get("SELECT * FROM patients WHERE id = ?", [id], (err, patient) => {
      res.json(patient);
    });
  });
});

app.delete('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM patients WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Services
app.get('/api/services', (req, res) => {
  db.all("SELECT * FROM services ORDER BY created_at DESC", (err, services) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(services);
  });
});

app.post('/api/services', (req, res) => {
  const { name, description, category, price } = req.body;
  const id = nanoid();
  
  db.run(`INSERT INTO services (id, name, description, category, price, is_active) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [id, name, description, category, price, 1], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.get("SELECT * FROM services WHERE id = ?", [id], (err, service) => {
      res.json(service);
    });
  });
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, isActive } = req.body;
  
  db.run(`UPDATE services SET name = ?, description = ?, category = ?, price = ?, is_active = ? 
          WHERE id = ?`,
          [name, description, category, price, isActive ? 1 : 0, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.get("SELECT * FROM services WHERE id = ?", [id], (err, service) => {
      res.json(service);
    });
  });
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  
  db.run("DELETE FROM services WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Invoices
app.get('/api/invoices', (req, res) => {
  db.all(`SELECT i.*, p.name as patient_name, p.email as patient_email 
          FROM invoices i 
          LEFT JOIN patients p ON i.patient_id = p.id 
          ORDER BY i.created_at DESC`, (err, invoices) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get invoice items for each invoice
    let completed = 0;
    const invoicesWithItems = invoices.map(invoice => ({ ...invoice, items: [] }));
    
    if (invoices.length === 0) {
      return res.json([]);
    }
    
    invoices.forEach((invoice, index) => {
      db.all("SELECT * FROM invoice_items WHERE invoice_id = ?", [invoice.id], (err, items) => {
        invoicesWithItems[index].items = items || [];
        completed++;
        
        if (completed === invoices.length) {
          res.json(invoicesWithItems);
        }
      });
    });
  });
});

app.post('/api/invoices', (req, res) => {
  const { patientId, invoiceDate, dueDate, items, subtotal, taxRate, taxAmount, total } = req.body;
  const invoiceId = nanoid();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  
  db.run(`INSERT INTO invoices (id, invoice_number, patient_id, invoice_date, due_date, subtotal, tax_rate, tax_amount, total, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [invoiceId, invoiceNumber, patientId, invoiceDate, dueDate, subtotal, taxRate, taxAmount, total, 'pending'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Insert invoice items
    let itemsInserted = 0;
    items.forEach(item => {
      db.run(`INSERT INTO invoice_items (id, invoice_id, service_id, service_name, quantity, unit_price, total) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [nanoid(), invoiceId, item.serviceId, item.serviceName, item.quantity, item.unitPrice, item.total], function(err) {
        itemsInserted++;
        
        if (itemsInserted === items.length) {
          // Return the created invoice with patient and items
          db.get(`SELECT i.*, p.name as patient_name, p.email as patient_email 
                  FROM invoices i 
                  LEFT JOIN patients p ON i.patient_id = p.id 
                  WHERE i.id = ?`, [invoiceId], (err, invoice) => {
            db.all("SELECT * FROM invoice_items WHERE invoice_id = ?", [invoiceId], (err, invoiceItems) => {
              res.json({ ...invoice, items: invoiceItems });
            });
          });
        }
      });
    });
  });
});

app.put('/api/invoices/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run("UPDATE invoices SET status = ? WHERE id = ?", [status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Hospital Settings
app.get('/api/settings', (req, res) => {
  db.get("SELECT * FROM hospital_settings LIMIT 1", (err, settings) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(settings || {});
  });
});

app.put('/api/settings', (req, res) => {
  const { name, address, phone, email, currency, taxRate } = req.body;
  
  db.get("SELECT id FROM hospital_settings LIMIT 1", (err, existing) => {
    if (existing) {
      db.run(`UPDATE hospital_settings SET name = ?, address = ?, phone = ?, email = ?, currency = ?, tax_rate = ?, updated_at = CURRENT_TIMESTAMP 
              WHERE id = ?`,
              [name, address, phone, email, currency, taxRate, existing.id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.get("SELECT * FROM hospital_settings WHERE id = ?", [existing.id], (err, settings) => {
          res.json(settings);
        });
      });
    } else {
      const id = nanoid();
      db.run(`INSERT INTO hospital_settings (id, name, address, phone, email, currency, tax_rate) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [id, name, address, phone, email, currency, taxRate], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        db.get("SELECT * FROM hospital_settings WHERE id = ?", [id], (err, settings) => {
          res.json(settings);
        });
      });
    }
  });
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
  console.log(`Hospital Billing Backend running on port ${PORT}`);
});

export default app;