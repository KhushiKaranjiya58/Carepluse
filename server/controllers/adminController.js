/**
 * Admin Controller
 * Handles doctor management, patient/appointment views, and dashboard stats
 */

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

/**
 * @route   POST /api/admin/doctors
 * @desc    Add a new doctor (created by admin)
 * @access  Private (Admin)
 */
const addDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and specialization.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    const doctor = await User.create({
      name,
      email,
      password,
      role: 'doctor',
      phone,
      specialization,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully.',
      data: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        isActive: doctor.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding doctor.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/doctors
 * @desc    Get all doctors
 * @access  Private (Admin)
 */
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctors.',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/doctors/:id
 * @desc    Update doctor details or active status
 * @access  Private (Admin)
 */
const updateDoctor = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    const { name, phone, specialization, isActive } = req.body;

    if (name) doctor.name = name;
    if (phone) doctor.phone = phone;
    if (specialization) doctor.specialization = specialization;
    if (typeof isActive === 'boolean') doctor.isActive = isActive;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully.',
      data: {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        isActive: doctor.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating doctor.',
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/admin/doctors/:id
 * @desc    Delete a doctor
 * @access  Private (Admin)
 */
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'doctor',
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting doctor.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/patients
 * @desc    Get all registered patients
 * @access  Private (Admin)
 */
const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patients.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/appointments
 * @desc    Get all appointments in the system
 * @access  Private (Admin)
 */
const getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments.',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/admin/appointments/:id
 * @desc    Update any appointment (admin override)
 * @access  Private (Admin)
 */
const updateAppointment = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    if (status) appointment.status = status;
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully.',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment.',
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/admin/appointments/:id
 * @desc    Delete an appointment
 * @access  Private (Admin)
 */
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting appointment.',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/appointments/admin-book
 * @desc    Admin books an appointment on behalf of a patient
 * @access  Private (Admin)
 */
const adminBookAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, date, time, reason, notes } = req.body;

    if (!patientId || !doctorId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patient, doctor, date, time, and reason.',
      });
    }

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.',
      });
    }

    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      isActive: true,
    });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or inactive.',
      });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      date,
      time,
      reason,
      notes: notes || '',
      status: 'Pending',
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully on behalf of patient.',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while booking appointment.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard statistics (counts)
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    const [patients, doctors, appointments, records] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      Appointment.countDocuments(),
      MedicalRecord.countDocuments(),
    ]);

    const appointmentsByStatus = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients: patients,
        totalDoctors: doctors,
        totalAppointments: appointments,
        totalMedicalRecords: records,
        appointmentsByStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats.',
      error: error.message,
    });
  }
};

module.exports = {
  addDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  getPatients,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getDashboardStats,
  adminBookAppointment,
};
