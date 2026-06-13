import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import { Search, Filter, Info, RefreshCcw } from 'lucide-react';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [itemType, setItemType] = useState('');
  const [status, setStatus] = useState('');
  const [stats, setStats] = useState({ lost: 0, found: 0, claimed: 0, resolved: 0 });

  const categories = ['Electronics', 'Books', 'Documents', 'Wallets', 'Keys', 'Accessories', 'Others'];

  // Fetch Items based on filters
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (itemType) params.itemType = itemType;
      if (status) params.status = status;

      const res = await api.get('/items', { params });
      setItems(res.data.data);

      // Compute statistics based on fetched un-filtered data for accuracy
      const allRes = await api.get('/items');
      const allItems = allRes.data.data;
      
      const lost = allItems.filter(i => i.itemType === 'Lost' && i.status === 'Lost').length;
      const found = allItems.filter(i => i.itemType === 'Found' && i.status === 'Found').length;
      const claimed = allItems.filter(i => i.status === 'Claimed').length;
      const resolved = allItems.filter(i => i.status === 'Resolved').length;

      setStats({ lost, found, claimed, resolved });
    } catch (err) {
      console.error('Error fetching dashboard items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, itemType, status]); // Re-fetch on filter changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setItemType('');
    setStatus('');
  };

  return (
    <div className="w-full px-4 py-8 md:px-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-white">
            Campus Bulletin Board
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Browse all reported lost and found items on campus
          </p>
        </div>
        <button
          onClick={fetchItems}
          className="flex items-center space-x-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750"
        >
          <RefreshCcw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-850">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unresolved Lost</p>
          <p className="text-2xl font-extrabold mt-1 text-rose-500">{stats.lost}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-850">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unclaimed Found</p>
          <p className="text-2xl font-extrabold mt-1 text-amber-500">{stats.found}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-850">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Claims Verification</p>
          <p className="text-2xl font-extrabold mt-1 text-emerald-500">{stats.claimed}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-850">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Returned Safely</p>
          <p className="text-2xl font-extrabold mt-1 text-blue-500">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters & Search Control */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search by item title, details, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* ItemType filter */}
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="Lost">Lost Posts</option>
              <option value="Found">Found Posts</option>
            </select>

            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
              <option value="Claimed">Claimed</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Clear filters */}
            {(search || category || itemType || status) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-rose-500 hover:underline font-semibold"
              >
                Clear Filters
              </button>
            )}
            
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-750 shadow-md shadow-primary-500/10 dark:bg-primary-500 dark:hover:bg-primary-600"
            >
              Search
            </button>
          </div>
        </form>

        {/* Categories filters */}
        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Filter size={12} />
            <span>Filter by Category</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                category === ''
                  ? 'bg-primary-600 text-white dark:bg-primary-500'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  category === cat
                    ? 'bg-primary-600 text-white dark:bg-primary-500'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Items Listing Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-850 dark:bg-slate-850/50">
          <Info size={40} className="text-slate-350 mb-3" />
          <h3 className="text-lg font-bold">No items found</h3>
          <p className="text-sm text-slate-450 mt-1 max-w-sm">
            Try adjusting your search keywords, clear filters, or make a new post if you lost or found something.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
