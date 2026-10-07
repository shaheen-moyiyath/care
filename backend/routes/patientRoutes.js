const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, isPatient } = require('../middleware/authMiddleware');

// Public doctor search for browsing
router.get('/doctors', patientController.getDoctors);
router.get('/doctors/:docId/slots', patientController.getDoctorAvailableSlots);

// Protected Patient Routes
router.post('/appointments', verifyToken, isPatient, patientController.bookAppointment);
router.get('/appointments', verifyToken, isPatient, patientController.getMyAppointments);
router.put('/appointments/:appoId/reschedule', verifyToken, isPatient, patientController.rescheduleAppointment);
router.put('/appointments/:appoId/cancel', verifyToken, isPatient, patientController.cancelAppointment);
router.get('/notifications', verifyToken, isPatient, patientController.getMyNotifications);

module.exports = router;
