/**
 * Doctor Edit Profile Page
 * Allows doctors to update their profile information
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Layout from '../components/Layout';

const SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'General Physician',
];

const DoctorEditProfile = () => {
  const [formData, setFormData] = useState({
    profilePhoto: '',
    specialization: '',
    experience: '',
    qualification: '',
    consultationFee: '',
    bio: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await API.get('/doctor/profile');
      const profile = res.data.data;
      setFormData({
        profilePhoto: profile.profilePhoto || '',
        specialization: profile.specialization || '',
        experience: profile.experience ?? '',
        qualification: profile.qualification || '',
        consultationFee: profile.consultationFee ?? '',
        bio: profile.bio || '',
        phone: profile.phone || '',
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load profile.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await API.put('/doctor/profile', {
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="page-title">Edit Profile</h1>
          <Link to="/doctor" className="btn-secondary text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        {message.text && (
          <div className={`mb-4 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.text}
          </div>
        )}

        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={formData.profilePhoto || 'https://i.pravatar.cc/150?img=68'}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-dark-border"
            />
            <div>
              <p className="text-slate-300 text-sm">Profile Preview</p>
              <p className="text-slate-500 text-xs">Update photo URL below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Profile Photo URL</label>
              <input
                type="url"
                name="profilePhoto"
                value={formData.profilePhoto}
                onChange={handleChange}
                className="input-field"
                placeholder="https://example.com/photo.jpg"
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

            <div>
              <label className="label">Specialization *</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
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

            <div>
              <label className="label">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="input-field"
                rows={4}
                placeholder="Tell patients about your experience and expertise..."
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorEditProfile;
