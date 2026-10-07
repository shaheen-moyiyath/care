const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'opas_super_secret_jwt_key_2026_healthcare';

// Verify Token Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// Check Patient Role
function isPatient(req, res, next) {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Patient role required.' });
  }
}

// Check Doctor Role
function isDoctor(req, res, next) {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Doctor role required.' });
  }
}

// Check Admin Role
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied: Administrator role required.' });
  }
}

module.exports = {
  verifyToken,
  isPatient,
  isDoctor,
  isAdmin,
  JWT_SECRET
};
