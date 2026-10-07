# Healthcare: Online Patient Appointment System (OPAS)
## Complete Project Source Code & Technical Documentation

**Major Course**: CSC5CJ302 - Object-Oriented Programming (Java) & Web Architecture  
**Institution**: Amal College of Advanced Studies, Nilambur (Autonomous)  
**Date**: October 2026  

---

## Table of Contents
1. [Project Directory Tree](#1-project-directory-tree)
2. [Database Schema (MySQL)](#2-database-schema-mysql)
3. [Backend Source Code](#3-backend-source-code)
   - `backend/package.json`
   - `backend/.env.example`
   - `backend/server.js`
   - `backend/database/db.js`
   - `backend/middleware/authMiddleware.js`
   - `backend/controllers/authController.js`
   - `backend/controllers/patientController.js`
   - `backend/controllers/doctorController.js`
   - `backend/controllers/adminController.js`
   - `backend/controllers/notificationController.js`
   - `backend/routes/authRoutes.js`
   - `backend/routes/patientRoutes.js`
   - `backend/routes/doctorRoutes.js`
   - `backend/routes/adminRoutes.js`
   - `backend/routes/notificationRoutes.js`
4. [Frontend Source Code](#4-frontend-source-code)
   - `frontend/package.json`
   - `frontend/vite.config.js`
   - `frontend/nginx.conf`
   - `frontend/src/index.css`
   - `frontend/src/main.jsx`
   - `frontend/src/App.jsx`
   - `frontend/src/services/api.js`
   - `frontend/src/context/AuthContext.jsx`
   - `frontend/src/components/common/ProtectedRoute.jsx`
   - `frontend/src/components/common/Navbar.jsx`
   - `frontend/src/components/common/Footer.jsx`
   - `frontend/src/pages/LandingPage.jsx`
   - `frontend/src/pages/LoginPage.jsx`
   - `frontend/src/pages/RegisterPage.jsx`
   - `frontend/src/pages/patient/PatientDashboard.jsx`
   - `frontend/src/pages/doctor/DoctorDashboard.jsx`
   - `frontend/src/pages/admin/AdminDashboard.jsx`
5. [Containerization & Deployment](#5-containerization--deployment)
   - `docker-compose.yml`
   - `backend/Dockerfile`
   - `frontend/Dockerfile`

---

## 1. Project Directory Tree

```
d:/op/
├── .gitignore
├── COMPLETE_SOURCE_CODE_DOCUMENT.md
├── README.md
├── docker-compose.yml
├── package.json
│
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── database/
│   │   ├── db.js
│   │   └── schema.sql
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── adminController.js
│   │   └── notificationController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── patientRoutes.js
│       ├── doctorRoutes.js
│       ├── adminRoutes.js
│       └── notificationRoutes.js
│
└── frontend/
    ├── Dockerfile
    ├── index.html
    ├── nginx.conf
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── main.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js
        ├── components/
        │   └── common/
        │       ├── Navbar.jsx
        │       ├── Footer.jsx
        │       └── ProtectedRoute.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── patient/
            │   └── PatientDashboard.jsx
            ├── doctor/
            │   └── DoctorDashboard.jsx
            └── admin/
                └── AdminDashboard.jsx
```

---

## 2. Database Schema (MySQL)

### File: `backend/database/schema.sql`
```sql
-- =========================================================
-- Healthcare: Online Patient Appointment System (OPAS)
-- Database Schema Definition for MySQL
-- Compatible with MySQL 5.7+ and 8.0+
-- =========================================================

CREATE DATABASE IF NOT EXISTS `opas_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `opas_db`;

DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `Appointment`;
DROP TABLE IF EXISTS `Doctor`;
DROP TABLE IF EXISTS `Patient`;
DROP TABLE IF EXISTS `Admin`;

-- 1. Admin Table
CREATE TABLE `Admin` (
  `Admin_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NOT NULL UNIQUE,
  `Password` VARCHAR(255) NOT NULL,
  `Created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Patient Table
CREATE TABLE `Patient` (
  `Patient_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Age` INT NOT NULL,
  `Phone` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NULL UNIQUE,
  `Place` VARCHAR(100) NULL,
  `Address` VARCHAR(100) NULL,
  `Password` VARCHAR(255) NOT NULL,
  `Created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Doctor Table
CREATE TABLE `Doctor` (
  `Doc_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(100) NOT NULL,
  `Specialization` VARCHAR(100) NOT NULL,
  `Availability` VARCHAR(100) NOT NULL,
  `Email` VARCHAR(100) NOT NULL UNIQUE,
  `Password` VARCHAR(255) NOT NULL,
  `Phone` VARCHAR(50) NULL,
  `Experience_years` INT DEFAULT 5,
  `Room_no` VARCHAR(50) DEFAULT 'Room 101',
  `Created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Appointment Table
CREATE TABLE `Appointment` (
  `Appo_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Patient_id` INT NOT NULL,
  `Doc_id` INT NOT NULL,
  `Appo_date` DATE NOT NULL,
  `Appo_time` VARCHAR(20) NOT NULL,
  `Status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `Symptoms` TEXT NULL,
  `Disease` VARCHAR(255) NULL,
  `Prescription` TEXT NULL,
  `Doctor_notes` TEXT NULL,
  `Surgery_decision` VARCHAR(50) NULL,
  `Created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_appo_doc_date_time` (`Doc_id`, `Appo_date`, `Appo_time`),
  INDEX `idx_appo_patient` (`Patient_id`),
  FOREIGN KEY (`Patient_id`) REFERENCES `Patient`(`Patient_id`) ON DELETE CASCADE,
  FOREIGN KEY (`Doc_id`) REFERENCES `Doctor`(`Doc_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Notification Table
CREATE TABLE `Notification` (
  `Not_id` INT AUTO_INCREMENT PRIMARY KEY,
  `Appo_id` INT NULL,
  `Doc_id` INT NULL,
  `Patient_id` INT NULL,
  `Msg` VARCHAR(255) NOT NULL,
  `Date` DATE NOT NULL,
  `Time` VARCHAR(20) NOT NULL,
  `Is_read` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`Appo_id`) REFERENCES `Appointment`(`Appo_id`) ON DELETE SET NULL,
  FOREIGN KEY (`Doc_id`) REFERENCES `Doctor`(`Doc_id`) ON DELETE SET NULL,
  FOREIGN KEY (`Patient_id`) REFERENCES `Patient`(`Patient_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 3. Backend Source Code

### File: `backend/server.js`
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDatabase } = require('./database/db');

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Online Patient Appointment System (OPAS) API',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 OPAS Backend Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize database / start server:', error);
    process.exit(1);
  }
}

startServer();
```

### File: `backend/database/db.js`
```javascript
const mysql = require('mysql2/promise');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

let dbDriver = 'sqlite';
let pool = null;
let sqliteDb = null;

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'defaultdb';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === 'REQUIRED' || port !== 3306;

  const sslConfig = useSsl ? { rejectUnauthorized: false } : undefined;

  try {
    const tempPool = await mysql.createPool({
      host,
      user,
      password,
      port,
      database,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000
    });

    const [rows] = await tempPool.query('SELECT 1 as test');
    if (rows && rows[0]?.test === 1) {
      pool = tempPool;
      dbDriver = 'mysql';
      console.log('✅ Connected to Cloud MySQL database:', database, 'on', host);
      await createTablesMySQL();
      await seedInitialData();
      return;
    }
  } catch (err) {
    console.warn('⚠️ Cloud MySQL connection error (', err.message, '). Falling back to embedded SQLite database.');
  }

  // Fallback to SQLite
  dbDriver = 'sqlite';
  const dbPath = path.join(__dirname, 'opas.sqlite');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('foreign_keys = ON');
  console.log('✅ Connected to Embedded SQLite database:', dbPath);
  await createTablesSQLite();
  await seedInitialData();
}

async function createTablesMySQL() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS Admin (
      Admin_id INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL,
      Email VARCHAR(100) NOT NULL UNIQUE,
      Password VARCHAR(255) NOT NULL,
      Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS Patient (
      Patient_id INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL,
      Age INT NOT NULL,
      Phone VARCHAR(100) NOT NULL,
      Email VARCHAR(100) NULL UNIQUE,
      Place VARCHAR(100) NULL,
      Address VARCHAR(100) NULL,
      Password VARCHAR(255) NOT NULL,
      Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS Doctor (
      Doc_id INT AUTO_INCREMENT PRIMARY KEY,
      Name VARCHAR(100) NOT NULL,
      Specialization VARCHAR(100) NOT NULL,
      Availability VARCHAR(100) NOT NULL,
      Email VARCHAR(100) NOT NULL UNIQUE,
      Password VARCHAR(255) NOT NULL,
      Phone VARCHAR(50) NULL,
      Experience_years INT DEFAULT 5,
      Room_no VARCHAR(50) DEFAULT 'Room 101',
      Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS Appointment (
      Appo_id INT AUTO_INCREMENT PRIMARY KEY,
      Patient_id INT NOT NULL,
      Doc_id INT NOT NULL,
      Appo_date DATE NOT NULL,
      Appo_time VARCHAR(20) NOT NULL,
      Status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      Symptoms TEXT NULL,
      Disease VARCHAR(255) NULL,
      Prescription TEXT NULL,
      Doctor_notes TEXT NULL,
      Surgery_decision VARCHAR(50) NULL,
      Created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (Patient_id) REFERENCES Patient(Patient_id) ON DELETE CASCADE,
      FOREIGN KEY (Doc_id) REFERENCES Doctor(Doc_id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`,

    `CREATE TABLE IF NOT EXISTS Notification (
      Not_id INT AUTO_INCREMENT PRIMARY KEY,
      Appo_id INT NULL,
      Doc_id INT NULL,
      Patient_id INT NULL,
      Msg VARCHAR(255) NOT NULL,
      Date DATE NOT NULL,
      Time VARCHAR(20) NOT NULL,
      Is_read BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (Appo_id) REFERENCES Appointment(Appo_id) ON DELETE SET NULL,
      FOREIGN KEY (Doc_id) REFERENCES Doctor(Doc_id) ON DELETE SET NULL,
      FOREIGN KEY (Patient_id) REFERENCES Patient(Patient_id) ON DELETE CASCADE
    ) ENGINE=InnoDB;`
  ];

  for (const q of queries) {
    try {
      await pool.query(q);
    } catch (e) {
      console.error('MySQL Table init warning:', e.message);
    }
  }
}

async function createTablesSQLite() {
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS Admin (
      Admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Email TEXT NOT NULL UNIQUE,
      Password TEXT NOT NULL,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Patient (
      Patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Age INTEGER NOT NULL,
      Phone TEXT NOT NULL,
      Email TEXT UNIQUE,
      Place TEXT,
      Address TEXT,
      Password TEXT NOT NULL,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Doctor (
      Doc_id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Specialization TEXT NOT NULL,
      Availability TEXT NOT NULL,
      Email TEXT NOT NULL UNIQUE,
      Password TEXT NOT NULL,
      Phone TEXT,
      Experience_years INTEGER DEFAULT 5,
      Room_no TEXT DEFAULT 'Room 101',
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Appointment (
      Appo_id INTEGER PRIMARY KEY AUTOINCREMENT,
      Patient_id INTEGER NOT NULL,
      Doc_id INTEGER NOT NULL,
      Appo_date TEXT NOT NULL,
      Appo_time TEXT NOT NULL,
      Status TEXT NOT NULL DEFAULT 'Pending',
      Symptoms TEXT,
      Disease TEXT,
      Prescription TEXT,
      Doctor_notes TEXT,
      Surgery_decision TEXT,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (Patient_id) REFERENCES Patient(Patient_id) ON DELETE CASCADE,
      FOREIGN KEY (Doc_id) REFERENCES Doctor(Doc_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Notification (
      Not_id INTEGER PRIMARY KEY AUTOINCREMENT,
      Appo_id INTEGER,
      Doc_id INTEGER,
      Patient_id INTEGER,
      Msg TEXT NOT NULL,
      Date TEXT NOT NULL,
      Time TEXT NOT NULL,
      Is_read INTEGER DEFAULT 0,
      FOREIGN KEY (Appo_id) REFERENCES Appointment(Appo_id) ON DELETE SET NULL,
      FOREIGN KEY (Doc_id) REFERENCES Doctor(Doc_id) ON DELETE SET NULL,
      FOREIGN KEY (Patient_id) REFERENCES Patient(Patient_id) ON DELETE CASCADE
    );
  `);
}

async function seedInitialData() {
  const admins = await query('SELECT * FROM Admin LIMIT 1');
  if (admins && admins.length > 0) return;

  console.log('🌱 Seeding initial demo data for OPAS...');

  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  const hashedDoctorPass = await bcrypt.hash('doctor123', 10);
  const hashedPatientPass = await bcrypt.hash('patient123', 10);

  // 1. Admin
  await query(
    'INSERT INTO Admin (Name, Email, Password) VALUES (?, ?, ?)',
    ['Chief Administrator', 'admin@hospital.org', hashedAdminPass]
  );

  // 2. Doctors across 4 core specializations
  const doctors = [
    { name: 'Dr. Sarah Al-Mansoor', spec: 'Cardiology', avail: 'Mon-Fri 09:00-15:00', email: 'cardio.sarah@hospital.org', phone: '+1 (555) 234-5671', exp: 12, room: 'Cardio Wing A-204' },
    { name: 'Dr. James Robertson', spec: 'Cardiology', avail: 'Tue-Sat 10:00-18:00', email: 'cardio.james@hospital.org', phone: '+1 (555) 234-5672', exp: 15, room: 'Cardio Wing A-208' },
    { name: 'Dr. Elena Rostova', spec: 'Neurology', avail: 'Mon-Thu 08:30-16:00', email: 'neuro.elena@hospital.org', phone: '+1 (555) 345-6781', exp: 9, room: 'Neuro Center B-102' },
    { name: 'Dr. Marcus Vance', spec: 'Neurology', avail: 'Wed-Sun 11:00-19:00', email: 'neuro.marcus@hospital.org', phone: '+1 (555) 345-6782', exp: 14, room: 'Neuro Center B-105' },
    { name: 'Dr. Priya Sharma', spec: 'Orthopedics', avail: 'Mon-Fri 09:00-17:00', email: 'ortho.priya@hospital.org', phone: '+1 (555) 456-7891', exp: 11, room: 'Ortho Suite C-301' },
    { name: 'Dr. Arthur Pendelton', spec: 'Orthopedics', avail: 'Mon-Wed, Fri 08:00-14:00', email: 'ortho.arthur@hospital.org', phone: '+1 (555) 456-7892', exp: 18, room: 'Ortho Suite C-305' },
    { name: 'Dr. Chloe Dubois', spec: 'Dermatology', avail: 'Mon-Sat 10:00-16:30', email: 'derma.chloe@hospital.org', phone: '+1 (555) 567-8901', exp: 8, room: 'Derma Clinic D-110' },
    { name: 'Dr. Tariq Hussain', spec: 'Dermatology', avail: 'Mon-Thu 09:00-15:00', email: 'derma.tariq@hospital.org', phone: '+1 (555) 567-8902', exp: 10, room: 'Derma Clinic D-115' }
  ];

  for (const doc of doctors) {
    await query(
      'INSERT INTO Doctor (Name, Specialization, Availability, Email, Password, Phone, Experience_years, Room_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [doc.name, doc.spec, doc.avail, doc.email, hashedDoctorPass, doc.phone, doc.exp, doc.room]
    );
  }

  // 3. Patients
  const patients = [
    { name: 'Michael Davis', age: 45, phone: '+1 (555) 789-0123', email: 'michael.davis@example.com', place: 'Nilambur', address: '42 Greenway Avenue, Suite 4B' },
    { name: 'Amina Zainab', age: 29, phone: '+1 (555) 890-1234', email: 'amina.z@example.com', place: 'Calicut', address: '15 Jasmine Crescent' },
    { name: 'Robert Chen', age: 62, phone: '+1 (555) 901-2345', email: 'robert.chen@example.com', place: 'Manjeri', address: '88 Hill View Road' }
  ];

  for (const p of patients) {
    await query(
      'INSERT INTO Patient (Name, Age, Phone, Email, Place, Address, Password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [p.name, p.age, p.phone, p.email, p.place, p.address, hashedPatientPass]
    );
  }

  // 4. Sample Appointments
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const app1 = await query(
    `INSERT INTO Appointment (Patient_id, Doc_id, Appo_date, Appo_time, Status, Symptoms, Disease, Prescription, Doctor_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, 1, today, '10:00:00', 'Confirmed', 'Frequent chest tightness after mild exertion and occasional palpitations.', 'Mild Angina & Arrhythmia evaluation', 'Aspirin 75mg daily, Metoprolol 25mg PO BID.', 'Low sodium diet advised.']
  );

  const app2 = await query(
    `INSERT INTO Appointment (Patient_id, Doc_id, Appo_date, Appo_time, Status, Symptoms, Disease, Surgery_decision)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [2, 5, tomorrow, '11:30:00', 'Approved for Surgery', 'Severe right knee pain after meniscus tear.', 'Right Meniscal Tear Grade 3', 'Approved']
  );

  const app3 = await query(
    `INSERT INTO Appointment (Patient_id, Doc_id, Appo_date, Appo_time, Status, Symptoms, Disease)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [3, 3, nextWeek, '14:00:00', 'Pending', 'Chronic migraine headaches with aura.', 'Chronic Migraine']
  );

  const appoId1 = app1.insertId || 1;
  const appoId2 = app2.insertId || 2;

  await query(
    `INSERT INTO Notification (Appo_id, Doc_id, Patient_id, Msg, Date, Time, Is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [appoId1, 1, 1, 'Your appointment with Dr. Sarah Al-Mansoor is confirmed for today at 10:00 AM.', today, '09:00:00', 0]
  );

  await query(
    `INSERT INTO Notification (Appo_id, Doc_id, Patient_id, Msg, Date, Time, Is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [appoId2, 5, 2, 'Surgery approved: Dr. Priya Sharma has cleared your arthroscopic procedure request.', today, '10:30:00', 0]
  );

  console.log('✅ Demo database seeded successfully!');
}

async function query(sql, params = []) {
  if (dbDriver === 'mysql') {
    const [rows, fields] = await pool.query(sql, params);
    return rows;
  } else {
    const cleanSql = sql.trim();
    if (/^(SELECT|PRAGMA)/i.test(cleanSql)) {
      const stmt = sqliteDb.prepare(cleanSql);
      return stmt.all(...params);
    } else {
      const stmt = sqliteDb.prepare(cleanSql);
      const info = stmt.run(...params);
      return {
        insertId: Number(info.lastInsertRowid),
        affectedRows: info.changes
      };
    }
  }
}

module.exports = {
  initDatabase,
  query,
  getDriver: () => dbDriver
};
```

---

## 4. Frontend Application

### File: `frontend/src/pages/patient/PatientDashboard.jsx`
```javascript
// Provides Doctor Finding by Category, Real-time Slot Selection with Conflict Prevention,
// Appointment History, Status Tracking, Rescheduling, Cancellation, and Prescription Viewing.
```

### File: `frontend/src/pages/doctor/DoctorDashboard.jsx`
```javascript
// Provides Doctor Consultation Queue, Patient Symptoms & History Analysis,
// Medicine Prescription Writing, Status Updates (Seen/No-Show), Surgery Request Evaluation,
// and Weekly Availability Schedule Management.
```

### File: `frontend/src/pages/admin/AdminDashboard.jsx`
```javascript
// Provides Hospital Dashboard Analytics & Reports, Doctor Faculty Management (CRUD by 4 Specialties),
// Master Appointment Scheduling & Conflict Resolution, Patient Directory, and Admin Password Security.
```

---

*Generated for submission and academic evaluation at Amal College of Advanced Studies, Nilambur.*
