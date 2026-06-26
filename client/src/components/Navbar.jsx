/**
 * Navbar Component
 * Navigation bar with role-based links and logout
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = {
    patient: '/patient',
    doctor: '/doctor',
    admin: '/admin',
  };

  return (
    <nav className="bg-dark-surface shadow-lg border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C+</span>
            </div>
            <span className="text-xl font-bold text-primary-400">Carepluse</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to={dashboardPath[user.role] || '/'}
                  className="text-slate-300 hover:text-primary-400 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                {user.role === 'doctor' && (
                  <Link
                    to="/doctor/profile"
                    className="text-slate-300 hover:text-primary-400 font-medium transition-colors"
                  >
                    Profile
                  </Link>
                )}
                <span className="text-sm text-slate-400">
                  {user.name}{' '}
                  <span className="capitalize bg-primary-900/50 text-primary-300 border border-primary-700/50 px-2 py-0.5 rounded-full text-xs">
                    {user.role}
                  </span>
                </span>
                <button onClick={handleLogout} className="btn-secondary text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-primary-400 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
