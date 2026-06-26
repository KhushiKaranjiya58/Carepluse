/**
 * Admin Routes
 * Protected routes for admin management actions
 */

const express = require('express');
const router = express.Router();
const {
  addDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  getPatients,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getDashboardStats,
} = require('../controllers/adminController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(verifyToken, checkRole('admin'));

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Doctor management
router.post('/doctors', addDoctor);
router.get('/doctors', getDoctors);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// Patient management
router.get('/patients', getPatients);

// Appointment management
router.get('/appointments', getAppointments);
router.put('/appointments/:id', updateAppointment);
router.delete('/appointments/:id', deleteAppointment);

module.exports = router;
