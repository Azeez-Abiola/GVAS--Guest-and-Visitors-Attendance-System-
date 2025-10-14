const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database setup
const dbPath = path.join(__dirname, 'guests.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Visitors table
  db.run(`CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    host TEXT NOT NULL,
    purpose TEXT,
    photo TEXT,
    signature TEXT,
    consent_given INTEGER DEFAULT 0,
    consent_timestamp TEXT,
    qr_code TEXT,
    status TEXT DEFAULT 'pending',
    check_in_time TEXT,
    check_out_time TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Hosts/Tenants table
  db.run(`CREATE TABLE IF NOT EXISTS hosts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    office_number TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample hosts
  const sampleHosts = [
    { id: uuidv4(), name: 'John Smith', email: 'john@techcorp.com', company: 'TechCorp Ltd', office_number: '15A' },
    { id: uuidv4(), name: 'Sarah Johnson', email: 'sarah@designstudio.com', company: 'Design Studio Inc', office_number: '22B' },
    { id: uuidv4(), name: 'Mike Wilson', email: 'mike@consulting.com', company: 'Wilson Consulting', office_number: '8C' }
  ];

  sampleHosts.forEach(host => {
    db.run(`INSERT OR IGNORE INTO hosts (id, name, email, company, office_number) VALUES (?, ?, ?, ?, ?)`,
      [host.id, host.name, host.email, host.company, host.office_number]);
  });
});

// Routes

// Get all hosts
app.get('/api/hosts', (req, res) => {
  db.all('SELECT * FROM hosts ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Pre-register visitor
app.post('/api/pre-register', async (req, res) => {
  try {
    const { name, email, phone, company, host, purpose } = req.body;
    const id = uuidv4();
    const qrData = JSON.stringify({ id, type: 'pre-registered' });
    const qrCode = await QRCode.toDataURL(qrData);

    db.run(`INSERT INTO visitors (id, name, email, phone, company, host, purpose, qr_code, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pre-registered')`,
      [id, name, email, phone, company, host, purpose, qrCode], function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          id, 
          qrCode,
          message: 'Visitor pre-registered successfully',
          guestCode: id.substring(0, 8).toUpperCase()
        });
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get visitor by ID (for QR scan or code lookup)
app.get('/api/visitor/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM visitors WHERE id = ? OR id LIKE ?', [id, `${id}%`], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Visitor not found' });
    }
    res.json(row);
  });
});

// Check-in visitor (walk-in or pre-registered)
app.post('/api/checkin', (req, res) => {
  const { 
    id, 
    name, 
    email, 
    phone, 
    company, 
    host, 
    purpose, 
    photo, 
    signature, 
    consentGiven,
    isPreRegistered = false 
  } = req.body;

  const visitorId = id || uuidv4();
  const checkInTime = new Date().toISOString();
  const consentTimestamp = consentGiven ? checkInTime : null;

  if (isPreRegistered) {
    // Update existing pre-registered visitor
    db.run(`UPDATE visitors SET 
            photo = ?, 
            signature = ?, 
            consent_given = ?, 
            consent_timestamp = ?,
            status = 'checked-in',
            check_in_time = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
      [photo, signature, consentGiven ? 1 : 0, consentTimestamp, checkInTime, visitorId], 
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Pre-registered visitor not found' });
        }
        res.json({ 
          id: visitorId, 
          status: 'checked-in',
          checkInTime,
          message: 'Pre-registered visitor checked in successfully' 
        });
      });
  } else {
    // Create new walk-in visitor
    db.run(`INSERT INTO visitors (
            id, name, email, phone, company, host, purpose, photo, signature, 
            consent_given, consent_timestamp, status, check_in_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'checked-in', ?)`,
      [visitorId, name, email, phone, company, host, purpose, photo, signature, 
       consentGiven ? 1 : 0, consentTimestamp, checkInTime], 
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          id: visitorId, 
          status: 'checked-in',
          checkInTime,
          message: 'Walk-in visitor checked in successfully' 
        });
      });
  }
});

// Get all visitors with filters
app.get('/api/visitors', (req, res) => {
  const { status, date, limit = 100 } = req.query;
  
  let query = 'SELECT * FROM visitors WHERE 1=1';
  const params = [];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (date) {
    query += ' AND DATE(created_at) = ?';
    params.push(date);
  } else {
    // Default to today
    query += ' AND DATE(created_at) = DATE("now")';
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  params.push(parseInt(limit));

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Notify host
app.post('/api/notify-host', (req, res) => {
  const { visitorId, message } = req.body;
  
  // In a real app, this would send email/SMS
  // For demo, we'll just log and return success
  console.log(`Host notification for visitor ${visitorId}: ${message}`);
  
  res.json({ 
    success: true, 
    message: 'Host notified successfully (demo mode)' 
  });
});

// Check-out visitor
app.post('/api/checkout/:id', (req, res) => {
  const { id } = req.params;
  const checkOutTime = new Date().toISOString();

  db.run(`UPDATE visitors SET 
          status = 'checked-out',
          check_out_time = ?,
          updated_at = CURRENT_TIMESTAMP
          WHERE id = ?`,
    [checkOutTime, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Visitor not found' });
      }
      res.json({ 
        id, 
        status: 'checked-out',
        checkOutTime,
        message: 'Visitor checked out successfully' 
      });
    });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Guest Experience API running on port ${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;