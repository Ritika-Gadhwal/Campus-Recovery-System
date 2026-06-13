import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { User, ShieldAlert, Award, FileText, CheckSquare, Sun, Moon } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  
  const [stats, setStats] = useState({ posts: 0, claims: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const postsRes = await api.get('/items/my/all');
        const claimsRes = await api.get('/claims/my/requests');
        setStats({
          posts: postsRes.data.count,
          claims: claimsRes.data.count
        });
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="w-full px-4 py-8 md:px-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850">
        
        {/* User Card */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 text-3xl font-extrabold text-white shadow-md mb-4">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-slate-850 dark:text-white">{user?.name}</h1>
          <p className="text-sm text-slate-450 mt-1">{user?.email}</p>
          
          <div className="mt-3.5 flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300">
            {user?.role === 'admin' ? (
              <>
                <ShieldAlert size={12} />
                <span>Administrator</span>
              </>
            ) : (
              <>
                <User size={12} />
                <span>Student / Faculty</span>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 py-6">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800 text-center flex flex-col items-center">
            <FileText size={20} className="text-primary-500 mb-1" />
            {loading ? (
              <span className="h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700"></span>
            ) : (
              <span className="text-2xl font-extrabold">{stats.posts}</span>
            )}
            <span className="text-xs text-slate-450 font-semibold mt-1">My Item Posts</span>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800 text-center flex flex-col items-center">
            <CheckSquare size={20} className="text-secondary-500 mb-1" />
            {loading ? (
              <span className="h-6 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700"></span>
            ) : (
              <span className="text-2xl font-extrabold">{stats.claims}</span>
            )}
            <span className="text-xs text-slate-450 font-semibold mt-1">Claims Submitted</span>
          </div>
        </div>

        {/* Settings options */}
        <div className="border-t border-slate-100 pt-6 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Preferences</h3>
          
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
            <div className="flex items-center space-x-3">
              {darkMode ? <Moon size={20} className="text-secondary-400" /> : <Sun size={20} className="text-primary-650" />}
              <div>
                <p className="text-sm font-bold">Portal Theme Mode</p>
                <p className="text-xs text-slate-450">Currently in {darkMode ? 'Dark' : 'Light'} Mode</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold transition-all hover:bg-slate-200 dark:hover:bg-slate-750"
            >
              Toggle Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
