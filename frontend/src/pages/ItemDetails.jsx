import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Calendar, Tag, ShieldCheck, User, Trash2, ArrowLeft, AlertTriangle } from 'lucide-react';

const ItemDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Claim state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimAnswer, setClaimAnswer] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimError, setClaimError] = useState('');

  const fetchItemData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch item details
      const res = await api.get(`/items/${id}`);
      setItem(res.data.data);
      if (res.data.qrCode) {
        setQrCode(res.data.qrCode);
      }

      // Fetch AI matching suggestions
      const suggRes = await api.get(`/items/${id}/suggestions`);
      setSuggestions(suggRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Item not found or failed to fetch details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/items/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to delete item.');
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaiming(true);
    setClaimError('');
    try {
      await api.post('/claims', {
        itemId: item._id,
        answer: claimAnswer
      });
      setClaimSuccess(true);
      setTimeout(() => {
        setShowClaimModal(false);
        fetchItemData(); // Refresh status
      }, 2000);
    } catch (err) {
      console.error(err);
      setClaimError(err.response?.data?.message || 'Failed to submit claim.');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="w-full px-4 py-8 md:px-8 text-center bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)]">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 border border-slate-200 dark:bg-slate-850 dark:border-slate-800">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Error Loading Item</h2>
          <p className="text-sm text-slate-500 mt-2">{error || 'Item not found'}</p>
          <Link to="/dashboard" className="mt-4 inline-block text-sm text-primary-500 hover:underline">
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && item.postedBy && item.postedBy._id === user._id;
  const isAdmin = user && user.role === 'admin';
  const detailUrl = `${window.location.origin}/items/${item._id}`;
  const imageSrc = item.imageUrl
    ? item.imageUrl.startsWith('/uploads/')
      ? `http://localhost:5000${item.imageUrl}`
      : item.imageUrl
    : 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=500&auto=format&fit=crop&q=60';

  return (
    <div className="w-full px-4 py-8 md:px-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center space-x-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main details card */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850">
          {/* Main Item Image */}
          <div className="relative h-96 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 mb-6">
            <img src={imageSrc} alt={item.title} className="h-full w-full object-cover" />
            <span
              className={`absolute top-4 left-4 rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wider text-white shadow-md ${
                item.itemType === 'Lost' ? 'bg-rose-500' : 'bg-amber-500'
              }`}
            >
              {item.itemType}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
              <Tag size={14} />
              <span>{item.category}</span>
            </div>
            {/* Status Badge */}
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                item.status === 'Lost'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300'
                  : item.status === 'Found'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                  : item.status === 'Claimed'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300'
              }`}
            >
              {item.status}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-850 dark:text-white mb-4">{item.title}</h1>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>

          {/* Location / Date info */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-100 pt-6 dark:border-slate-800 text-sm">
            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
              <MapPin size={18} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Location</p>
                <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{item.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
              <Calendar size={18} className="text-slate-400" />
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold">Date {item.itemType === 'Lost' ? 'Lost' : 'Found'}</p>
                <p className="font-semibold text-slate-800 dark:text-white mt-0.5">
                  {new Date(item.date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Panels (Reporter user / QR / Claims actions) */}
        <div className="space-y-6">
          {/* Actions panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850">
            <h2 className="text-lg font-bold mb-4">Ownership Actions</h2>
            
            {/* Show Delete button to Poster / Admin */}
            {(isOwner || isAdmin) ? (
              <div className="space-y-3">
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-rose-50 py-3 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors dark:bg-rose-950/20 dark:text-rose-400"
                >
                  <Trash2 size={16} />
                  <span>Delete Post</span>
                </button>
              </div>
            ) : (
              // Claimant Actions
              <div className="space-y-3">
                {item.status === 'Found' && item.itemType === 'Found' ? (
                  <button
                    onClick={() => setShowClaimModal(true)}
                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md shadow-primary-500/10 hover:bg-primary-750 transition-all dark:bg-primary-500 dark:hover:bg-primary-600"
                  >
                    <ShieldCheck size={18} />
                    <span>Claim Found Belonging</span>
                  </button>
                ) : item.status === 'Claimed' || item.status === 'Resolved' ? (
                  <div className="text-center p-3 rounded-xl bg-slate-50 text-slate-500 text-xs font-semibold dark:bg-slate-800">
                    This item has already been successfully recovered or resolved.
                  </div>
                ) : (
                  <div className="text-center p-3 rounded-xl bg-slate-50 text-slate-500 text-xs font-semibold dark:bg-slate-800">
                    This item is reported as Lost. If you found it, please report a matching Found Item.
                  </div>
                )}
              </div>
            )}

            {/* Poster details */}
            <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Posted By</p>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">{item.postedBy?.name || 'Anonymous Student'}</p>
                  <p className="text-xs text-slate-450">{item.postedBy?.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR code card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850 flex flex-col items-center">
            <h2 className="text-lg font-bold mb-3 w-full text-left">Post QR Code</h2>
            <p className="text-xs text-slate-400 dark:text-slate-550 mb-4 w-full">
              Scan QR code on a mobile device to easily view or share this post details page.
            </p>
            <div className="rounded-xl border border-slate-150 bg-white p-3 dark:border-slate-800">
              {qrCode ? (
                <img src={qrCode} alt="Item QR Code" className="h-40 w-40" />
              ) : (
                <QRCodeSVG value={detailUrl} size={160} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestion Matching Suggestions Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center space-x-2">
          <span>AI Matching Suggestions</span>
          <span className="rounded-full bg-primary-100 dark:bg-primary-950 px-2.5 py-0.5 text-xs font-semibold text-primary-800 dark:text-primary-300">
            {suggestions.length} Matches
          </span>
        </h2>

        {suggestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-slate-450 dark:border-slate-850 dark:bg-slate-850/20">
            No active matching suggestions found yet. We will scan incoming posts dynamically.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suggestions.map(({ item: matchedItem, score }) => (
              <div key={matchedItem._id} className="relative">
                <ItemCard item={matchedItem} />
                {/* Match percentage badge overlay */}
                <div className="absolute top-2.5 left-20 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm">
                  {score}% Match suggestion
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Submission Dialog / Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in dark:bg-slate-850">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-850 dark:text-white">Verify Claim Request</h3>
              <p className="text-xs text-slate-500 mt-1">
                You must answer the founder's security question to verify your ownership of this found belonging.
              </p>
            </div>

            {claimSuccess ? (
              <div className="text-center py-6 text-emerald-500 font-bold">
                Claim submitted successfully! The founder has been notified.
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-4">
                {claimError && (
                  <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800 dark:bg-rose-950/20 dark:text-rose-400">
                    {claimError}
                  </div>
                )}

                {/* Security Question Prompt */}
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Question</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white mt-1">
                    "{item.securityQuestion || 'Please describe unique features of this item to verify.'}"
                  </p>
                </div>

                {/* Answer Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                    Your Answer
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={claimAnswer}
                    onChange={(e) => setClaimAnswer(e.target.value)}
                    placeholder="Provide specific details so the founder knows the item belongs to you."
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-primary-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowClaimModal(false)}
                    className="flex-1 rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={claiming}
                    className="flex-1 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white hover:bg-primary-750 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50"
                  >
                    {claiming ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
