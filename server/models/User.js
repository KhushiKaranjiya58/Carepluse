/**
 * User Model
 * Base model for all roles: patient, doctor, and admin
 * Stores authentication credentials and common profile fields
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    // Patient-specific fields
    dateOfBirth: {
      type: Date,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    address: {
      type: String,
      trim: true,
    },
    // Patient favourite doctors (array of doctor IDs)
    favouriteDoctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Doctor-specific fields
    specialization: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: 0,
    },
    qualification: {
      type: String,
      trim: true,
    },
    consultationFee: {
      type: Number,
      min: 0,
    },
    profilePhoto: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    bio: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
