/**
 * Status Badge Component
 * Displays appointment status with color coding (dark theme)
 */

const statusColors = {
  Pending: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50',
  Confirmed: 'bg-blue-900/50 text-blue-300 border border-blue-700/50',
  Completed: 'bg-green-900/50 text-green-300 border border-green-700/50',
  Cancelled: 'bg-red-900/50 text-red-300 border border-red-700/50',
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status] || 'bg-slate-800 text-slate-300 border border-slate-600'
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
