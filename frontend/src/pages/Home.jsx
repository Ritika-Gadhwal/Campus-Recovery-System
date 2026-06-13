import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Search, MapPin, Shield, RefreshCw } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ lost: 3, found: 3, resolved: 0 });

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        const res = await api.get('/items');
        const items = res.data.data;
        const lost = items.filter(i => i.itemType === 'Lost' && i.status !== 'Resolved').length;
        const found = items.filter(i => i.itemType === 'Found' && i.status !== 'Resolved' && i.status !== 'Claimed').length;
        const resolved = items.filter(i => i.status === 'Resolved' || i.status === 'Claimed').length;
        setStats({ lost, found, resolved });
      } catch (err) {
        console.error('Failed to get public stats:', err);
      }
    };
    fetchGlobalStats();
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl dark:bg-primary-950/20"></div>
      <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-secondary-200/30 blur-3xl dark:bg-secondary-950/10"></div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-850 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Lost Something on Campus?</span>
            <span className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-secondary-400">
              Recover It Instantly.
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-slate-500 dark:text-slate-400 sm:text-lg md:mt-5 md:max-w-2xl md:text-xl">
            The central college platform to report lost belongings, return found items, and securely claim matching objects with automated verification.
          </p>

          <div className="mx-auto mt-8 flex max-w-sm justify-center space-x-4">
            {user ? (
              <Link
                to="/dashboard"
                className="flex w-full items-center justify-center rounded-xl bg-primary-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-750 transition-all hover:shadow-xl dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="flex w-1/2 items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 hover:bg-primary-750 transition-all dark:bg-primary-500 dark:hover:bg-primary-600"
                >
                  Join Portal
                </Link>
                <Link
                  to="/login"
                  className="flex w-1/2 items-center justify-center rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-750 hover:bg-slate-50 transition-all dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-750"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Stats Cards */}
        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-850/50">
            <span className="text-4xl font-extrabold text-rose-500">{stats.lost}</span>
            <span className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Active Lost Reports</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-850/50">
            <span className="text-4xl font-extrabold text-amber-500">{stats.found}</span>
            <span className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Active Found Reports</span>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-850/50">
            <span className="text-4xl font-extrabold text-emerald-500">{stats.resolved}</span>
            <span className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Items Returned</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-850 dark:text-white sm:text-3xl">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-950 dark:text-primary-400">
                <Search size={24} />
              </div>
              <h3 className="mt-6 text-lg font-bold">1. Report Items</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Post lost details or report a found item on campus including descriptions, categories, and photos.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-100 text-secondary-600 dark:bg-secondary-950 dark:text-secondary-400">
                <RefreshCw size={24} />
              </div>
              <h3 className="mt-6 text-lg font-bold">2. AI Suggestions</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                The portal cross-references titles, locations, and descriptions to recommend closest matches in real time.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Shield size={24} />
              </div>
              <h3 className="mt-6 text-lg font-bold">3. Answer Security Quiz</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Claimants answer the security question configured by the reporter to verify authenticity.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                <MapPin size={24} />
              </div>
              <h3 className="mt-6 text-lg font-bold">4. Recover Safely</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Once approved, students arrange a meet-up on campus to complete recovery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
