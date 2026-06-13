import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  ClipboardList,
  User,
  ShieldAlert,
  SearchCode
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    { to: '/dashboard', label: 'All Items', icon: LayoutDashboard },
    { to: '/post-lost', label: 'Report Lost Item', icon: PlusCircle },
    { to: '/post-found', label: 'Report Found Item', icon: SearchCode },
    { to: '/my-items', label: 'My Items Dashboard', icon: FolderOpen },
    { to: '/claims', label: 'Claims Tracker', icon: ClipboardList },
    { to: '/profile', label: 'My Profile', icon: User }
  ];

  // Insert Admin panel if user is admin
  if (user && user.role === 'admin') {
    links.push({ to: '/admin', label: 'Admin Dashboard', icon: ShieldAlert });
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 hidden md:block">
      <div className="flex flex-col h-full py-6 px-4">
        {/* Short Portal summary */}
        <div className="mb-6 px-3 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Logged in as</p>
          <p className="text-sm font-bold truncate mt-0.5 text-slate-700 dark:text-slate-300">{user?.name}</p>
          <p className="text-[11px] truncate text-slate-400 dark:text-slate-500">{user?.email}</p>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/45 dark:text-primary-300 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-850 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
