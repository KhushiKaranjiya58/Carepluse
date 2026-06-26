/**
 * Home Page
 * Landing page with role-based redirect for logged-in users
 */

import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Home = () => {
  const { user } = useAuth();

  const dashboardPaths = {
    patient: '/patient',
    doctor: '/doctor',
    admin: '/admin',
  };

  // Redirect logged-in users to their dashboard (only with a valid role)
  if (user?.role && dashboardPaths[user.role]) {
    return <Navigate to={dashboardPaths[user.role]} replace />;
  }

  return (
    <Layout>
      <div className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
          Welcome to <span className="text-primary-400">Carepluse</span>
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          Your complete healthcare management platform. Book appointments, manage
          medical records, and connect with doctors seamlessly.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary text-lg px-8 py-3">
            Login
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="card text-left hover:border-primary-600/50 transition-colors">
            <div className="text-3xl mb-3">🏥</div>
            <h3 className="font-semibold text-lg mb-2 text-slate-100">For Patients</h3>
            <p className="text-slate-400 text-sm">
              Register, book appointments with doctors, and view your medical history.
            </p>
          </div>
          <div className="card text-left hover:border-primary-600/50 transition-colors">
            <div className="text-3xl mb-3">👨‍⚕️</div>
            <h3 className="font-semibold text-lg mb-2 text-slate-100">For Doctors</h3>
            <p className="text-slate-400 text-sm">
              View assigned appointments, update status, and access patient details.
            </p>
          </div>
          <div className="card text-left hover:border-primary-600/50 transition-colors">
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-semibold text-lg mb-2 text-slate-100">For Admins</h3>
            <p className="text-slate-400 text-sm">
              Manage doctors, patients, appointments, and view system statistics.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
