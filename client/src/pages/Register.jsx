/**
 * Registration Page
 * Role-based registration for Patient, Doctor, and Admin
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const INITIAL_FORM = {
  role: 'patient',
  name: '',
  email: '',
  password: '',
  phone: '',
  // Patient fields
  dateOfBirth: '',
  gender: '',
  // Doctor fields
  specialization: '',
  experience: '',
  qualification: '',
  consultationFee: '',
  // Admin fields
  adminSecretKey: '',
};

const Register = () => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const buildPayload = () => {
    const base = {
      role: formData.role,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
    };

    if (formData.role === 'patient') {
      return {
        ...base,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
      };
    }

    if (formData.role === 'doctor') {
      return {
        ...base,
        specialization: formData.specialization,
        experience: Number(formData.experience),
        qualification: formData.qualification,
        consultationFee: Number(formData.consultationFee),
      };
    }

    if (formData.role === 'admin') {
      return {
        ...base,
        adminSecretKey: formData.adminSecretKey,
      };
    }

    return base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(buildPayload());
      const paths = { patient: '/patient', doctor: '/doctor', admin: '/admin' };
      navigate(paths[user.role]);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    patient: 'Patient',
    doctor: 'Doctor',
    admin: 'Admin',
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold text-center mb-2 text-slate-100">
            Create Account
          </h2>
          <p className="text-center text-slate-400 text-sm mb-6">
            Register as a {roleLabels[formData.role]}
          </p>

          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="label">Register As *</label>
              <div className="grid grid-cols-3 gap-2">
                {['patient', 'doctor', 'admin'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() =>
                      setFormData({ ...INITIAL_FORM, role })
                    }
                    className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition-colors border ${
                      formData.role === role
                        ? 'bg-primary-600 text-white border-primary-500'
                        : 'bg-dark-surface text-slate-300 border-dark-border hover:bg-dark-hover'
                    }`}
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </div>

            {/* Common fields */}
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            {/* Patient-specific fields */}
            {formData.role === 'patient' && (
              <>
                <div>
                  <label className="label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input-field"
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="label">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            {/* Doctor-specific fields */}
            {formData.role === 'doctor' && (
              <>
                <div>
                  <label className="label">Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. Cardiologist"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Experience (years) *</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Consultation Fee ($) *</label>
                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleChange}
                      className="input-field"
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Qualification *</label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. MBBS, MD"
                    required
                  />
                </div>
              </>
            )}

            {/* Admin-specific fields */}
            {formData.role === 'admin' && (
              <div>
                <label className="label">Admin Secret Key *</label>
                <input
                  type="password"
                  name="adminSecretKey"
                  value={formData.adminSecretKey}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter admin secret key"
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Contact system administrator to obtain the secret key.
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Registering...' : `Register as ${roleLabels[formData.role]}`}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="link-accent">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
