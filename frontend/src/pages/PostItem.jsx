import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Upload, Calendar, MapPin, HelpCircle, FileText } from 'lucide-react';

const PostItem = ({ defaultType = 'Lost' }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    itemType: defaultType, // 'Lost' or 'Found'
    location: '',
    date: new Date().toISOString().split('T')[0],
    securityQuestion: ''
  });
  
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const categories = ['Electronics', 'Books', 'Documents', 'Wallets', 'Keys', 'Accessories', 'Others'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('itemType', formData.itemType);
      data.append('location', formData.location);
      data.append('date', formData.date);
      data.append('securityQuestion', formData.securityQuestion);
      if (image) {
        data.append('image', image);
      }

      await api.post('/items', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit post. Ensure all fields are valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 py-8 md:px-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] transition-colors duration-200">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-850">
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Report {formData.itemType} Belonging
        </h1>
        <p className="text-sm text-slate-550 dark:text-slate-400 mb-6">
          Provide as much detail as possible to assist in matching and claim validation.
        </p>

        {errorMsg && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:bg-rose-950/20 dark:text-rose-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Post Type Toggles */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Report Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, itemType: 'Lost' })}
                className={`flex-1 rounded-xl py-3 text-sm font-bold border transition-all ${
                  formData.itemType === 'Lost'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/20 dark:border-rose-500 dark:text-rose-450'
                    : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-800'
                }`}
              >
                Lost Item
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, itemType: 'Found' })}
                className={`flex-1 rounded-xl py-3 text-sm font-bold border transition-all ${
                  formData.itemType === 'Found'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/20 dark:border-amber-500 dark:text-amber-450'
                    : 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-800'
                }`}
              >
                Found Item
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Item Title / Name
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Black Leather Tommy Hilfiger Wallet"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
                <Calendar size={14} />
                <span>Date {formData.itemType === 'Lost' ? 'Lost' : 'Found'}</span>
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-primary-500 dark:border-slate-800 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
              <MapPin size={14} />
              <span>Location (Where was it {formData.itemType === 'Lost' ? 'lost' : 'found'}?)</span>
            </label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Central Library 2nd Floor study cubicles"
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
              <FileText size={14} />
              <span>Description / Key Identifiers</span>
            </label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed description of the item. e.g., color, serial numbers, case type, specific contents inside (for wallets), stickers, etc."
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
            ></textarea>
          </div>

          {/* Security Question (Important for verifying claims) */}
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center space-x-1">
              <HelpCircle size={14} />
              <span>Security Question (To verify ownership during claims)</span>
            </label>
            <input
              type="text"
              name="securityQuestion"
              value={formData.securityQuestion}
              onChange={handleChange}
              placeholder={
                formData.itemType === 'Found'
                  ? 'e.g., What name is printed on the card inside? / Describe the keychains.'
                  : 'e.g., What was the lock screen wallpaper? (Optional)'
              }
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900"
            />
            <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
              {formData.itemType === 'Found'
                ? 'Strongly recommended. The student claiming this item must answer this question before you approve their claim.'
                : 'Optional. Helpful for matching confirmations.'}
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Upload Item Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors">
                {preview ? (
                  <img src={preview} alt="Upload preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-550 dark:text-slate-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-450 dark:text-slate-550">
                      PNG, JPG, JPEG, WEBP or GIF (MAX. 5MB)
                    </p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-primary-600 py-3.5 text-sm font-bold text-white shadow-md shadow-primary-500/10 hover:bg-primary-750 transition-all dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-50"
            >
              {loading ? 'Submitting Report...' : `Report ${formData.itemType} Item`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostItem;
