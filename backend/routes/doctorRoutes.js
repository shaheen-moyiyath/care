const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { verifyToken, isDoctor } = require('../middleware/authMiddleware');

router.use(verifyToken, isDoctor);

router.get('/appointments', doctorController.getDoctorAppointments);
router.put('/appointments/:appoId/clinical', doctorController.updateClinicalRecord);
router.put('/appointments/:appoId/surgery-decision', doctorController.handleSurgeryDecision);
router.put('/availability', doctorController.updateAvailability);
router.get('/stats', doctorController.getDoctorStats);

module.exports = router;
