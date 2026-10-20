import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  RefreshCw,
  Clock,
  Filter
} from 'lucide-react';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../api/client';

export const AlertsPage = ({ onNavigateToForecast }) => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('All');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts();
      setAlerts(res.alerts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'All') return true;
    return a.severity === filterSeverity;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          card: 'bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 border-rose-500/40',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: AlertCircle,
          iconColor: 'text-rose-400'
        };
      case 'HIGH':
        return {
          card: 'glass-card border-amber-500/30',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: AlertTriangle,
          iconColor: 'text-amber-400'
        };
      default:
        return {
          card: 'glass-card border-sky-500/30',
          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          icon: Info,
          iconColor: 'text-sky-400'
        };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-panel">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Hospital Supply Chain Alert Center
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Live operational surveillance detecting imminent stockouts and supplier delays
            </p>
          </div>
        </div>

        <button
          onClick={loadAlerts}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-750 text-xs font-bold text-white flex items-center gap-2 transition"
        >
          <RefreshCw className={`h-4.5 w-4.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Alerts
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        {['All', 'CRITICAL', 'HIGH', 'INFO'].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
              filterSeverity === sev
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {sev === 'All' ? `All Alerts (${alerts.length})` : sev}
          </button>
        ))}
      </div>

      {/* Alerts Grid */}
      {loading && alerts.length === 0 ? (
        <SkeletonLoader type="table" count={5} />
      ) : (
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 glass-panel rounded-2xl">
              <ShieldAlert className="h-10 w-10 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-base font-bold text-white">No active alerts in this filter tier</p>
              <p className="text-xs text-slate-400 mt-1">All hospital medicine inventory levels are within acceptable thresholds.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const style = getSeverityStyle(alert.severity);
              const Icon = style.icon;

              return (
                <div
                  key={alert.id}
                  className={`p-5.5 rounded-2xl border transition ${style.card}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${style.badge}`}>
                        <Icon className={`h-4 w-4 ${style.iconColor}`} />
                        {alert.severity}
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {alert.medicine}
                      </h4>
                    </div>

                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> {alert.timestamp}
                    </span>
                  </div>

                  <h5 className="mt-3 text-base font-bold text-slate-100">
                    {alert.title}
                  </h5>

                  <p className="mt-1.5 text-sm text-slate-200 leading-relaxed font-normal">
                    {alert.message}
                  </p>

                  <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-xs text-cyan-400 font-bold">
                      ⚡ Action Required: {alert.suggested_action}
                    </span>

                    <button
                      onClick={() => onNavigateToForecast(alert.medicine)}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold text-slate-200 transition inline-flex items-center gap-1.5 shrink-0"
                    >
                      Open Forecast Simulator <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
