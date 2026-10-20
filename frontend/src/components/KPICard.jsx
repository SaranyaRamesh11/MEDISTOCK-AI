import React from 'react';

export const KPICard = ({ title, value, unit = '', change, changeType = 'neutral', icon: Icon, subtitle, highlight = false, badge }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (changeType === 'negative') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (changeType === 'warning') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-slate-300 bg-slate-800 border-slate-700';
  };

  return (
    <div className={`relative overflow-hidden rounded-xl p-5 transition-all duration-200 glass-card ${
      highlight ? 'ring-1 ring-cyan-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40' : ''
    }`}>
      <div className="flex items-start justify-between">
        <span className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          {title}
        </span>
        {Icon && (
          <div className="rounded-lg bg-slate-800/80 p-2.5 text-cyan-400 border border-slate-700/60 shadow-inner">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
          {value}
        </span>
        {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {change && (
          <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold border ${getChangeColor()}`}>
            {change}
          </span>
        )}
        {subtitle && (
          <span className="text-xs font-medium text-slate-300 truncate">
            {subtitle}
          </span>
        )}
        {badge && <div>{badge}</div>}
      </div>
    </div>
  );
};

export default KPICard;
