/**
 * Appointment Routes
 * Admin appointment booking endpoint
 */

const express = require('express');
const router = express.Router();
const { adminBookAppointment } = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// POST /api/appointments/admin-book - Admin books appointment for a patient
router.post('/admin-book', verifyToken, checkRole('admin'), adminBookAppointment);

module.exports = router;
