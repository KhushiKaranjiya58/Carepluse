/**
 * Authentication Routes
 * Public routes for patient registration and role-based login
 */

const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register new user (patient, doctor, or admin)
router.post('/register', register);

// POST /api/auth/login - Login (patient, doctor, admin)
router.post('/login', login);

// GET /api/auth/me - Get current user profile (protected)
router.get('/me', verifyToken, getMe);

module.exports = router;
