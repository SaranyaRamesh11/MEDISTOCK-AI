import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  BarChart3,
  Lightbulb,
  Cpu,
  ShieldAlert,
  Menu,
  X,
  Stethoscope,
  Database
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { id: 'forecast', label: 'Demand Forecast', icon: TrendingUp, badge: 'Live ML' },
  { id: 'inventory', label: 'Inventory Intelligence', icon: Package, badge: '20 Meds' },
  { id: 'analytics', label: 'Visual Analytics', icon: BarChart3, badge: null },
  { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb, badge: 'Smart' },
  { id: 'performance', label: 'Model Performance', icon: Cpu, badge: 'R² 0.91' },
  { id: 'alerts', label: 'Alerts Center', icon: ShieldAlert, badge: null },
];

export const Sidebar = ({ activeTab, onTabChange, isMobileOpen, setIsMobileOpen, alertCount = 0 }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800 backdrop-blur-md transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation List */}
        <div className="p-4 space-y-1.5 overflow-y-auto flex-1">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Platform Intelligence
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.id === 'alerts' && alertCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {alertCount}
                  </span>
                ) : item.badge ? (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      isActive
                        ? 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40'
                        : 'bg-slate-800 text-slate-300 border-slate-750'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* System Details Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="rounded-xl p-3.5 bg-slate-850 border border-slate-750">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              <Database className="h-4 w-4 text-cyan-400" />
              <span>Training Dataset</span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-slate-300">
              <p>• 10,000 Hospital Records</p>
              <p>• 13 Clinical/Logistics Features</p>
              <p>• Linear Regression Primary</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
