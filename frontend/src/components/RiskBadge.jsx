import React from 'react';

export const RiskBadge = ({ risk, score, showScore = true, size = 'sm' }) => {
  const normRisk = (risk || 'Healthy').toLowerCase();

  let styles = {
    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    dot: 'bg-emerald-400',
    label: 'Healthy'
  };

  if (normRisk.includes('crit')) {
    styles = {
      bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
      dot: 'bg-rose-500 ring-2 ring-rose-400/50',
      label: 'Critical'
    };
  } else if (normRisk.includes('high') || normRisk.includes('low')) {
    styles = {
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
      dot: 'bg-amber-400',
      label: 'High Risk'
    };
  } else if (normRisk.includes('mon')) {
    styles = {
      bg: 'bg-sky-500/20 text-sky-300 border-sky-500/35',
      dot: 'bg-sky-400',
      label: 'Monitor'
    };
  }

  const sizeClass = size === 'xs' 
    ? 'px-2 py-0.5 text-2xs font-semibold' 
    : size === 'lg' 
    ? 'px-3.5 py-1.5 text-sm font-bold' 
    : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${styles.bg} ${sizeClass} tracking-wide`}>
      <span className={`h-2 w-2 rounded-full ${styles.dot}`}></span>
      <span>{styles.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-90 text-2xs font-mono font-bold ml-0.5">
          ({score})
        </span>
      )}
    </span>
  );
};

export default RiskBadge;
