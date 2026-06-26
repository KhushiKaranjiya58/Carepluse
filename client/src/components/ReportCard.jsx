/**
 * Report Card Component
 * Displays a medical report with download option for patients
 */

import { downloadReportPdf } from '../utils/downloadReportPdf';

const ReportCard = ({ report }) => {
  const handleDownload = () => {
    downloadReportPdf(report);
  };

  const reportDate = report.reportDate
    ? new Date(report.reportDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="card">
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-3 flex-1 min-w-0">
          {report.doctor?.profilePhoto && (
            <img
              src={report.doctor.profilePhoto}
              alt={report.doctor.name}
              className="w-12 h-12 rounded-full object-cover border border-dark-border shrink-0"
            />
          )}
          <div className="min-w-0">
            <h4 className="font-semibold text-slate-100 truncate">{report.title}</h4>
            <p className="text-sm text-slate-400 mt-0.5">{reportDate}</p>
            <p className="text-sm text-primary-400 mt-1">
              Dr. {report.doctor?.name}
              {report.doctor?.specialization && ` · ${report.doctor.specialization}`}
            </p>
          </div>
        </div>
        <button onClick={handleDownload} className="btn-primary text-sm shrink-0">
          ↓ Download PDF
        </button>
      </div>

      {report.description && (
        <p className="text-sm text-slate-400 mt-3 line-clamp-2">{report.description}</p>
      )}

      <div className="flex flex-wrap gap-3 mt-3 text-xs">
        {report.diagnosis && (
          <span className="bg-dark-surface border border-dark-border text-slate-300 px-2 py-1 rounded">
            Diagnosis: {report.diagnosis}
          </span>
        )}
        {report.prescription && (
          <span className="bg-dark-surface border border-dark-border text-slate-300 px-2 py-1 rounded">
            Rx: {report.prescription}
          </span>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
