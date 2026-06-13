import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import { User, CheckCircle, XCircle, Clock, Trash2, Edit, ListFilter, ShieldCheck } from 'lucide-react';

const MyItems = () => {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'incoming-claims'
  const [myPosts, setMyPosts] = useState([]);
  const [incomingClaims, setIncomingClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'posts') {
        const res = await api.get('/items/my/all');
        setMyPosts(res.data.data);
      } else {
        const res = await api.get('/claims/incoming');
        setIncomingClaims(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching personal items/claims data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleClaimStatusChange = async (claimId, newStatus) => {
    if (!window.confirm(`Are you sure you want to set this claim to ${newStatus}?`)) return;
    try {
      await api.put(`/claims/${claimId}/status`, { status: newStatus });
      fetchData(); // reload
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update claim status.');
    }
  };

  const handleMarkResolved = async (itemId, currentStatus) => {
    const nextStatus = currentStatus === 'Resolved' ? 'Lost' : 'Resolved'; // simple toggle
    try {
      await api.put(`/items/${itemId}`, { status: nextStatus });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to update item status.');
    }
  };

  const handleDeletePost = async (itemId) => {
    if (!window.confirm('Delete this item post?')) return;
    try {
      await api.delete(`/items/${itemId}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete post.');
    }
  };

  return (
    <div className="w-full px-4 py-8 md:px-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white">
          My Items Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your reported items and process incoming claim requests
        </p>
      </div>

      {/* Tabs Switch */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'posts'
              ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          My Posted Items
        </button>
        <button
          onClick={() => setActiveTab('incoming-claims')}
          className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'incoming-claims'
              ? 'border-primary-500 text-primary-600 dark:border-primary-400 dark:text-primary-300'
              : 'border-transparent text-slate-400 hover:text-slate-650'
          }`}
        >
          Incoming Claim Verification Requests
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : activeTab === 'posts' ? (
        // Tab 1: My Posted Items
        myPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-850/20">
            You have not posted any lost or found items yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myPosts.map((item) => (
              <div key={item._id} className="relative group">
                <ItemCard item={item} />
                
                {/* Admin/Poster Controls Overlay */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 dark:bg-slate-900/95 p-1 rounded-xl shadow-md">
                  <button
                    onClick={() => handleMarkResolved(item._id, item.status)}
                    title={item.status === 'Resolved' ? 'Mark Unresolved' : 'Mark as Resolved'}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePost(item._id)}
                    title="Delete Post"
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-rose-600 dark:text-rose-450"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Tab 2: Incoming Claims
        incomingClaims.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-850/20">
            No claim requests submitted on your items yet.
          </div>
        ) : (
          <div className="space-y-4">
            {incomingClaims.map((claim) => (
              <div
                key={claim._id}
                className="flex flex-col md:flex-row gap-5 items-start justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-850 dark:bg-slate-850"
              >
                {/* Claimant Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-2.5">
                    <span className="rounded-full bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300 text-xs font-semibold px-2 py-0.5 uppercase tracking-wider">
                      Item: {claim.itemId?.title}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        claim.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30'
                          : claim.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/30'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                      <User size={13} />
                      <span>Claimant Student Details</span>
                    </div>
                    <p className="text-sm font-bold">{claim.claimantId?.name}</p>
                    <p className="text-xs text-slate-450">{claim.claimantId?.email}</p>
                  </div>

                  {/* Claims Answer Section */}
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800 border-l-4 border-primary-500">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Claim Answer submitted</p>
                    <p className="text-sm font-semibold text-slate-750 dark:text-slate-200 mt-1">
                      "{claim.answer}"
                    </p>
                  </div>
                </div>

                {/* Claim verification actions */}
                {claim.status === 'Pending' && (
                  <div className="flex sm:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button
                      onClick={() => handleClaimStatusChange(claim._id, 'Approved')}
                      className="flex-1 flex items-center justify-center space-x-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm"
                    >
                      <CheckCircle size={14} />
                      <span>Approve Claim</span>
                    </button>
                    <button
                      onClick={() => handleClaimStatusChange(claim._id, 'Rejected')}
                      className="flex-1 flex items-center justify-center space-x-1 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2.5 text-xs font-bold"
                    >
                      <XCircle size={14} />
                      <span>Reject Claim</span>
                    </button>
                  </div>
                )}

                {claim.status !== 'Pending' && (
                  <div className="flex items-center space-x-1 text-slate-400 text-xs font-semibold py-2">
                    <Clock size={14} />
                    <span>Processed as {claim.status}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default MyItems;
