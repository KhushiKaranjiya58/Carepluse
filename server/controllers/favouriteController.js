/**
 * Favourites Controller
 * Patient favourite doctor management
 */

const User = require('../models/User');

const DOCTOR_FIELDS =
  'name email phone specialization experience qualification consultationFee profilePhoto rating bio';

/**
 * @route   GET /api/patient/favourites
 * @desc    Get all favourite doctors for logged-in patient
 * @access  Private (Patient)
 */
const getFavourites = async (req, res) => {
  try {
    const patient = await User.findById(req.user._id).populate({
      path: 'favouriteDoctors',
      match: { role: 'doctor', isActive: true },
      select: DOCTOR_FIELDS,
    });

    const favourites = (patient?.favouriteDoctors || []).filter(Boolean);

    res.status(200).json({
      success: true,
      count: favourites.length,
      data: favourites,
      favouriteIds: favourites.map((d) => d._id.toString()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching favourites.',
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/patient/favourites/add
 * @desc    Add a doctor to patient favourites
 * @access  Private (Patient)
 */
const addFavourite = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId.',
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

    const patient = await User.findById(req.user._id);

    const alreadyFavourite = patient.favouriteDoctors?.some(
      (id) => id.toString() === doctorId
    );

    if (alreadyFavourite) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is already in your favourites.',
      });
    }

    if (!patient.favouriteDoctors) {
      patient.favouriteDoctors = [];
    }

    patient.favouriteDoctors.push(doctorId);
    await patient.save();

    const updated = await User.findById(patient._id).populate({
      path: 'favouriteDoctors',
      select: DOCTOR_FIELDS,
    });

    res.status(200).json({
      success: true,
      message: 'Doctor added to favourites.',
      data: doctor,
      favouriteIds: updated.favouriteDoctors.map((d) => d._id.toString()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding favourite.',
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/patient/favourites/remove
 * @desc    Remove a doctor from patient favourites
 * @access  Private (Patient)
 */
const removeFavourite = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId.',
      });
    }

    const patient = await User.findById(req.user._id);

    const isFavourite = patient.favouriteDoctors?.some(
      (id) => id.toString() === doctorId
    );

    if (!isFavourite) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not in your favourites.',
      });
    }

    patient.favouriteDoctors = patient.favouriteDoctors.filter(
      (id) => id.toString() !== doctorId
    );
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Doctor removed from favourites.',
      favouriteIds: patient.favouriteDoctors.map((id) => id.toString()),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while removing favourite.',
      error: error.message,
    });
  }
};

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite,
};
