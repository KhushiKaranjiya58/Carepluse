/**
 * Doctor Dashboard
 * View assigned appointments, patient history, reports, and manage profile
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PatientHistoryModal from '../components/PatientHistoryModal';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: '',
    diagnosis: '',
    prescription: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, patientsRes, profileRes] = await Promise.all([
        API.get('/doctor/appointments'),
        API.get('/doctor/patients'),
        API.get('/doctor/profile'),
      ]);
      setAppointments(apptRes.data.data || []);
      setPatients(patientsRes.data.data || []);
      setProfile(profileRes.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load dashboard data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/doctor/appointments/${selectedAppt._id}/status`, updateForm);
      setMessage({ type: 'success', text: 'Appointment updated successfully!' });
      setSelectedAppt(null);
      setUpdateForm({ status: '', notes: '', diagnosis: '', prescription: '' });
      fetchData();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update appointment.',
      });
    }
  };

  const openUpdateModal = (appt) => {
    setSelectedAppt(appt);
    setUpdateForm({
      status: appt.status,
      notes: appt.notes || '',
      diagnosis: '',
      prescription: '',
    });
  };

  const openPatientHistory = (patient) => {
    setSelectedPatient({ id: patient._id, name: patient.name });
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
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div className="flex items-center gap-4">
          {profile?.profilePhoto && (
            <img
              src={profile.profilePhoto}
              alt={profile.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary-500/50"
            />
          )}
          <div>
            <h1 className="page-title">Doctor Dashboard</h1>
            {profile && (
              <p className="text-slate-400 text-sm">
                {profile.specialization} · {profile.experience} yrs · ★{' '}
                {profile.rating?.toFixed(1)}
              </p>
            )}
          </div>
        </div>
        <Link to="/doctor/profile" className="btn-secondary text-sm">
          Edit Profile
        </Link>
      </div>

      {message.text && (
        <div className={`mb-4 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map((status) => (
          <div key={status} className="card text-center">
            <p className="text-2xl font-bold text-primary-400">
              {appointments.filter((a) => a.status === status).length}
            </p>
            <p className="text-sm text-slate-400">{status}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('appointments')}
          className={activeTab === 'appointments' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          My Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={activeTab === 'patients' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          Patient History ({patients.length})
        </button>
      </div>

      {activeTab === 'appointments' && (
        <>
          {appointments.length === 0 ? (
            <p className="text-muted">No patients have booked appointments with you yet.</p>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appt) => (
                <div key={appt._id} className="card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-100">{appt.patient?.name}</h4>
                      <p className="text-sm text-slate-400">
                        {appt.patient?.email} | {appt.patient?.phone || 'No phone'}
                      </p>
                      {appt.patient?.age && (
                        <p className="text-sm text-slate-500">
                          Age: {appt.patient.age} | Gender: {appt.patient.gender}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                  <div className="mt-3 text-sm text-slate-400 space-y-1">
                    <p>
                      <span className="font-medium text-slate-300">Date:</span>{' '}
                      {new Date(appt.date).toLocaleDateString()} at {appt.time}
                    </p>
                    <p>
                      <span className="font-medium text-slate-300">Reason:</span> {appt.reason}
                    </p>
                    {appt.notes && (
                      <p>
                        <span className="font-medium text-slate-300">Notes:</span> {appt.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openUpdateModal(appt)}
                      className="btn-primary text-sm"
                    >
                      Update Status
                    </button>
                    {appt.patient && (
                      <button
                        onClick={() => openPatientHistory(appt.patient)}
                        className="btn-secondary text-sm"
                      >
                        View History
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'patients' && (
        <>
          {patients.length === 0 ? (
            <p className="text-muted">No patients have booked with you yet.</p>
          ) : (
            <div className="grid gap-4">
              {patients.map(({ patient, totalAppointments, latestAppointment }) => (
                <div key={patient._id} className="card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-slate-100">{patient.name}</h4>
                      <p className="text-sm text-slate-400">{patient.email}</p>
                      <p className="text-sm text-slate-500">
                        {patient.phone || 'No phone'}
                        {patient.gender && ` · ${patient.gender}`}
                      </p>
                    </div>
                    <span className="bg-primary-900/40 text-primary-300 text-xs px-2 py-1 rounded-full border border-primary-700/50">
                      {totalAppointments} appointment{totalAppointments !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {latestAppointment && (
                    <div className="mt-3 text-sm text-slate-400 border-t border-dark-border pt-3">
                      <p>
                        <span className="font-medium text-slate-300">Latest visit:</span>{' '}
                        {new Date(latestAppointment.date).toLocaleDateString()} —{' '}
                        <StatusBadge status={latestAppointment.status} />
                      </p>
                      <p className="mt-1">
                        <span className="font-medium text-slate-300">Reason:</span>{' '}
                        {latestAppointment.reason}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => openPatientHistory(patient)}
                    className="btn-primary text-sm mt-4"
                  >
                    View Full History & Reports
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Update appointment modal */}
      {selectedAppt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="font-semibold text-lg mb-4 text-slate-100">
              Update Appointment - {selectedAppt.patient?.name}
            </h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="label">Status *</label>
                <select
                  value={updateForm.status}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, status: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  value={updateForm.notes}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, notes: e.target.value })
                  }
                  className="input-field"
                  rows={2}
                />
              </div>
              {updateForm.status === 'Completed' && (
                <>
                  <div>
                    <label className="label">Diagnosis *</label>
                    <input
                      type="text"
                      value={updateForm.diagnosis}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, diagnosis: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Prescription</label>
                    <input
                      type="text"
                      value={updateForm.prescription}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, prescription: e.target.value })
                      }
                      className="input-field"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAppt(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Patient history modal */}
      {selectedPatient && (
        <PatientHistoryModal
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          onClose={() => setSelectedPatient(null)}
          onReportSaved={() =>
            setMessage({ type: 'success', text: 'Report saved. Patient can view it on their dashboard.' })
          }
        />
      )}
    </Layout>
  );
};

export default DoctorDashboard;
