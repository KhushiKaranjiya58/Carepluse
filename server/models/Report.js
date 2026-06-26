/**
 * Report Model
 * Stores medical reports created by doctors for patients
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Report title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      trim: true,
    },
    prescription: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    reportContent: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
