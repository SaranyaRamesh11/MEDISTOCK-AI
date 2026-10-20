import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {items.map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 animate-pulse">
            <div className="h-3 w-24 rounded bg-slate-800"></div>
            <div className="mt-4 h-7 w-20 rounded bg-slate-700"></div>
            <div className="mt-3 h-3 w-32 rounded bg-slate-800"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 animate-pulse">
        <div className="h-8 w-full rounded bg-slate-800/80 mb-4"></div>
        {items.map((_, i) => (
          <div key={i} className="flex gap-4 py-3 border-b border-slate-800/50">
            <div className="h-4 w-1/4 rounded bg-slate-800"></div>
            <div className="h-4 w-1/6 rounded bg-slate-800"></div>
            <div className="h-4 w-1/6 rounded bg-slate-800"></div>
            <div className="h-4 w-1/6 rounded bg-slate-800"></div>
            <div className="h-4 w-1/4 rounded bg-slate-800"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-64 w-full rounded-xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse flex flex-col justify-between">
      <div className="h-4 w-48 rounded bg-slate-800"></div>
      <div className="h-40 w-full rounded bg-slate-800/40"></div>
      <div className="h-3 w-32 rounded bg-slate-800"></div>
    </div>
  );
};

export default SkeletonLoader;
