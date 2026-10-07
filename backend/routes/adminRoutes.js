const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, isAdmin);

// Analytics & Reports
router.get('/dashboard-stats', adminController.getDashboardStats);

// Doctors CRUD (Organized by Specialization: Cardiology, Neurology, Orthopedics, Dermatology)
router.get('/doctors', adminController.getAllDoctors);
router.post('/doctors', adminController.addDoctor);
router.put('/doctors/:docId', adminController.updateDoctor);
router.delete('/doctors/:docId', adminController.deleteDoctor);

// Centralized Master Appointments Scheduler
router.get('/appointments', adminController.getAllAppointments);
router.put('/appointments/:appoId/reschedule', adminController.adminRescheduleAppointment);
router.put('/appointments/:appoId/cancel', adminController.adminCancelAppointment);

// Patient Directory
router.get('/patients', adminController.getAllPatients);

module.exports = router;
