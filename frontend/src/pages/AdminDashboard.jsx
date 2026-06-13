import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ShieldAlert, Users, FileText, ClipboardCheck, Trash2, ArrowUpRight, Award, ToggleLeft } from 'lucide-react';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' or 'users'

  const fetchData = async () => {
    setLoading(true);
    try {
      const analyticsRes = await api.get('/admin/analytics');
      setAnalytics(analyticsRes.data.data);

      const usersRes = await api.get('/admin/users');
      setUsersList(usersRes.data.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleToggle = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'student' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) return;
    try {
      await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      fetchData(); // reload
    } catch (err) {
      console.error(err);
      alert('Failed to change user role.');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Delete this user? This will remove all their items and claims.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchData(); // reload
    } catch (err) {
      console.error(err);
      alert('Failed to delete user.');
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 md:px-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white flex items-center space-x-2">
            <ShieldAlert className="text-amber-500" size={30} />
            <span>Admin Console</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monitor portal operations, manage student directories, and view aggregate statistics
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'metrics'
              ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          System Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Student Registry ({usersList.length})
        </button>
      </div>

      {activeTab === 'metrics' ? (
        // Tab 1: Analytics/Metrics
        <div className="space-y-8">
          {/* Main Counters */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850 flex items-center space-x-4">
              <div className="rounded-xl p-3 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Registered</p>
                <p className="text-2xl font-extrabold mt-0.5">{analytics?.users?.total}</p>
              </div>
            </div>
            
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850 flex items-center space-x-4">
              <div className="rounded-xl p-3 bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-450">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Bulletins</p>
                <p className="text-2xl font-extrabold mt-0.5">{analytics?.items?.total}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850 flex items-center space-x-4">
              <div className="rounded-xl p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-450">
                <ClipboardCheck size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Claims Filed</p>
                <p className="text-2xl font-extrabold mt-0.5">{analytics?.claims?.total}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Items Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850">
              <h2 className="text-lg font-bold mb-4">Item Status Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-500">Unresolved Lost Posts</span>
                  <span className="text-rose-500">{analytics?.items?.status?.lost}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-500">Unclaimed Found Posts</span>
                  <span className="text-amber-500">{analytics?.items?.status?.found}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-500">Active Claim Verifications</span>
                  <span className="text-emerald-500">{analytics?.items?.status?.claimed}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-slate-500">Resolved Items</span>
                  <span className="text-blue-500">{analytics?.items?.status?.resolved}</span>
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850">
              <h2 className="text-lg font-bold mb-4">Category Distribution</h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {analytics?.categoryDistribution?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No categories posted yet</p>
                ) : (
                  analytics?.categoryDistribution?.map((cat) => (
                    <div key={cat._id} className="flex justify-between items-center text-sm">
                      <span className="font-semibold">{cat._id}</span>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold">
                        {cat.count} posts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Tab 2: User manager
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-850 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.map((userObj) => (
                  <tr key={userObj._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-bold">{userObj.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{userObj.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          userObj.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {userObj.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(userObj.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-2">
                      <button
                        onClick={() => handleRoleToggle(userObj._id, userObj.role)}
                        title="Toggle Role"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-amber-600"
                      >
                        <ToggleLeft size={18} />
                      </button>
                      <button
                        onClick={() => handleUserDelete(userObj._id)}
                        title="Delete User"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
