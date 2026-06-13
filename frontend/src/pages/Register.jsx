import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, AlertCircle, Info } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Pre-validation check for university domain on frontend
    const allowed = ['edu', 'college.edu', 'university.edu', 'student.edu', 'mit.edu', 'stanford.edu', 'mycollege.edu'];
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    
    if (!emailDomain) {
      setErrorMsg('Invalid email format');
      setLoading(false);
      return;
    }

    const isValid = allowed.some(domain => emailDomain === domain || emailDomain.endsWith('.' + domain));
    if (!isValid) {
      setErrorMsg('Registration is restricted to official college email domains only (e.g. .edu, @mycollege.edu)');
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-900 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-850">
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Sign up to report and recover campus items
          </p>
        </div>

        {/* Official email domains notice */}
        <div className="flex items-start space-x-2 rounded-xl bg-amber-50/50 p-3 text-xs font-semibold text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span>Notice: Only registered university emails (e.g. name@mycollege.edu or any .edu domain) are accepted.</span>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none ring-primary-500/20 focus:border-primary-500 focus:bg-white focus:ring-4 dark:border-slate-850 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                College Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@mycollege.edu"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none ring-primary-500/20 focus:border-primary-500 focus:bg-white focus:ring-4 dark:border-slate-850 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none ring-primary-500/20 focus:border-primary-500 focus:bg-white focus:ring-4 dark:border-slate-850 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none ring-primary-500/20 focus:border-primary-500 focus:bg-white focus:ring-4 dark:border-slate-850 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
              >
                <option value="student">Student / Faculty Member</option>
                <option value="admin">Administrator (Requires verification)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md shadow-primary-500/10 hover:bg-primary-750 transition-all focus:outline-none dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm mt-4">
          <span className="text-slate-400">Already have an account? </span>
          <Link to="/login" className="font-semibold text-primary-500 hover:underline dark:text-primary-400">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
