const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ShadingType } = require('docx');

const filesData = [
  // 1. Database
  {
    category: '1. DATABASE SCHEMA & SCRIPTS',
    filePath: 'backend/database/schema.sql',
    name: 'MySQL Database Schema Script',
    description: 'This file contains the complete SQL DDL statements to create all 5 required database tables (`Admin`, `Patient`, `Doctor`, `Appointment`, `Notification`) along with primary keys, foreign key constraints, indexes, and character sets. Used by database administrators or automatic migration engines to initialize the MySQL database.'
  },
  {
    category: '2. BACKEND CONFIGURATION & ENTRY',
    filePath: 'backend/package.json',
    name: 'Backend Dependencies and Scripts',
    description: 'Manifest file declaring all Node.js backend dependencies including Express, MySQL2, Better-SQLite3, BCryptJS, JSONWebToken, CORS, and Morgan, along with startup npm scripts.'
  },
  {
    category: '2. BACKEND CONFIGURATION & ENTRY',
    filePath: 'backend/.env.example',
    name: 'Backend Environment Variables Template',
    description: 'Configuration file template providing key parameters: Server PORT, JWT secret key, and database connection credentials (Host, Port, User, Password, DB Name, and SSL).'
  },
  {
    category: '2. BACKEND CONFIGURATION & ENTRY',
    filePath: 'backend/server.js',
    name: 'Main Express Server Entrypoint',
    description: 'The root application file that bootstraps the Express server, applies security and CORS middleware, registers all RESTful route groups (/api/auth, /api/patient, /api/doctor, /api/admin, /api/notifications), provides a health check route, and initializes database connection pools.'
  },
  {
    category: '3. BACKEND DATABASE & MIDDLEWARE',
    filePath: 'backend/database/db.js',
    name: 'Unified Database Driver Layer & Auto-Seeder',
    description: 'Database connection abstraction supporting Cloud MySQL (with SSL encryption for platforms like Aiven) and fallback SQLite. Automatically verifies tables, runs migrations, and pre-populates sample doctors (Cardiology, Neurology, Orthopedics, Dermatology), patients, and admin accounts on initial launch.'
  },
  {
    category: '3. BACKEND DATABASE & MIDDLEWARE',
    filePath: 'backend/middleware/authMiddleware.js',
    name: 'JWT Authentication & Role-Based Access Control (RBAC)',
    description: 'Security middleware that validates Bearer JWT tokens in incoming request headers and restricts access based on user role (`isPatient`, `isDoctor`, `isAdmin`). Ensures endpoints cannot be accessed without proper authorization.'
  },
  {
    category: '4. BACKEND CONTROLLERS (BUSINESS LOGIC)',
    filePath: 'backend/controllers/authController.js',
    name: 'Authentication & Profile Controller',
    description: 'Handles Patient registration, multi-role universal login with bcrypt password comparison, JWT token generation, admin password management (DFD Level 2.1.3), and user profile fetching.'
  },
  {
    category: '4. BACKEND CONTROLLERS (BUSINESS LOGIC)',
    filePath: 'backend/controllers/patientController.js',
    name: 'Patient Services & Appointment Booking Controller',
    description: 'Powers patient-facing functionality: doctor directory searching/filtering by specialty, real-time available time slot calculation, double-booking conflict prevention, appointment creation, rescheduling, cancellation, and notification retrieval.'
  },
  {
    category: '4. BACKEND CONTROLLERS (BUSINESS LOGIC)',
    filePath: 'backend/controllers/doctorController.js',
    name: 'Doctor Console & Clinical Actions Controller',
    description: 'Manages doctor queues and patient consultations: disease verification, prescription generation, doctor notes, consultation outcome statuses (Seen, No-Show, Completed), surgery request decisions (Approve/Reject - DFD Level 2.2.1), and weekly working hours updates.'
  },
  {
    category: '4. BACKEND CONTROLLERS (BUSINESS LOGIC)',
    filePath: 'backend/controllers/adminController.js',
    name: 'Admin Management & Master Scheduler Controller',
    description: 'Handles hospital administration: system KPIs and analytics breakdown, Doctor CRUD operations organized by the 4 specialties (Cardiology, Neurology, Orthopedics, Dermatology - DFD Level 2.1.1, 2.1.2), master appointment scheduler with conflict resolution, and patient directory management.'
  },
  {
    category: '4. BACKEND CONTROLLERS (BUSINESS LOGIC)',
    filePath: 'backend/controllers/notificationController.js',
    name: 'Notification State Controller',
    description: 'Provides methods to mark single or all clinical alerts/notifications as read for patients.'
  },
  {
    category: '5. BACKEND API ROUTES',
    filePath: 'backend/routes/authRoutes.js',
    name: 'Auth Route Declarations',
    description: 'Maps authentication HTTP endpoints (/register, /login, /profile, /change-admin-password) to authController methods with role verification.'
  },
  {
    category: '5. BACKEND API ROUTES',
    filePath: 'backend/routes/patientRoutes.js',
    name: 'Patient Route Declarations',
    description: 'Defines endpoints for doctor search, slot checking, booking, patient appointment list, reschedule, and cancellation.'
  },
  {
    category: '5. BACKEND API ROUTES',
    filePath: 'backend/routes/doctorRoutes.js',
    name: 'Doctor Route Declarations',
    description: 'Defines doctor endpoints for appointment list, clinical update, surgery decision, availability hours, and stats.'
  },
  {
    category: '5. BACKEND API ROUTES',
    filePath: 'backend/routes/adminRoutes.js',
    name: 'Admin Route Declarations',
    description: 'Defines administrator endpoints for dashboard stats, doctor CRUD, master appointment reassignments, and patient records.'
  },
  {
    category: '5. BACKEND API ROUTES',
    filePath: 'backend/routes/notificationRoutes.js',
    name: 'Notification Route Declarations',
    description: 'Defines endpoints for updating notification read states.'
  },
  {
    category: '6. FRONTEND CONFIGURATION & CLIENT STATE',
    filePath: 'frontend/package.json',
    name: 'Frontend Manifest & Dependencies',
    description: 'Contains frontend dependencies: React 19, Vite, Tailwind CSS v4, Lucide React icons, React Router DOM, and Axios.'
  },
  {
    category: '6. FRONTEND CONFIGURATION & CLIENT STATE',
    filePath: 'frontend/vite.config.js',
    name: 'Vite Build & Proxy Configuration',
    description: 'Build tool configuration that integrates React and Tailwind CSS plugins and proxies /api requests to the backend on port 5000.'
  },
  {
    category: '6. FRONTEND CONFIGURATION & CLIENT STATE',
    filePath: 'frontend/src/index.css',
    name: 'Global Stylesheet & Medical UI Theme',
    description: 'Sets up Tailwind CSS imports, custom healthcare typography, glass panels, color gradients, and custom scrollbars.'
  },
  {
    category: '6. FRONTEND CONFIGURATION & CLIENT STATE',
    filePath: 'frontend/src/services/api.js',
    name: 'Axios API Client with JWT Interceptors',
    description: 'Central HTTP client that automatically attaches the JWT Bearer authorization header to requests and handles 401 token expiry.'
  },
  {
    category: '6. FRONTEND CONFIGURATION & CLIENT STATE',
    filePath: 'frontend/src/context/AuthContext.jsx',
    name: 'Global Authentication Context & State',
    description: 'React Context provider managing user sessions, roles (patient, doctor, admin), tokens, login, logout, registration, and 1-click demo logins.'
  },
  {
    category: '6. FRONTEND CONFIGURATION & CLIENT STATE',
    filePath: 'frontend/src/App.jsx',
    name: 'Root Application & Routing Table',
    description: 'Defines client-side routes (/login, /register, /patient/dashboard, /doctor/dashboard, /admin/dashboard) wrapped with Role-Based Route Guards.'
  },
  {
    category: '7. FRONTEND COMMON COMPONENTS',
    filePath: 'frontend/src/components/common/Navbar.jsx',
    name: 'Navigation Bar with Role Badges & Notification Center',
    description: 'Responsive top navigation showing hospital branding, active role badge, real-time unread notifications bell with dropdown, and user logout.'
  },
  {
    category: '7. FRONTEND COMMON COMPONENTS',
    filePath: 'frontend/src/components/common/Footer.jsx',
    name: 'Healthcare Footer & Institution Credits',
    description: 'Hospital footer displaying department links, 24/7 hotline info, and college course credits (Amal College of Advanced Studies, Nilambur).'
  },
  {
    category: '7. FRONTEND COMMON COMPONENTS',
    filePath: 'frontend/src/components/common/ProtectedRoute.jsx',
    name: 'Role-Based Protected Route Guard',
    description: 'Guards dashboard routes so only authenticated users with matching roles can access specific views, redirecting others automatically.'
  },
  {
    category: '8. FRONTEND DASHBOARDS & USER INTERFACES',
    filePath: 'frontend/src/pages/LandingPage.jsx',
    name: 'Public Healthcare Landing Page',
    description: 'Landing page featuring hero section, specialty browser (Cardiology, Neurology, Orthopedics, Dermatology), doctor cards, DFD workflow diagrams, and 1-click test credentials.'
  },
  {
    category: '8. FRONTEND DASHBOARDS & USER INTERFACES',
    filePath: 'frontend/src/pages/LoginPage.jsx',
    name: 'Multi-Role Unified Login Screen',
    description: 'Login page with role switcher tabs (Patient / Doctor / Admin), quick demo fill buttons, and form validations.'
  },
  {
    category: '8. FRONTEND DASHBOARDS & USER INTERFACES',
    filePath: 'frontend/src/pages/RegisterPage.jsx',
    name: 'Patient Registration Screen',
    description: 'User registration form capturing Name, Age, Phone, Email, Place, Address, and Password with instant account creation.'
  },
  {
    category: '8. FRONTEND DASHBOARDS & USER INTERFACES',
    filePath: 'frontend/src/pages/patient/PatientDashboard.jsx',
    name: 'Patient Portal Dashboard',
    description: 'Full patient portal: specialist browsing, dynamic calendar slot selector with conflict avoidance, appointment tracking, rescheduling, cancellation modal, and prescription/doctor notes viewer.'
  },
  {
    category: '8. FRONTEND DASHBOARDS & USER INTERFACES',
    filePath: 'frontend/src/pages/doctor/DoctorDashboard.jsx',
    name: 'Doctor Console Dashboard',
    description: 'Specialist console: daily patient queue, symptoms analysis modal, prescription writer, consultation status updater (Seen/No-Show), surgery approval/rejection modal, and availability settings.'
  },
  {
    category: '8. FRONTEND DASHBOARDS & USER INTERFACES',
    filePath: 'frontend/src/pages/admin/AdminDashboard.jsx',
    name: 'Administrator Master Dashboard',
    description: 'Admin command center: KPI analytics & reports, Doctor CRUD management organized by 4 specialties, centralized master appointment scheduler, patient directory, and admin password reset.'
  },
  {
    category: '9. CONTAINERIZATION & DEPLOYMENT',
    filePath: 'docker-compose.yml',
    name: 'Docker Compose Stack Configuration',
    description: 'Multi-container specification orchestrating MySQL 8.0, Node.js Backend API, and Nginx Frontend SPA in an isolated bridge network.'
  },
  {
    category: '9. CONTAINERIZATION & DEPLOYMENT',
    filePath: 'backend/Dockerfile',
    name: 'Backend Production Dockerfile',
    description: 'Container build definition for the Node.js Express REST API.'
  },
  {
    category: '9. CONTAINERIZATION & DEPLOYMENT',
    filePath: 'frontend/Dockerfile',
    name: 'Frontend Multi-Stage Dockerfile',
    description: 'Builds the Vite React static application and serves it via an Alpine Nginx web server container.'
  },
  {
    category: '9. CONTAINERIZATION & DEPLOYMENT',
    filePath: 'frontend/nginx.conf',
    name: 'Nginx Reverse Proxy & SPA Router Config',
    description: 'Nginx server configuration for Single Page Application routing and /api reverse proxying to the backend service.'
  }
];

async function generateDocx() {
  const rootDir = path.resolve(__dirname, '..');

  const children = [
    new Paragraph({
      text: "HEALTHCARE: ONLINE PATIENT APPOINTMENT SYSTEM (OPAS)",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Complete Source Code & Architecture Specification Document\n", bold: true, size: 24 }),
        new TextRun({ text: "Major Course: CSC5CJ302 Object-Oriented Programming & Web Systems\n", italics: true, size: 20 }),
        new TextRun({ text: "Amal College of Advanced Studies, Nilambur (Autonomous)\n", size: 20 }),
        new TextRun({ text: "Date: October 2026\n\n", size: 18 })
      ],
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: "EXECUTIVE SYSTEM OVERVIEW",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 100 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "This document compiles the complete source code, database architecture, backend REST APIs, frontend components, state management, and deployment files for the Online Patient Appointment System (OPAS). Each code listing is preceded by its exact file path, module classification, functional role, and description of what the code does.\n",
          size: 20
        })
      ],
      spacing: { after: 300 }
    })
  ];

  for (let i = 0; i < filesData.length; i++) {
    const item = filesData[i];
    const fullPath = path.join(rootDir, item.filePath);

    let fileContent = '// File not found';
    try {
      if (fs.existsSync(fullPath)) {
        fileContent = fs.readFileSync(fullPath, 'utf8');
      }
    } catch (e) {
      fileContent = `// Error reading file: ${e.message}`;
    }

    // Category / Section Header
    children.push(
      new Paragraph({
        text: `[${i + 1}] ${item.name}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 }
      })
    );

    // Meta details table
    const metaTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "File Path:", bold: true, size: 18 })] })]
            }),
            new TableCell({
              width: { size: 75, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: item.filePath, font: 'Courier New', size: 18 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Category:", bold: true, size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: item.category, size: 18 })] })]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'E2E8F0', type: ShadingType.CLEAR },
              children: [new Paragraph({ children: [new TextRun({ text: "Description & Purpose (Which code is which):", bold: true, size: 18 })] })]
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: item.description, size: 18 })] })]
            })
          ]
        })
      ]
    });

    children.push(metaTable);
    children.push(new Paragraph({ text: "", spacing: { after: 150 } }));

    // Code Content
    const codeLines = fileContent.split('\n');
    const codeRuns = codeLines.map((line, idx) => (
      new TextRun({
        text: (idx < codeLines.length - 1 ? line + '\n' : line),
        font: 'Consolas',
        size: 15
      })
    ));

    const codeTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' }
              },
              children: [
                new Paragraph({
                  children: codeRuns,
                  spacing: { before: 80, after: 80 }
                })
              ]
            })
          ]
        })
      ]
    });

    children.push(codeTable);
    children.push(new Paragraph({ text: "", spacing: { after: 300 } }));
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: children
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPathDocx = path.join(rootDir, 'OPAS_COMPLETE_SOURCE_CODE_DOCUMENT.docx');
  fs.writeFileSync(outPathDocx, buffer);
  console.log('✅ Generated Native Word Document (.docx):', outPathDocx);

  // Also create a rich styled Word-compatible .doc file for instant opening anywhere
  generateHtmlDoc(rootDir);
}

function generateHtmlDoc(rootDir) {
  let html = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>OPAS Complete Source Code Document</title>
<style>
  body { font-family: Calibri, 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.5; }
  h1 { color: #0f766e; text-align: center; font-size: 26pt; margin-bottom: 5px; }
  .subtitle { text-align: center; font-size: 13pt; color: #64748b; margin-bottom: 25px; }
  .section-card { border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 30px; page-break-inside: avoid; }
  .header-box { background-color: #0f766e; color: #ffffff; padding: 10px 15px; font-size: 14pt; font-weight: bold; }
  .meta-box { background-color: #f1f5f9; padding: 12px 15px; border-bottom: 1px solid #cbd5e1; font-size: 10pt; }
  .meta-box table { width: 100%; border-collapse: collapse; }
  .meta-box td { padding: 4px 8px; vertical-align: top; }
  .meta-label { font-weight: bold; width: 140px; color: #334155; }
  .code-box { background-color: #f8fafc; padding: 15px; font-family: Consolas, 'Courier New', monospace; font-size: 8.5pt; white-space: pre-wrap; word-break: break-all; color: #0f172a; border-top: 1px solid #e2e8f0; }
  .tag { display: inline-block; background-color: #ccfbf1; color: #0f766e; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 9pt; }
</style>
</head>
<body>
  <h1>Healthcare: Online Patient Appointment System (OPAS)</h1>
  <div class="subtitle">
    <strong>Complete Source Code & Architecture Specification Document</strong><br>
    Major Course: CSC5CJ302 Object-Oriented Programming (Java) & Web Systems<br>
    Amal College of Advanced Studies, Nilambur (Autonomous) &bull; October 2026
  </div>
  <hr style="border: 0; height: 1px; background: #cbd5e1; margin-bottom: 30px;">
`;

  for (let i = 0; i < filesData.length; i++) {
    const item = filesData[i];
    const fullPath = path.join(rootDir, item.filePath);
    let content = '';
    try {
      content = fs.readFileSync(fullPath, 'utf8')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } catch (e) {
      content = `// Error loading file: ${e.message}`;
    }

    html += `
  <div class="section-card">
    <div class="header-box">
      ${i + 1}. ${item.name}
    </div>
    <div class="meta-box">
      <table>
        <tr>
          <td class="meta-label">File Path:</td>
          <td><code>${item.filePath}</code></td>
        </tr>
        <tr>
          <td class="meta-label">Category:</td>
          <td><span class="tag">${item.category}</span></td>
        </tr>
        <tr>
          <td class="meta-label">Role & Purpose:</td>
          <td>${item.description}</td>
        </tr>
      </table>
    </div>
    <div class="code-box">${content}</div>
  </div>
`;
  }

  html += `</body></html>`;

  const outPathDoc = path.join(rootDir, 'OPAS_COMPLETE_SOURCE_CODE_DOCUMENT.doc');
  fs.writeFileSync(outPathDoc, html);
  console.log('✅ Generated Word (.doc) Document:', outPathDoc);
}

generateDocx().catch(err => {
  console.error('Generation Error:', err);
  process.exit(1);
});
