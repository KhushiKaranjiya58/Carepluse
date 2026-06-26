/**
 * Doctor Controller
 * Handles viewing appointments, patient list, and profile management
 */

const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const Report = require('../models/Report');
const { verifyDoctorPatientRelationship } = require('./reportController');

// Fields to return for doctor profile (exclude password)
const DOCTOR_PROFILE_FIELDS =
  'name email phone specialization experience qualification consultationFee profilePhoto rating bio isActive';

/**
 * @route   GET /api/doctor/profile
 * @desc    Get logged-in doctor's profile
 * @access  Private (Doctor)
 */
const getMyProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id).select(DOCTOR_PROFILE_FIELDS);

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile.',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/doctor/profile
 * @desc    Update logged-in doctor's profile
 * @access  Private (Doctor)
 */
const updateMyProfile = async (req, res) => {
  try {
    const {
      profilePhoto,
      specialization,
      experience,
      qualification,
      consultationFee,
      bio,
      phone,
    } = req.body;

    const doctor = await User.findById(req.user._id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    if (profilePhoto !== undefined) doctor.profilePhoto = profilePhoto;
    if (specialization) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = Number(experience);
    if (qualification) doctor.qualification = qualification;
    if (consultationFee !== undefined) doctor.consultationFee = Number(consultationFee);
    if (bio !== undefined) doctor.bio = bio;
    if (phone !== undefined) doctor.phone = phone;

    await doctor.save();

    const updated = await User.findById(doctor._id).select(DOCTOR_PROFILE_FIELDS);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/doctor/patients
 * @desc    Get unique patients who booked appointments with this doctor
 * @access  Private (Doctor)
 */
const getMyPatients = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email phone age gender dateOfBirth address')
      .sort({ date: -1 });

    // Build unique patient list with appointment counts
    const patientMap = new Map();

    appointments.forEach((appt) => {
      if (!appt.patient) return;

      const id = appt.patient._id.toString();

      if (!patientMap.has(id)) {
        patientMap.set(id, {
          patient: appt.patient,
          totalAppointments: 0,
          latestAppointment: appt,
        });
      }

      const entry = patientMap.get(id);
      entry.totalAppointments++;

      if (new Date(appt.date) > new Date(entry.latestAppointment.date)) {
        entry.latestAppointment = appt;
      }
    });

    const patients = Array.from(patientMap.values());

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
 * @route   GET /api/doctor/appointments
 * @desc    Get all appointments assigned to logged-in doctor
 * @access  Private (Doctor)
 */
const getMyAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { doctor: req.user._id };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone age gender address')
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
 * @route   PUT /api/doctor/appointments/:id/status
 * @desc    Update appointment status (Pending, Confirmed, Completed, Cancelled)
 * @access  Private (Doctor)
 */
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, diagnosis, prescription } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not assigned to you.',
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    // Create medical record when appointment is completed
    if (status === 'Completed' && diagnosis) {
      await MedicalRecord.create({
        patient: appointment.patient,
        doctor: req.user._id,
        appointment: appointment._id,
        diagnosis,
        prescription: prescription || '',
        notes: notes || '',
        visitDate: appointment.date,
      });
    }

    const updatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone age gender address')
      .populate('doctor', 'name specialization');

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully.',
      data: updatedAppointment,
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
 * @route   GET /api/doctor/appointments/:id/patient
 * @desc    Get patient details for a specific appointment
 * @access  Private (Doctor)
 */
const getPatientDetails = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user._id,
    }).populate('patient', 'name email phone age gender address createdAt');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not assigned to you.',
      });
    }

    // Also fetch patient's medical history
    const records = await MedicalRecord.find({
      patient: appointment.patient._id,
    })
      .populate('doctor', 'name specialization')
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      data: {
        appointment,
        medicalHistory: records,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient details.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/doctor/patients/:patientId/history
 * @desc    Get full appointment history and reports for a patient with this doctor
 * @access  Private (Doctor)
 */
const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    const hasRelationship = await verifyDoctorPatientRelationship(
      req.user._id,
      patientId
    );
    if (!hasRelationship) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this patient.',
      });
    }

    const patient = await User.findById(patientId).select(
      'name email phone age gender dateOfBirth address'
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.',
      });
    }

    const [appointments, reports] = await Promise.all([
      Appointment.find({ doctor: req.user._id, patient: patientId }).sort({ date: -1 }),
      Report.find({ doctor: req.user._id, patient: patientId })
        .populate('doctor', 'name specialization')
        .sort({ reportDate: -1 }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        patient,
        appointments,
        reports,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient history.',
      error: error.message,
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyPatients,
  getMyAppointments,
  updateAppointmentStatus,
  getPatientDetails,
  getPatientHistory,
};
