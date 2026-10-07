const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Generate JWT Helper
function generateToken(user, role) {
  const idField = role === 'admin' ? user.Admin_id : role === 'doctor' ? user.Doc_id : user.Patient_id;
  return jwt.sign(
    {
      id: idField,
      email: user.Email,
      name: user.Name,
      role: role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 1. Patient Registration
exports.registerPatient = async (req, res) => {
  try {
    const { name, age, phone, email, place, address, password } = req.body;

    if (!name || !age || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, age, phone, and password are required.' });
    }

    // Check if email already exists if provided
    if (email) {
      const existing = await db.query('SELECT * FROM Patient WHERE Email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'A patient with this email already exists.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO Patient (Name, Age, Phone, Email, Place, Address, Password)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, parseInt(age, 10), phone, email || null, place || null, address || null, hashedPassword]
    );

    const patientId = result.insertId;
    const newPatient = {
      Patient_id: patientId,
      Name: name,
      Age: age,
      Phone: phone,
      Email: email,
      Place: place,
      Address: address
    };

    const token = generateToken(newPatient, 'patient');

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      token,
      user: {
        id: patientId,
        name: name,
        email: email,
        phone: phone,
        age: age,
        place: place,
        address: address,
        role: 'patient'
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.', error: error.message });
  }
};

// 2. Login (Universal with role detection or explicit role)
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    let user = null;
    let detectedRole = role;

    // If role is provided, search specific table
    if (role === 'admin') {
      const rows = await db.query('SELECT * FROM Admin WHERE Email = ?', [email]);
      user = rows[0];
    } else if (role === 'doctor') {
      const rows = await db.query('SELECT * FROM Doctor WHERE Email = ?', [email]);
      user = rows[0];
    } else if (role === 'patient') {
      const rows = await db.query('SELECT * FROM Patient WHERE Email = ?', [email]);
      user = rows[0];
    } else {
      // Search across all tables in order: Admin -> Doctor -> Patient
      const adminRows = await db.query('SELECT * FROM Admin WHERE Email = ?', [email]);
      if (adminRows.length > 0) {
        user = adminRows[0];
        detectedRole = 'admin';
      } else {
        const docRows = await db.query('SELECT * FROM Doctor WHERE Email = ?', [email]);
        if (docRows.length > 0) {
          user = docRows[0];
          detectedRole = 'doctor';
        } else {
          const patRows = await db.query('SELECT * FROM Patient WHERE Email = ?', [email]);
          if (patRows.length > 0) {
            user = patRows[0];
            detectedRole = 'patient';
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user not found.' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user, detectedRole);

    const safeUser = {
      id: detectedRole === 'admin' ? user.Admin_id : detectedRole === 'doctor' ? user.Doc_id : user.Patient_id,
      name: user.Name,
      email: user.Email,
      role: detectedRole,
      specialization: user.Specialization || null,
      availability: user.Availability || null,
      phone: user.Phone || null,
      age: user.Age || null,
      place: user.Place || null,
      address: user.Address || null,
      room_no: user.Room_no || null
    };

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.Name}!`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during authentication.', error: error.message });
  }
};

// 3. Admin Change Password (Level 2.1.3 in report DFD)
exports.changeAdminPassword = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const rows = await db.query('SELECT * FROM Admin WHERE Admin_id = ?', [adminId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, admin.Password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE Admin SET Password = ? WHERE Admin_id = ?', [hashedNew, adminId]);

    return res.status(200).json({ success: true, message: 'Admin password updated successfully.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update password.', error: error.message });
  }
};

// 4. Get Current Auth Profile
exports.getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    let user = null;

    if (role === 'admin') {
      const rows = await db.query('SELECT Admin_id as id, Name, Email, Created_at FROM Admin WHERE Admin_id = ?', [id]);
      user = rows[0];
    } else if (role === 'doctor') {
      const rows = await db.query('SELECT Doc_id as id, Name, Specialization, Availability, Email, Phone, Experience_years, Room_no FROM Doctor WHERE Doc_id = ?', [id]);
      user = rows[0];
    } else if (role === 'patient') {
      const rows = await db.query('SELECT Patient_id as id, Name, Age, Phone, Email, Place, Address, Created_at FROM Patient WHERE Patient_id = ?', [id]);
      user = rows[0];
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, user: { ...user, role } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};
