/**
 * Login Page
 * Role-based login for patient, doctor, and admin
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'patient',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password, formData.role);
      const paths = { patient: '/patient', doctor: '/doctor', admin: '/admin' };
      navigate(paths[user.role]);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="card">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-100">Login to Carepluse</h2>

          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Login As</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder={
                  formData.role === 'admin'
                    ? 'admin@carepluse.com'
                    : 'your@email.com'
                }
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            {formData.role === 'admin' && (
              <p className="text-xs text-slate-400 bg-dark-surface border border-dark-border p-2 rounded">
                Default admin: admin@carepluse.com / admin123
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="link-accent">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
