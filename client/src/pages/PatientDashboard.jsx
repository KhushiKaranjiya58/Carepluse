/**
 * Patient Dashboard
 * Book appointments with doctor profiles, view appointments and medical records
 */

import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import DoctorCard from '../components/DoctorCard';
import ReportCard from '../components/ReportCard';
import FavouriteStar from '../components/FavouriteStar';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [reports, setReports] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [favouriteDoctors, setFavouriteDoctors] = useState([]);
  const [favouriteIds, setFavouriteIds] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showBookForm, setShowBookForm] = useState(false);
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookForm, setBookForm] = useState({
    date: '',
    time: '',
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchDoctors = useCallback(async () => {
    setDoctorsLoading(true);
    try {
      const params = {};
      if (specializationFilter) params.specialization = specializationFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await API.get('/patient/doctors', { params });
      setDoctors(res.data.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load doctors.' });
    } finally {
      setDoctorsLoading(false);
    }
  }, [specializationFilter, searchQuery]);

  useEffect(() => {
    if (showBookForm) {
      fetchDoctors();
    }
  }, [showBookForm, fetchDoctors]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, recordsRes, reportsRes, specRes, favRes] = await Promise.all([
        API.get('/patient/appointments'),
        API.get('/patient/records'),
        API.get('/patient/reports'),
        API.get('/patient/specializations'),
        API.get('/patient/favourites'),
      ]);
      setAppointments(apptRes.data.data || []);
      setRecords(recordsRes.data.data || []);
      setReports(reportsRes.data.data || []);
      setSpecializations(specRes.data.data || []);
      setFavouriteDoctors(favRes.data.data || []);
      setFavouriteIds(favRes.data.favouriteIds || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load data.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setMessage({ type: 'error', text: 'Please select a doctor first.' });
      return;
    }

    try {
      await API.post('/patient/appointments', {
        doctorId: selectedDoctor._id,
        ...bookForm,
      });
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      setShowBookForm(false);
      setSelectedDoctor(null);
      setBookForm({ date: '', time: '', reason: '' });
      setSpecializationFilter('');
      setSearchQuery('');
      fetchData();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to book appointment.',
      });
    }
  };

  const openBookForm = () => {
    setShowBookForm(true);
    setSelectedDoctor(null);
    setBookForm({ date: '', time: '', reason: '' });
  };

  const closeBookForm = () => {
    setShowBookForm(false);
    setSelectedDoctor(null);
    setSpecializationFilter('');
    setSearchQuery('');
  };

  const isDoctorFavourite = (doctorId) =>
    favouriteIds.includes(doctorId?.toString?.() || doctorId);

  const handleToggleFavourite = async (doctor) => {
    const doctorId = doctor._id;
    const isFav = isDoctorFavourite(doctorId);

    try {
      if (isFav) {
        const res = await API.delete('/patient/favourites/remove', {
          data: { doctorId },
        });
        setFavouriteIds(res.data.favouriteIds || []);
        setFavouriteDoctors((prev) => prev.filter((d) => d._id !== doctorId));
        setMessage({ type: 'success', text: 'Doctor removed from favourites.' });
      } else {
        const res = await API.post('/patient/favourites/add', { doctorId });
        setFavouriteIds(res.data.favouriteIds || []);
        setFavouriteDoctors((prev) => {
          if (prev.some((d) => d._id === doctorId)) return prev;
          return [...prev, res.data.data || doctor];
        });
        setMessage({ type: 'success', text: 'Doctor added to favourites!' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update favourites.',
      });
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'Pending' || a.status === 'Confirmed'
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'Completed' || a.status === 'Cancelled'
  );

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Patient Dashboard</h1>
        <button onClick={showBookForm ? closeBookForm : openBookForm} className="btn-primary">
          {showBookForm ? 'Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      {showBookForm && (
        <div className="card mb-6">
          <h3 className="font-semibold text-lg mb-4 text-slate-100">Book New Appointment</h3>

          {/* Filter and search */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Filter by Specialization</label>
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Search Doctors</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                placeholder="Search by name or specialization..."
              />
            </div>
          </div>

          {/* Doctor list */}
          <div className="mb-6">
            <label className="label">Select a Doctor *</label>
            {doctorsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : doctors.length === 0 ? (
              <p className="text-muted py-4">No doctors found matching your criteria.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
                {doctors.map((doc) => (
                  <DoctorCard
                    key={doc._id}
                    doctor={doc}
                    selected={selectedDoctor?._id === doc._id}
                    onSelect={setSelectedDoctor}
                    isFavourite={isDoctorFavourite(doc._id)}
                    onToggleFavourite={handleToggleFavourite}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Appointment details form */}
          <form onSubmit={handleBookSubmit} className="grid md:grid-cols-2 gap-4 border-t border-dark-border pt-4">
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                value={bookForm.date}
                onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <label className="label">Time *</label>
              <input
                type="time"
                value={bookForm.time}
                onChange={(e) => setBookForm({ ...bookForm, time: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Reason for Visit *</label>
              <input
                type="text"
                value={bookForm.reason}
                onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
                className="input-field"
                placeholder="Describe your symptoms or reason for visit"
                required
              />
            </div>
            {selectedDoctor && (
              <div className="md:col-span-2 bg-dark-surface border border-dark-border rounded-lg p-3 text-sm">
                <p className="text-slate-300">
                  Booking with: <span className="text-primary-400 font-medium">{selectedDoctor.name}</span>
                  {' '}({selectedDoctor.specialization}) — Fee: ${selectedDoctor.consultationFee}
                </p>
              </div>
            )}
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary" disabled={!selectedDoctor}>
                Book Appointment
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('appointments')}
          className={activeTab === 'appointments' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          Appointments
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={activeTab === 'records' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          Medical Records
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={activeTab === 'reports' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          Reports
        </button>
        <button
          onClick={() => setActiveTab('favourites')}
          className={activeTab === 'favourites' ? 'tab-btn-active' : 'tab-btn-inactive'}
        >
          Favourites
        </button>
      </div>

      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <section>
            <h3 className="font-semibold text-lg mb-3 text-slate-100">Upcoming Appointments</h3>
            {upcomingAppointments.length === 0 ? (
              <p className="text-muted">No upcoming appointments.</p>
            ) : (
              <div className="grid gap-4">
                {upcomingAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appointment={appt}
                    isFavourite={isDoctorFavourite(appt.doctor?._id)}
                    onToggleFavourite={handleToggleFavourite}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="font-semibold text-lg mb-3 text-slate-100">Past Appointments</h3>
            {pastAppointments.length === 0 ? (
              <p className="text-muted">No past appointments.</p>
            ) : (
              <div className="grid gap-4">
                {pastAppointments.map((appt) => (
                  <AppointmentCard
                    key={appt._id}
                    appointment={appt}
                    isFavourite={isDoctorFavourite(appt.doctor?._id)}
                    onToggleFavourite={handleToggleFavourite}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'records' && (
        <div>
          {records.length === 0 ? (
            <p className="text-muted">No medical records found.</p>
          ) : (
            <div className="grid gap-4">
              {records.map((record) => (
                <div key={record._id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-100">{record.diagnosis}</h4>
                    <span className="text-sm text-slate-400">
                      {new Date(record.visitDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-1">
                    Doctor: Dr. {record.doctor?.name} ({record.doctor?.specialization})
                  </p>
                  {record.prescription && (
                    <p className="text-sm text-slate-300">
                      <span className="font-medium text-slate-200">Prescription:</span>{' '}
                      {record.prescription}
                    </p>
                  )}
                  {record.notes && (
                    <p className="text-sm text-slate-500 mt-1">{record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <h3 className="font-semibold text-lg mb-3 text-slate-100">My Medical Reports</h3>
          <p className="text-slate-400 text-sm mb-4">
            Reports uploaded by your doctors. Click Download to save as PDF.
          </p>
          {reports.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-muted">No reports available yet.</p>
              <p className="text-slate-500 text-sm mt-1">
                Reports will appear here after your doctor creates them.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <ReportCard key={report._id} report={report} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favourites' && (
        <div>
          <h3 className="font-semibold text-lg mb-3 text-slate-100">My Favourite Doctors</h3>
          <p className="text-slate-400 text-sm mb-4">
            Doctors you have starred. Tap the star to remove from favourites.
          </p>
          {favouriteDoctors.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-4xl mb-3">⭐</p>
              <p className="text-muted">No favourite doctors yet.</p>
              <p className="text-slate-500 text-sm mt-1">
                Star doctors when booking or from your appointments to save them here.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {favouriteDoctors.map((doc) => (
                <DoctorCard
                  key={doc._id}
                  doctor={doc}
                  selected={false}
                  onSelect={() => {
                    setSelectedDoctor(doc);
                    setShowBookForm(true);
                  }}
                  isFavourite={true}
                  onToggleFavourite={handleToggleFavourite}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

const AppointmentCard = ({ appointment, isFavourite, onToggleFavourite }) => (
  <div className="card">
    <div className="flex justify-between items-start gap-4">
      <div className="flex gap-3 flex-1 min-w-0">
        {appointment.doctor?.profilePhoto && (
          <img
            src={appointment.doctor.profilePhoto}
            alt={appointment.doctor.name}
            className="w-12 h-12 rounded-full object-cover border border-dark-border shrink-0"
          />
        )}
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-100">Dr. {appointment.doctor?.name}</h4>
          <p className="text-sm text-slate-400">{appointment.doctor?.specialization}</p>
          {appointment.doctor?.consultationFee && (
            <p className="text-xs text-green-400 mt-0.5">Fee: ${appointment.doctor.consultationFee}</p>
          )}
        </div>
      </div>
      <div className="flex items-start gap-2 shrink-0">
        {appointment.doctor && onToggleFavourite && (
          <FavouriteStar
            isFavourite={isFavourite}
            onToggle={() => onToggleFavourite(appointment.doctor)}
            size="sm"
          />
        )}
        <StatusBadge status={appointment.status} />
      </div>
    </div>
    <div className="mt-3 text-sm text-slate-400 space-y-1">
      <p>
        <span className="font-medium text-slate-300">Date:</span>{' '}
        {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
      </p>
      <p>
        <span className="font-medium text-slate-300">Reason:</span> {appointment.reason}
      </p>
    </div>
  </div>
);

export default PatientDashboard;
