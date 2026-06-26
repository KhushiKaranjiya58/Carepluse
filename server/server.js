/**
 * Carepluse Server Entry Point
 * Express server with MongoDB connection and API routes
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { seedDoctorProfiles } = require('./seeders/doctorSeeder');

// Import route files
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Carepluse API is running.',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/patients', favouriteRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/appointments', appointmentRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, seed doctors, then start server
const startServer = async () => {
  await connectDB();
  await seedDoctorProfiles();

  app.listen(PORT, () => {
    console.log(`Carepluse server running on port ${PORT}`);
  });
};

startServer();
