import React from 'react';
import { Activity, Bell, Search, ShieldCheck, AlertTriangle, Cpu, Sparkles } from 'lucide-react';

export const Navbar = ({
  backendOnline,
  alertCount = 0,
  onOpenAlerts,
  onOpenSearch,
  onSelectPreset,
  activeTab
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-500/20">
            <Activity className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                MEDISTOCK <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">AI</span>
              </h1>
              <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-500/30">
                PBL v2.0
              </span>
            </div>
            <p className="hidden sm:block text-xs font-medium text-slate-400">
              Predict demand. Prevent shortages. Optimize hospital inventory.
            </p>
          </div>
        </div>

        {/* Center: Quick Search Trigger */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition text-sm shadow-inner"
          >
            <div className="flex items-center gap-2.5">
              <Search className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="truncate">Search 20 hospital medicines (e.g. Paracetamol)...</span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Backend Health Status */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800">
            <span className="relative flex h-2.5 w-2.5">
              {backendOnline ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              )}
            </span>
            <span className="font-semibold text-slate-200 text-xs">
              {backendOnline ? 'FastAPI ML Engine Online' : 'Connecting to API...'}
            </span>
          </div>

          {/* Alerts Center Trigger */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Clinical Alert Center"
          >
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-sm ring-2 ring-slate-950 animate-pulse">
                {alertCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
