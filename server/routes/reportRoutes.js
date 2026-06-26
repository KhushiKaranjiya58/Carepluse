/**
 * Report Routes (Doctor)
 * POST /api/reports, GET /api/reports/patient/:id, PUT /api/reports/:id
 */

const express = require('express');
const router = express.Router();
const {
  createReport,
  getReportsByPatient,
  updateReport,
} = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All report management routes require doctor role
router.use(verifyToken, checkRole('doctor'));

// POST /api/reports - Create report for a patient
router.post('/', createReport);

// GET /api/reports/patient/:patientId - Get reports for a patient (by this doctor)
router.get('/patient/:patientId', getReportsByPatient);

// PUT /api/reports/:id - Update report (creator only)
router.put('/:id', updateReport);

module.exports = router;
