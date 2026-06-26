/**
 * Report Controller
 * Patient report viewing and doctor report management
 */

const Report = require('../models/Report');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Verify doctor has treated this patient (has at least one appointment)
const verifyDoctorPatientRelationship = async (doctorId, patientId) => {
  const appointment = await Appointment.findOne({
    doctor: doctorId,
    patient: patientId,
  });
  return !!appointment;
};

// Build report content string for PDF/storage
const buildReportContent = ({ diagnosis, prescription, notes, description }) => {
  const parts = [];
  if (description) parts.push(`Description: ${description}`);
  if (diagnosis) parts.push(`Diagnosis: ${diagnosis}`);
  if (prescription) parts.push(`Prescription: ${prescription}`);
  if (notes) parts.push(`Notes: ${notes}`);
  return parts.join('\n\n');
};

/**
 * @route   GET /api/patient/reports
 * @desc    Get all reports for logged-in patient
 * @access  Private (Patient)
 */
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ patient: req.user._id })
      .populate('doctor', 'name specialization qualification profilePhoto phone')
      .populate('patient', 'name email phone')
      .sort({ reportDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/patient/reports/:id
 * @desc    Get a single report by ID (patient must own it)
 * @access  Private (Patient)
 */
const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      patient: req.user._id,
    })
      .populate('doctor', 'name specialization qualification phone')
      .populate('patient', 'name email phone');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching report.',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/reports
 * @desc    Create a new report for a patient (doctor only)
 * @access  Private (Doctor)
 */
const createReport = async (req, res) => {
  try {
    const { patientId, title, diagnosis, prescription, notes, reportDate, description } =
      req.body;

    if (!patientId || !title || !diagnosis) {
      return res.status(400).json({
        success: false,
        message: 'Please provide patientId, title, and diagnosis.',
      });
    }

    const patient = await User.findOne({ _id: patientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found.',
      });
    }

    const hasRelationship = await verifyDoctorPatientRelationship(
      req.user._id,
      patientId
    );
    if (!hasRelationship) {
      return res.status(403).json({
        success: false,
        message: 'You can only create reports for patients who have booked with you.',
      });
    }

    const report = await Report.create({
      patient: patientId,
      doctor: req.user._id,
      title,
      description: description || diagnosis,
      diagnosis,
      prescription: prescription || '',
      notes: notes || '',
      reportDate: reportDate ? new Date(reportDate) : new Date(),
      reportContent: buildReportContent({ diagnosis, prescription, notes, description }),
    });

    const populated = await Report.findById(report._id)
      .populate('doctor', 'name specialization qualification profilePhoto')
      .populate('patient', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Report created successfully.',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating report.',
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/reports/patient/:patientId
 * @desc    Get all reports by logged-in doctor for a specific patient
 * @access  Private (Doctor)
 */
const getReportsByPatient = async (req, res) => {
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

    const reports = await Report.find({
      patient: patientId,
      doctor: req.user._id,
    })
      .populate('doctor', 'name specialization')
      .populate('patient', 'name email')
      .sort({ reportDate: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient reports.',
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/reports/:id
 * @desc    Update a report (only the doctor who created it)
 * @access  Private (Doctor)
 */
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (report.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit reports you created.',
      });
    }

    const { title, diagnosis, prescription, notes, reportDate, description } = req.body;

    if (title) report.title = title;
    if (diagnosis) report.diagnosis = diagnosis;
    if (prescription !== undefined) report.prescription = prescription;
    if (notes !== undefined) report.notes = notes;
    if (description !== undefined) report.description = description;
    if (reportDate) report.reportDate = new Date(reportDate);

    report.reportContent = buildReportContent({
      diagnosis: report.diagnosis,
      prescription: report.prescription,
      notes: report.notes,
      description: report.description,
    });

    await report.save();

    const updated = await Report.findById(report._id)
      .populate('doctor', 'name specialization qualification profilePhoto')
      .populate('patient', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating report.',
      error: error.message,
    });
  }
};

module.exports = {
  getMyReports,
  getReportById,
  createReport,
  getReportsByPatient,
  updateReport,
  verifyDoctorPatientRelationship,
};
