import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ClipboardList, Mail, Calendar, HelpCircle, CheckCircle2, Clock } from 'lucide-react';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyClaims = async () => {
    setLoading(true);
    try {
      const res = await api.get('/claims/my/requests');
      setClaims(res.data.data);
    } catch (err) {
      console.error('Error fetching sent claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClaims();
  }, []);

  return (
    <div className="w-full px-4 py-8 md:px-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white flex items-center space-x-2">
          <ClipboardList size={28} className="text-primary-650" />
          <span>My Claim Requests</span>
        </h1>
        <p className="text-slate-550 dark:text-slate-400">
          Track the verification status of claims you submitted for lost campus items
        </p>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : claims.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-205 bg-white p-12 text-center text-sm text-slate-450 dark:border-slate-800 dark:bg-slate-850/20">
          You have not submitted any claims for items.
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => {
            const item = claim.itemId;
            const itemImage = item?.imageUrl
              ? item.imageUrl.startsWith('/uploads/')
                ? `http://localhost:5000${item.imageUrl}`
                : item.imageUrl
              : 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=200&auto=format&fit=crop&q=60';

            return (
              <div
                key={claim._id}
                className="flex flex-col sm:flex-row gap-5 items-start bg-white rounded-2xl border border-slate-200 p-5 shadow-sm dark:border-slate-850 dark:bg-slate-850"
              >
                {/* Item Thumbnail */}
                <div className="h-24 w-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <img src={itemImage} alt={item?.title} className="h-full w-full object-cover" />
                </div>

                {/* Claim details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-850 dark:text-white">
                      {item?.title || 'Unknown Item'}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        claim.status === 'Pending'
                          ? 'bg-amber-100 text-amber-850 dark:bg-amber-950/30'
                          : claim.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-850 dark:bg-emerald-950/30'
                          : 'bg-rose-100 text-rose-850 dark:bg-rose-950/30'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Calendar size={13} />
                      <span>Submitted on {new Date(claim.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <HelpCircle size={13} />
                      <span>Category: {item?.category}</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Your Answer:</span>
                    <p className="text-slate-700 dark:text-slate-200">"{claim.answer}"</p>
                  </div>

                  {/* Contact Info (Only if Approved) */}
                  {claim.status === 'Approved' && item?.postedBy && (
                    <div className="rounded-xl bg-emerald-50/50 border border-emerald-250 p-4 dark:bg-emerald-950/20 dark:border-emerald-900/50 flex items-start space-x-3">
                      <CheckCircle2 className="text-emerald-600 dark:text-emerald-450 mt-0.5 flex-shrink-0" size={18} />
                      <div>
                        <h4 className="text-sm font-bold text-emerald-850 dark:text-emerald-450">Claim Request Approved!</h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-1">
                          You can now contact the founder to coordinate the safe handover of your item.
                        </p>
                        <div className="flex items-center space-x-1.5 mt-2.5 text-xs font-semibold text-emerald-850 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-950 px-2.5 py-1.5 rounded-lg w-max">
                          <Mail size={13} />
                          <span>Founder Email: {item.postedBy.email} ({item.postedBy.name})</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Claims;
