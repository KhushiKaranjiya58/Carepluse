/**
 * Admin Dashboard
 * Manage doctors, patients, appointments, and view system statistics
 */

import { useState, useEffect } from 'react';
import API from '../api/axios';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, doctorsRes, patientsRes, apptRes] = await Promise.all([
        API.get('/admin/dashboard/stats'),
        API.get('/admin/doctors'),
        API.get('/admin/patients'),
        API.get('/admin/appointments'),
      ]);
      setStats(statsRes.data.data);
      setDoctors(doctorsRes.data.data || []);
      setPatients(patientsRes.data.data || []);
      setAppointments(apptRes.data.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load admin data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/doctors', doctorForm);
      setMessage({ type: 'success', text: 'Doctor added successfully!' });
      setShowAddDoctor(false);
      setDoctorForm({ name: '', email: '', password: '', phone: '', specialization: '' });
      fetchAllData();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add doctor.',
      });
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await API.delete(`/admin/doctors/${id}`);
      setMessage({ type: 'success', text: 'Doctor deleted.' });
      fetchAllData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete doctor.' });
    }
  };

  const handleToggleDoctor = async (doctor) => {
    try {
      await API.put(`/admin/doctors/${doctor._id}`, {
        isActive: !doctor.isActive,
      });
      fetchAllData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update doctor.' });
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await API.delete(`/admin/appointments/${id}`);
      setMessage({ type: 'success', text: 'Appointment deleted.' });
      fetchAllData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete appointment.' });
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await API.post('/appointments/admin-book', bookingForm);
      setMessage({
        type: 'success',
        text: 'Appointment booked successfully! Visible on patient and doctor dashboards.',
      });
      setBookingForm({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        reason: '',
        notes: '',
      });
      fetchAllData();
      setActiveTab('appointments');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to book appointment.',
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const activeDoctors = doctors.filter((d) => d.isActive);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'book', label: 'Book Appointment' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'patients', label: 'Patients' },
    { id: 'appointments', label: 'Appointments' },
  ];

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
      <h1 className="page-title mb-6">Admin Dashboard</h1>

      {message.text && (
        <div className={`mb-4 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard title="Total Patients" value={stats.totalPatients} icon="👥" />
          <StatCard title="Total Doctors" value={stats.totalDoctors} icon="👨‍⚕️" />
          <StatCard title="Total Appointments" value={stats.totalAppointments} icon="📅" />
          <StatCard title="Medical Records" value={stats.totalMedicalRecords} icon="📋" />
        </div>
      )}

      {activeTab === 'book' && (
        <div className="max-w-2xl">
          <h3 className="font-semibold text-lg text-slate-100 mb-2">Book Appointment</h3>
          <p className="text-slate-400 text-sm mb-6">
            Schedule an appointment on behalf of a patient. It will appear on both the patient&apos;s
            and doctor&apos;s dashboards.
          </p>

          <div className="card">
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="label">Select Patient *</label>
                <select
                  value={bookingForm.patientId}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, patientId: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="">Choose a patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
                {patients.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1">No patients registered yet.</p>
                )}
              </div>

              <div>
                <label className="label">Select Doctor / Specialist *</label>
                <select
                  value={bookingForm.doctorId}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, doctorId: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="">Choose a doctor</option>
                  {activeDoctors.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} — {d.specialization}
                    </option>
                  ))}
                </select>
                {activeDoctors.length === 0 && (
                  <p className="text-xs text-slate-500 mt-1">No active doctors available.</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, date: e.target.value })
                    }
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="label">Time *</label>
                  <input
                    type="time"
                    value={bookingForm.time}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, time: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Reason for Visit *</label>
                <input
                  type="text"
                  value={bookingForm.reason}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, reason: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g. General checkup, follow-up"
                  required
                />
              </div>

              <div>
                <label className="label">Notes (optional)</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, notes: e.target.value })
                  }
                  className="input-field"
                  rows={2}
                  placeholder="Additional notes for the appointment..."
                />
              </div>

              <button type="submit" disabled={bookingLoading} className="btn-primary">
                {bookingLoading ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold text-lg text-slate-100">Manage Doctors</h3>
            <button onClick={() => setShowAddDoctor(!showAddDoctor)} className="btn-primary text-sm">
              {showAddDoctor ? 'Cancel' : '+ Add Doctor'}
            </button>
          </div>

          {showAddDoctor && (
            <div className="card mb-4">
              <form onSubmit={handleAddDoctor} className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={doctorForm.name}
                  onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="password"
                  placeholder="Password *"
                  value={doctorForm.password}
                  onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                  className="input-field"
                  required
                />
                <input
                  type="text"
                  placeholder="Specialization *"
                  value={doctorForm.specialization}
                  onChange={(e) =>
                    setDoctorForm({ ...doctorForm, specialization: e.target.value })
                  }
                  className="input-field"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  className="input-field"
                />
                <button type="submit" className="btn-primary">
                  Add Doctor
                </button>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full card !p-0 overflow-hidden">
              <thead className="table-header">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-slate-300">Name</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-300">Email</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-300">Specialization</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-300">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id} className="table-row">
                    <td className="p-3 text-sm text-slate-200">{doc.name}</td>
                    <td className="p-3 text-sm text-slate-300">{doc.email}</td>
                    <td className="p-3 text-sm text-slate-300">{doc.specialization}</td>
                    <td className="p-3 text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          doc.isActive
                            ? 'bg-green-900/50 text-green-300 border border-green-700/50'
                            : 'bg-red-900/50 text-red-300 border border-red-700/50'
                        }`}
                      >
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-sm space-x-2">
                      <button
                        onClick={() => handleToggleDoctor(doc)}
                        className="text-primary-400 hover:text-primary-300 hover:underline"
                      >
                        {doc.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteDoctor(doc._id)}
                        className="text-red-400 hover:text-red-300 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="overflow-x-auto">
          <table className="w-full card !p-0 overflow-hidden">
            <thead className="table-header">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-slate-300">Name</th>
                <th className="text-left p-3 text-sm font-medium text-slate-300">Email</th>
                <th className="text-left p-3 text-sm font-medium text-slate-300">Phone</th>
                <th className="text-left p-3 text-sm font-medium text-slate-300">Age</th>
                <th className="text-left p-3 text-sm font-medium text-slate-300">Gender</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id} className="table-row">
                  <td className="p-3 text-sm text-slate-200">{patient.name}</td>
                  <td className="p-3 text-sm text-slate-300">{patient.email}</td>
                  <td className="p-3 text-sm text-slate-300">{patient.phone || '-'}</td>
                  <td className="p-3 text-sm text-slate-300">{patient.age || '-'}</td>
                  <td className="p-3 text-sm text-slate-300 capitalize">{patient.gender || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="grid gap-4">
          {appointments.length === 0 ? (
            <p className="text-muted">No appointments in the system yet.</p>
          ) : (
            appointments.map((appt) => (
            <div key={appt._id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-100">
                    {appt.patient?.name} → Dr. {appt.doctor?.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {new Date(appt.date).toLocaleDateString()} at {appt.time}
                  </p>
                  <p className="text-sm text-slate-500">{appt.reason}</p>
                  {appt.notes && (
                    <p className="text-sm text-slate-500 mt-1">Notes: {appt.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={appt.status} />
                  <button
                    onClick={() => handleDeleteAppointment(appt._id)}
                    className="text-red-400 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      )}
    </Layout>
  );
};

const StatCard = ({ title, value, icon }) => (
  <div className="card text-center">
    <div className="text-3xl mb-2">{icon}</div>
    <p className="text-3xl font-bold text-primary-400">{value}</p>
    <p className="text-sm text-slate-400 mt-1">{title}</p>
  </div>
);

export default AdminDashboard;
