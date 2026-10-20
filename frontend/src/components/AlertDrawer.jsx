import React from 'react';
import { X, AlertCircle, AlertTriangle, Info, ArrowRight, ShieldAlert } from 'lucide-react';

export const AlertDrawer = ({ isOpen, onClose, alerts = [], onNavigateToForecast }) => {
  if (!isOpen) return null;

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: ShieldAlert,
          iconColor: 'text-rose-400'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
          iconColor: 'text-amber-400'
        };
      default:
        return {
          bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          icon: Info,
          iconColor: 'text-sky-400'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Clinical Alert Center</h3>
                <p className="text-xs text-slate-400">Live operational & supply risks ({alerts.length} active)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {alerts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <p className="text-base font-semibold text-white">All hospital inventories healthy</p>
                <p className="text-xs text-slate-400 mt-1">No active stockouts or supplier warnings</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const badge = getSeverityBadge(alert.severity);
                const Icon = badge.icon;

                return (
                  <div
                    key={alert.id}
                    className="p-4.5 rounded-xl bg-slate-850 border border-slate-750 hover:border-slate-600 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border ${badge.bg}`}>
                          <Icon className={`h-3.5 w-3.5 ${badge.iconColor}`} />
                          {alert.severity}
                        </span>
                        <span className="text-sm font-bold text-white">{alert.medicine}</span>
                      </div>
                      <span className="text-2xs text-slate-400">{alert.timestamp}</span>
                    </div>

                    <h4 className="mt-2.5 text-sm font-bold text-slate-100">
                      {alert.title}
                    </h4>

                    <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-cyan-400 font-semibold truncate max-w-[240px]">
                        👉 {alert.suggested_action}
                      </span>
                      <button
                        onClick={() => {
                          onNavigateToForecast(alert.medicine);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-200 hover:text-cyan-300 hover:underline transition"
                      >
                        Forecast <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-center">
            <p className="text-xs text-slate-400">
              Alerts auto-refresh based on real-time ML inventory evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDrawer;
