/**
 * Patient Controller
 * Handles appointment booking and medical record viewing for patients
 */

const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');

/**
 * @route   POST /api/patient/appointments
 * @desc    Book a new appointment with a doctor
 * @access  Private (Patient)
 */
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, reason } = req.body;

    if (!doctorId || !date || !time || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctor, date, time, and reason.',
      });
    }

    // Verify doctor exists and is active
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
      patient: req.user._id,
      doctor: doctorId,
      date,
      time,
      reason,
      status: 'Pending',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate(
        'doctor',
        'name email specialization phone experience qualification consultationFee profilePhoto rating'
      )
      .populate('patient', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: populatedAppointment,
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
 * @route   GET /api/patient/appointments
 * @desc    Get all appointments for logged-in patient
 * @access  Private (Patient)
 */
const getMyAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { patient: req.user._id };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate(
        'doctor',
        'name email specialization phone experience qualification consultationFee profilePhoto rating'
      )
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
 * @route   GET /api/patient/records
 * @desc    Get medical records for logged-in patient
 * @access  Private (Patient)
 */
const getMyRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.user._id })
      .populate('doctor', 'name specialization')
      .populate('appointment', 'date time reason status')
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching medical records.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/patient/doctors
 * @desc    Get list of active doctors with profiles (filter by specialization/search)
 * @access  Private (Patient)
 */
const getDoctors = async (req, res) => {
  try {
    const { specialization, search } = req.query;
    const filter = { role: 'doctor', isActive: true };

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { qualification: { $regex: search, $options: 'i' } },
      ];
    }

    const doctors = await User.find(filter)
      .select(
        'name email phone specialization experience qualification consultationFee profilePhoto rating bio'
      )
      .sort({ rating: -1, name: 1 });

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
 * @route   GET /api/patient/specializations
 * @desc    Get list of available specializations
 * @access  Private (Patient)
 */
const getSpecializations = async (req, res) => {
  try {
    const specializations = await User.distinct('specialization', {
      role: 'doctor',
      isActive: true,
      specialization: { $ne: null, $ne: '' },
    });

    res.status(200).json({
      success: true,
      data: specializations.sort(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching specializations.',
      error: error.message,
    });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getMyRecords,
  getDoctors,
  getSpecializations,
};
