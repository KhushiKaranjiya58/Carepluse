/**
 * JWT Authentication Middleware
 * Verifies the JWT token from Authorization header and attaches user to request
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request object
const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle hardcoded admin token (admin is not stored in DB)
    if (decoded.role === 'admin' && decoded.id === 'admin') {
      req.user = {
        _id: 'admin',
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        role: 'admin',
      };
      return next();
    }

    // Find user and attach to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token invalid.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

/**
 * Role-Based Access Control Middleware
 * Restricts route access to specific user roles
 * Usage: checkRole('patient') or checkRole('doctor', 'admin')
 */
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}.`,
      });
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };
