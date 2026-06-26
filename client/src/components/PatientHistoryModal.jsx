/**
 * Patient History Modal
 * Doctor views patient appointment history, reports, and manages reports
 */

import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatusBadge from './StatusBadge';

const EMPTY_REPORT_FORM = {
  title: '',
  diagnosis: '',
  prescription: '',
  notes: '',
  reportDate: new Date().toISOString().split('T')[0],
};

const PatientHistoryModal = ({ patientId, patientName, onClose, onReportSaved }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeSection, setActiveSection] = useState('appointments');
  const [showReportForm, setShowReportForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [reportForm, setReportForm] = useState(EMPTY_REPORT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/doctor/patients/${patientId}/history`);
      setHistory(res.data.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load patient history.' });
    } finally {
      setLoading(false);
    }
  };

  const openCreateReport = () => {
    setEditingReport(null);
    setReportForm(EMPTY_REPORT_FORM);
    setShowReportForm(true);
    setActiveSection('reports');
  };

  const openEditReport = (report) => {
    setEditingReport(report);
    setReportForm({
      title: report.title || '',
      diagnosis: report.diagnosis || '',
      prescription: report.prescription || '',
      notes: report.notes || '',
      reportDate: report.reportDate
        ? new Date(report.reportDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    });
    setShowReportForm(true);
    setActiveSection('reports');
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (editingReport) {
        await API.put(`/reports/${editingReport._id}`, reportForm);
        setMessage({ type: 'success', text: 'Report updated successfully!' });
      } else {
        await API.post('/reports', { patientId, ...reportForm });
        setMessage({ type: 'success', text: 'Report created successfully!' });
      }

      setShowReportForm(false);
      setEditingReport(null);
      setReportForm(EMPTY_REPORT_FORM);
      await fetchHistory();
      onReportSaved?.();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save report.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-dark-card border border-dark-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-dark-border">
          <div>
            <h3 className="font-semibold text-lg text-slate-100">Patient History</h3>
            <p className="text-slate-400 text-sm">{patientName || history?.patient?.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {message.text && (
            <div
              className={`mb-4 ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}
            >
              {message.text}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {/* Patient info */}
              {history?.patient && (
                <div className="card mb-4 !p-4">
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <p className="text-slate-300">
                      <span className="text-slate-500">Email:</span> {history.patient.email}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-500">Phone:</span>{' '}
                      {history.patient.phone || 'N/A'}
                    </p>
                    {history.patient.gender && (
                      <p className="text-slate-300">
                        <span className="text-slate-500">Gender:</span> {history.patient.gender}
                      </p>
                    )}
                    {history.patient.dateOfBirth && (
                      <p className="text-slate-300">
                        <span className="text-slate-500">DOB:</span>{' '}
                        {new Date(history.patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Section tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveSection('appointments')}
                  className={activeSection === 'appointments' ? 'tab-btn-active' : 'tab-btn-inactive'}
                >
                  Appointments ({history?.appointments?.length || 0})
                </button>
                <button
                  onClick={() => setActiveSection('reports')}
                  className={activeSection === 'reports' ? 'tab-btn-active' : 'tab-btn-inactive'}
                >
                  Reports ({history?.reports?.length || 0})
                </button>
                <button onClick={openCreateReport} className="btn-primary text-sm ml-auto">
                  + New Report
                </button>
              </div>

              {/* Report form */}
              {showReportForm && (
                <div className="card mb-4 border-primary-500/30">
                  <h4 className="font-medium text-slate-100 mb-3">
                    {editingReport ? 'Edit Report' : 'Create New Report'}
                  </h4>
                  <form onSubmit={handleReportSubmit} className="space-y-3">
                    <div>
                      <label className="label">Report Title *</label>
                      <input
                        type="text"
                        value={reportForm.title}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, title: e.target.value })
                        }
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Diagnosis *</label>
                      <input
                        type="text"
                        value={reportForm.diagnosis}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, diagnosis: e.target.value })
                        }
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Prescription</label>
                      <input
                        type="text"
                        value={reportForm.prescription}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, prescription: e.target.value })
                        }
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">Notes</label>
                      <textarea
                        value={reportForm.notes}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, notes: e.target.value })
                        }
                        className="input-field"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="label">Date *</label>
                      <input
                        type="date"
                        value={reportForm.reportDate}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, reportDate: e.target.value })
                        }
                        className="input-field"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="btn-primary">
                        {saving ? 'Saving...' : editingReport ? 'Update Report' : 'Create Report'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReportForm(false);
                          setEditingReport(null);
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Appointments history */}
              {activeSection === 'appointments' && (
                <div className="space-y-3">
                  {history?.appointments?.length === 0 ? (
                    <p className="text-muted">No appointments with this patient.</p>
                  ) : (
                    history.appointments.map((appt) => (
                      <div key={appt._id} className="card !p-4">
                        <div className="flex justify-between items-start">
                          <p className="text-slate-200 font-medium">
                            {new Date(appt.date).toLocaleDateString()} at {appt.time}
                          </p>
                          <StatusBadge status={appt.status} />
                        </div>
                        <p className="text-sm text-slate-400 mt-1">
                          <span className="text-slate-500">Reason:</span> {appt.reason}
                        </p>
                        {appt.notes && (
                          <p className="text-sm text-slate-500 mt-1">{appt.notes}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Reports list */}
              {activeSection === 'reports' && (
                <div className="space-y-3">
                  {history?.reports?.length === 0 ? (
                    <p className="text-muted">No reports created for this patient yet.</p>
                  ) : (
                    history.reports.map((report) => (
                      <div key={report._id} className="card !p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h5 className="font-medium text-slate-100">{report.title}</h5>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {new Date(report.reportDate).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => openEditReport(report)}
                            className="text-primary-400 hover:text-primary-300 text-sm"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-sm text-slate-400 mt-2">
                          <span className="text-slate-500">Diagnosis:</span> {report.diagnosis}
                        </p>
                        {report.prescription && (
                          <p className="text-sm text-slate-400">
                            <span className="text-slate-500">Prescription:</span>{' '}
                            {report.prescription}
                          </p>
                        )}
                        {report.notes && (
                          <p className="text-sm text-slate-500 mt-1">{report.notes}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryModal;
