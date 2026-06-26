/**
 * Authentication Controller
 * Handles registration for all roles and login
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token with user id and role
const generateToken = (user) => {
  const userId = user._id || user.id;
  return jwt.sign(
    { id: userId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Build user response object (exclude password)
const buildUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  token: generateToken(user),
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (patient, doctor, or admin)
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { role, name, email, password, phone } = req.body;

    // Validate common required fields
    if (!role || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide role, name, email, and password.',
      });
    }

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be patient, doctor, or admin.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    let userData = { name, email, password, role, phone };

    // Role-specific validation and fields
    if (role === 'patient') {
      const { dateOfBirth, gender } = req.body;

      if (!dateOfBirth || !gender) {
        return res.status(400).json({
          success: false,
          message: 'Please provide date of birth and gender for patient registration.',
        });
      }

      userData = {
        ...userData,
        dateOfBirth: new Date(dateOfBirth),
        gender,
      };
    }

    if (role === 'doctor') {
      const { specialization, experience, qualification, consultationFee } = req.body;

      if (!specialization || experience === undefined || !qualification || consultationFee === undefined) {
        return res.status(400).json({
          success: false,
          message:
            'Please provide specialization, experience, qualification, and consultation fee for doctor registration.',
        });
      }

      userData = {
        ...userData,
        specialization,
        experience: Number(experience),
        qualification,
        consultationFee: Number(consultationFee),
        isActive: true,
      };
    }

    if (role === 'admin') {
      const { adminSecretKey } = req.body;

      if (!adminSecretKey) {
        return res.status(400).json({
          success: false,
          message: 'Admin secret key is required for admin registration.',
        });
      }

      if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin secret key.',
        });
      }

      userData = {
        ...userData,
        isActive: true,
      };
    }

    const user = await User.create(userData);

    const roleMessages = {
      patient: 'Patient registered successfully.',
      doctor: 'Doctor registered successfully.',
      admin: 'Admin registered successfully.',
    };

    res.status(201).json({
      success: true,
      message: roleMessages[role],
      data: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login for patient, doctor, or admin
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role.',
      });
    }

    // Legacy hardcoded admin login (backward compatible)
    if (role === 'admin') {
      if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
      ) {
        return res.status(200).json({
          success: true,
          message: 'Admin login successful.',
          data: {
            _id: 'admin',
            name: 'Admin',
            email: process.env.ADMIN_EMAIL,
            role: 'admin',
            token: jwt.sign(
              { id: 'admin', role: 'admin' },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            ),
          },
        });
      }
    }

    // Find user by email and role (works for patient, doctor, and registered admins)
    const user = await User.findOne({ email, role });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or role.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact admin.',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user profile
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    // Legacy hardcoded admin
    if (req.user.role === 'admin' && req.user._id === 'admin') {
      return res.status(200).json({
        success: true,
        data: {
          _id: 'admin',
          name: 'Admin',
          email: process.env.ADMIN_EMAIL,
          role: 'admin',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error.',
      error: error.message,
    });
  }
};

module.exports = { register, login, getMe };
