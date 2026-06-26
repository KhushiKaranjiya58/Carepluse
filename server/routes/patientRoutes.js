/**
 * Patient Routes
 * Protected routes for patient-specific actions
 */

const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getMyRecords,
  getDoctors,
  getSpecializations,
} = require('../controllers/patientController');
const { getMyReports, getReportById } = require('../controllers/reportController');
const {
  getFavourites,
  addFavourite,
  removeFavourite,
} = require('../controllers/favouriteController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All patient routes require authentication and patient role
router.use(verifyToken, checkRole('patient'));

// GET /api/patient/doctors - List doctors for booking (with filter/search)
router.get('/doctors', getDoctors);

// GET /api/patient/specializations - List available specializations
router.get('/specializations', getSpecializations);

// Favourite doctors
router.get('/favourites', getFavourites);
router.post('/favourites/add', addFavourite);
router.delete('/favourites/remove', removeFavourite);

// POST /api/patient/appointments - Book appointment
router.post('/appointments', bookAppointment);

// GET /api/patient/appointments - View own appointments
router.get('/appointments', getMyAppointments);

// GET /api/patient/records - View own medical records
router.get('/records', getMyRecords);

// GET /api/patient/reports - View own medical reports
router.get('/reports', getMyReports);

// GET /api/patient/reports/:id - View single report
router.get('/reports/:id', getReportById);

module.exports = router;
