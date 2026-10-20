import React, { useState, useEffect } from 'react';
import { Search, X, Pill, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import RiskBadge from './RiskBadge';

export const GlobalSearchModal = ({ isOpen, onClose, medicines = [], onSelectMedicine }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(false);
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filtered = medicines.filter(m => 
    m.medicine.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <Search className="h-5 w-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search medicine name, category (e.g. Paracetamol, Antibiotics)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white text-base placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Pill className="h-9 w-9 mx-auto text-slate-600 mb-2 opacity-50" />
              <p className="text-base font-semibold text-slate-300">No matching hospital medicines found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by clinical category or dosage</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectMedicine(item);
                  onClose();
                }}
                className="group flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-800/70 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-500/20 transition">
                    <Pill className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                      {item.medicine}
                    </h4>
                    <p className="text-xs text-slate-400">{item.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-400">Current Stock: <span className="font-mono text-white font-semibold">{item.current_stock}</span></div>
                    <div className="text-xs text-slate-400">Pred. Demand: <span className="font-mono text-cyan-400 font-bold">{item.predicted_demand}</span></div>
                  </div>
                  <RiskBadge risk={item.risk_level} score={item.risk_score} />
                  <ArrowRight className="h-4.5 w-4.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total catalog indexed: <strong className="text-slate-200">{medicines.length} items</strong></span>
          <span className="flex items-center gap-1.5">Press <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-2xs text-slate-300">ESC</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
