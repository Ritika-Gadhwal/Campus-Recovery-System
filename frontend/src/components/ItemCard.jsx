import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag, ShieldCheck } from 'lucide-react';

const ItemCard = ({ item }) => {
  const { _id, title, description, category, itemType, location, imageUrl, date, status } = item;

  // Resolve image source
  const imageSrc = imageUrl
    ? imageUrl.startsWith('/uploads/')
      ? `http://localhost:5000${imageUrl}`
      : imageUrl
    : 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=500&auto=format&fit=crop&q=60'; // generic university lost & found asset image

  // Determine status color badge classes
  const getStatusBadge = () => {
    switch (status) {
      case 'Lost':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300';
      case 'Found':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300';
      case 'Claimed':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'Resolved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-850 dark:bg-slate-850">
      {/* Card Header Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Item Type Badge */}
        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
            itemType === 'Lost' ? 'bg-rose-500' : 'bg-amber-500'
          }`}
        >
          {itemType}
        </span>
        {/* Status Badge */}
        <span
          className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getStatusBadge()}`}
        >
          {status}
        </span>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
          <Tag size={12} />
          <span>{category}</span>
        </div>

        <h3 className="text-lg font-bold text-slate-850 dark:text-white line-clamp-1 mb-2 group-hover:text-primary-500 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
          {description}
        </p>

        {/* Location & Date */}
        <div className="mt-auto space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-850 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <MapPin size={14} className="text-slate-400" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={14} className="text-slate-400" />
            <span>{new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-4">
          <Link
            to={`/items/${_id}`}
            className="flex w-full items-center justify-center space-x-1 rounded-xl bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 hover:bg-primary-50 hover:text-primary-600 transition-all dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-primary-950/20 dark:hover:text-primary-300"
          >
            <span>View Details</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
