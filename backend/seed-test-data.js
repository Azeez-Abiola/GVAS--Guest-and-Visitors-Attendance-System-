const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, 'guests.db');
const db = new sqlite3.Database(dbPath);

// Test visitor data
const testVisitors = [
  {
    id: 'V1234',
    name: 'John Doe',
    email: 'john.doe@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Inc.',
    host: 'Sarah Johnson',
    purpose: 'Business Meeting',
    photo: '',
    signature: '',
    consent_given: 1,
    consent_timestamp: new Date().toISOString(),
    qr_code: '',
    status: 'checked-in',
    check_in_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    check_out_time: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'V1235',
    name: 'Jane Smith',
    email: 'jane.smith@designstudio.com',
    phone: '+1 (555) 987-6543',
    company: 'Design Studio',
    host: 'Mike Wilson',
    purpose: 'Client Consultation',
    photo: '',
    signature: '',
    consent_given: 1,
    consent_timestamp: new Date().toISOString(),
    qr_code: '',
    status: 'checked-in',
    check_in_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    check_out_time: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'V1236',
    name: 'Bob Johnson',
    email: 'bob.johnson@abccorp.com',
    phone: '+1 (555) 456-7890',
    company: 'ABC Corp',
    host: 'Lisa Brown',
    purpose: 'Project Review',
    photo: '',
    signature: '',
    consent_given: 1,
    consent_timestamp: new Date().toISOString(),
    qr_code: '',
    status: 'checked-out',
    check_in_time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    check_out_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Test hosts data
const testHosts = [
  {
    id: 'host-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    company: 'Sales Department',
    office_number: '15A'
  },
  {
    id: 'host-2',
    name: 'Mike Wilson',
    email: 'mike.wilson@company.com',
    company: 'Design Department',
    office_number: '22B'
  },
  {
    id: 'host-3',
    name: 'Lisa Brown',
    email: 'lisa.brown@company.com',
    company: 'Engineering Department',
    office_number: '31C'
  }
];

console.log('Adding test data to database...');

// Insert test hosts
db.serialize(() => {
  const hostStmt = db.prepare(`
    INSERT OR REPLACE INTO hosts (id, name, email, company, office_number, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  testHosts.forEach(host => {
    hostStmt.run(
      host.id,
      host.name,
      host.email,
      host.company,
      host.office_number,
      new Date().toISOString()
    );
  });

  hostStmt.finalize();

  // Insert test visitors
  const visitorStmt = db.prepare(`
    INSERT OR REPLACE INTO visitors (
      id, name, email, phone, company, host, purpose, photo, signature,
      consent_given, consent_timestamp, qr_code, status,
      check_in_time, check_out_time, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  testVisitors.forEach(visitor => {
    visitorStmt.run(
      visitor.id,
      visitor.name,
      visitor.email,
      visitor.phone,
      visitor.company,
      visitor.host,
      visitor.purpose,
      visitor.photo,
      visitor.signature,
      visitor.consent_given,
      visitor.consent_timestamp,
      visitor.qr_code,
      visitor.status,
      visitor.check_in_time,
      visitor.check_out_time,
      visitor.created_at,
      visitor.updated_at
    );
  });

  visitorStmt.finalize();

  console.log('Test data added successfully!');
  console.log('Available test visitor IDs:');
  console.log('- V1234 (John Doe - checked-in)');
  console.log('- V1235 (Jane Smith - checked-in)');
  console.log('- V1236 (Bob Johnson - checked-out)');
  
  db.close();
});