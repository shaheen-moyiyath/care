const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/register', authController.registerPatient);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/change-admin-password', verifyToken, isAdmin, authController.changeAdminPassword);

module.exports = router;
