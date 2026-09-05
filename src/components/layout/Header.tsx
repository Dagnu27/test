import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  UserCheck,
  Building2,
  ClipboardList,
  Sliders,
  History,
  PlusCircle,
  Wifi,
  WifiOff,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    allUsers,
    switchUser,
    switchRole,
    activeView,
    setActiveView,
    isOnline,
    setCurrentInspection,
  } = useApp();

  const handleStartNewInspection = () => {
    setCurrentInspection(null);
    setActiveView('new_inspection');
  };

  return (
    <header className="bg-indigo-950 text-white border-b border-indigo-900 sticky top-0 z-40 shadow-md">
      {/* Top Governmental Bar */}
      <div className="bg-indigo-950/95 px-4 py-1.5 border-b border-indigo-900 text-[11px] text-indigo-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium tracking-wide">
            Federal Democratic Republic of Ethiopia • Health Regulatory Inspection Directorate
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-indigo-200">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-300">
                <Wifi className="w-3.5 h-3.5" />
                <span>Online / Database Synced</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-300">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode / Local Cache</span>
              </span>
            )}
          </div>
          <span className="text-indigo-400">|</span>
          <span className="font-mono text-[10px] text-indigo-300">FORM 002 / EFDA COMPLIANT</span>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-950/50 border border-indigo-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                DHRIS
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-medium border border-indigo-400/30">
                  Regulatory Audit
                </span>
              </h1>
              <p className="text-[11px] text-indigo-300 hidden sm:block">
                Digital Health Regulatory Inspection System
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-indigo-800 text-white shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/60'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveView('facilities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'facilities'
                  ? 'bg-indigo-800 text-white shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Facilities
            </button>

            <button
              onClick={() => setActiveView('inspections_list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'inspections_list'
                  ? 'bg-indigo-800 text-white shadow-xs'
                  : 'text-indigo-200 hover:text-white hover:bg-indigo-900/60'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Inspections
            </button>

            {currentUser.role === 'ADMIN' && (
              <>
                <button
                  onClick={() => setActiveView('checklist_config')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeView === 'checklist_config'
                      ? 'bg-indigo-800 text-white shadow-xs'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-900/60'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  Checklist Engine
                </button>

                <button
                  onClick={() => setActiveView('audit_logs')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeView === 'audit_logs'
                      ? 'bg-indigo-800 text-white shadow-xs'
                      : 'text-indigo-200 hover:text-white hover:bg-indigo-900/60'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Audit Trail
                </button>
              </>
            )}
          </nav>

          {/* Right Side: Quick Action & Role Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleStartNewInspection}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-indigo-400/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Inspection</span>
            </button>

            {/* Role & User Switcher Container */}
            <div className="relative flex items-center border border-indigo-800 bg-indigo-900/80 rounded-xl p-1 gap-1">
              {/* Role Toggle Buttons */}
              <div className="flex bg-indigo-950 rounded-lg p-0.5 text-[11px] font-semibold">
                <button
                  onClick={() => switchRole('ADMIN')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                  title="Switch to System Administrator view"
                >
                  Admin
                </button>
                <button
                  onClick={() => switchRole('INSPECTOR')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    currentUser.role === 'INSPECTOR'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-300 hover:text-white'
                  }`}
                  title="Switch to Regulatory Inspector view"
                >
                  Inspector
                </button>
              </div>

              {/* User Selector Dropdown */}
              <div className="relative">
                <select
                  value={currentUser.id}
                  onChange={(e) => switchUser(e.target.value)}
                  className="bg-transparent text-xs text-indigo-100 font-medium pl-2 pr-6 py-1 appearance-none focus:outline-none cursor-pointer max-w-[150px] truncate"
                  title="Select user account"
                >
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id} className="bg-indigo-950 text-white">
                      {user.fullName} ({user.role === 'ADMIN' ? 'Admin' : 'Inspector'})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-indigo-300 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="md:hidden flex items-center justify-around border-t border-indigo-900 px-2 py-2 bg-indigo-950/90 text-xs">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-2.5 py-1 rounded-md font-medium ${activeView === 'dashboard' ? 'text-white bg-indigo-800' : 'text-indigo-200'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveView('facilities')}
          className={`px-2.5 py-1 rounded-md font-medium ${activeView === 'facilities' ? 'text-white bg-indigo-800' : 'text-indigo-200'}`}
        >
          Facilities
        </button>
        <button
          onClick={() => setActiveView('inspections_list')}
          className={`px-2.5 py-1 rounded-md font-medium ${activeView === 'inspections_list' ? 'text-white bg-indigo-800' : 'text-indigo-200'}`}
        >
          Inspections
        </button>
        {currentUser.role === 'ADMIN' && (
          <>
            <button
              onClick={() => setActiveView('checklist_config')}
              className={`px-2.5 py-1 rounded-md font-medium ${activeView === 'checklist_config' ? 'text-white bg-indigo-800' : 'text-indigo-200'}`}
            >
              Checklists
            </button>
            <button
              onClick={() => setActiveView('audit_logs')}
              className={`px-2.5 py-1 rounded-md font-medium ${activeView === 'audit_logs' ? 'text-white bg-indigo-800' : 'text-indigo-200'}`}
            >
              Audit
            </button>
          </>
        )}
      </div>
    </header>
  );
};
