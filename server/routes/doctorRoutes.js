/**
 * Doctor Routes
 * Protected routes for doctor-specific actions
 */

const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getMyPatients,
  getMyAppointments,
  updateAppointmentStatus,
  getPatientDetails,
  getPatientHistory,
} = require('../controllers/doctorController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All doctor routes require authentication and doctor role
router.use(verifyToken, checkRole('doctor'));

// Profile management
router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

// Patients who booked with this doctor
router.get('/patients', getMyPatients);

// GET /api/doctor/patients/:patientId/history - Full history with patient
router.get('/patients/:patientId/history', getPatientHistory);

// GET /api/doctor/appointments - View assigned appointments
router.get('/appointments', getMyAppointments);

// PUT /api/doctor/appointments/:id/status - Update appointment status
router.put('/appointments/:id/status', updateAppointmentStatus);

// GET /api/doctor/appointments/:id/patient - View patient details
router.get('/appointments/:id/patient', getPatientDetails);

module.exports = router;
