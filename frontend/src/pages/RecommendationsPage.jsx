import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Brain,
  ShoppingCart,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import KPICard from '../components/KPICard';
import api from '../api/client';

export const RecommendationsPage = ({ onNavigateToForecast }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [approvedList, setApprovedList] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.getRecommendations();
      setData(res);
    } catch (err) {
      console.error('Failed to load AI recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePO = (rec) => {
    setApprovedList([...approvedList, rec.id]);
    setToastMessage(`Purchase Order for ${rec.reorder_quantity} ${rec.unit} of ${rec.medicine} ($${rec.estimated_cost}) approved successfully.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (loading && !data) {
    return (
      <div className="space-y-6 p-6">
        <SkeletonLoader type="card" count={3} />
        <SkeletonLoader type="table" count={6} />
      </div>
    );
  }

  const summary = data?.summary || {};
  const recs = data?.recommendations || [];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm shadow-2xl animate-bounce">
          <CheckCircle2 className="h-4.5 w-4.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Lightbulb className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Smart Replenishment & Procurement Recommendations
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Explainable clinical decision engine recommending precise safety-stock replenishment quantities
            </p>
          </div>
        </div>
      </div>

      {/* Procurement KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Reorder Items"
          value={summary.total_recommendations || 0}
          unit="SKUs"
          subtitle="Formulary Deficits"
          icon={ShoppingCart}
          change={`${summary.critical_actions || 0} Critical`}
          changeType="warning"
        />
        <KPICard
          title="Critical Interventions"
          value={summary.critical_actions || 0}
          unit="Emergency POs"
          subtitle="Stockout Imminent (<3 days)"
          icon={AlertTriangle}
          change="Immediate Action"
          changeType="negative"
        />
        <KPICard
          title="Estimated Budget Required"
          value={`$${(summary.estimated_procurement_budget || 0).toLocaleString()}`}
          subtitle="Total Replenishment Cost"
          icon={DollarSign}
          highlight={true}
        />
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Brain className="h-4.5 w-4.5 text-cyan-400" />
          Clinical Priority Recommendations ({recs.length})
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {recs.map((rec) => {
            const isApproved = approvedList.includes(rec.id);

            return (
              <div
                key={rec.id}
                className={`rounded-2xl p-5.5 border transition-all duration-200 ${
                  rec.urgency === 'Critical'
                    ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 border-rose-500/30 shadow-md'
                    : 'glass-card border-slate-750 hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Medicine & Rationale */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-bold text-white">
                        {rec.medicine}
                      </h4>
                      <span className="text-xs text-slate-300 font-medium">({rec.category})</span>
                      <RiskBadge risk={rec.urgency} score={rec.risk_score} size="xs" />
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed max-w-3xl font-normal">
                      "{rec.ai_rationale}"
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                      <span>Current Stock: <strong className="text-white font-mono">{rec.current_stock}</strong></span>
                      <span>Pred. Demand: <strong className="text-cyan-400 font-mono font-bold">{rec.predicted_demand}</strong></span>
                      <span>Depletion in: <strong className="text-rose-400 font-mono font-bold">{rec.stockout_in_days} days</strong></span>
                      <span>Lead Time: <strong className="text-slate-100 font-mono">{rec.supplier_lead_time} days</strong></span>
                    </div>
                  </div>

                  {/* Right: Action & Cost Box */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3.5 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3.5 lg:pt-0 lg:pl-6 shrink-0">
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-slate-300 font-bold uppercase tracking-wider">
                        Recommended Reorder
                      </div>
                      <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-0.5">
                        +{rec.reorder_quantity} {rec.unit}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 mt-0.5">
                        Est. Cost: <strong className="text-white">${rec.estimated_cost}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full lg:w-auto">
                      <button
                        onClick={() => onNavigateToForecast(rec.medicine)}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
                      >
                        Forecast <ArrowRight className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleApprovePO(rec)}
                        disabled={isApproved}
                        className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                        }`}
                      >
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" /> PO Approved
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4" /> Approve PO
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
