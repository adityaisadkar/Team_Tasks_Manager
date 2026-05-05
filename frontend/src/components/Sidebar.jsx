import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 shadow-sm z-50">
      <div className="p-8">
        <h1 className="text-3xl font-black text-indigo-600 flex items-center gap-3 tracking-tighter">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <FolderKanban size={24} />
          </div>
          TTM
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? 'bg-indigo-600 text-white shadow font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <LayoutDashboard size={20} />
          <span className="text-sm">Dashboard</span>
        </NavLink>

        <NavLink
          to="/projects"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              isActive
                ? 'bg-indigo-600 text-white shadow font-medium'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <FolderKanban size={20} />
          <span className="text-sm">Projects</span>
        </NavLink>
      </nav>

      <div className="p-6 border-t border-gray-50 bg-gray-50/30">
        <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate block w-full">{user?.name}</p>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider truncate block w-full">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-semibold text-sm border border-transparent hover:border-red-100"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
