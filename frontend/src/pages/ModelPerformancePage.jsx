import React, { useState, useEffect } from 'react';
import {
  Cpu,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  HelpCircle,
  Award,
  Zap,
  Sliders
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import SkeletonLoader from '../components/SkeletonLoader';
import KPICard from '../components/KPICard';
import api from '../api/client';

export const ModelPerformancePage = () => {
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const res = await api.getModelPerformance();
      setPerformance(res);
    } catch (err) {
      console.error('Failed to load model performance:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !performance) {
    return (
      <div className="space-y-6 p-6">
        <SkeletonLoader type="card" count={4} />
        <SkeletonLoader type="chart" />
      </div>
    );
  }

  const models = performance?.models || {};
  const linReg = models['Linear Regression'] || {};
  const rfReg = models['Random Forest Regression'] || {};
  const features = performance?.top_features || [];
  const errorStats = performance?.error_stats || {};

  // Form comparison data for chart
  const sampleComparisonData = (errorStats.sample_actuals || []).slice(0, 15).map((actual, idx) => ({
    sample: `#${idx + 1}`,
    actual,
    linear_pred: errorStats.sample_preds_lin?.[idx],
    rf_pred: errorStats.sample_preds_rf?.[idx]
  }));

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Cpu className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Machine Learning Model Evaluation & Transparency
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Empirical validation metrics computed on 2,000 hold-out test records (80/20 train-test split)
            </p>
          </div>
        </div>
      </div>

      {/* Selected Model Production Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950/40 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-cyan-400" /> Selected Production Model
              </span>
              <span className="text-xs font-semibold text-slate-300">Baseline Algorithm</span>
            </div>
            <h3 className="text-2xl font-extrabold text-white">
              Linear Regression Pipeline
            </h3>
            <p className="text-sm text-slate-200 max-w-3xl leading-relaxed mt-2 font-normal">
              {performance?.selection_rationale}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xs text-slate-300 font-semibold">Test R² Score</div>
              <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">{linReg.r2_score}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-xs text-slate-300 font-semibold">Inference Latency</div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">{"< 1.5 ms"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Cards Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Linear Regression Card */}
        <div className="rounded-2xl glass-panel p-6 border-cyan-500/30 relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div>
              <h4 className="text-lg font-bold text-white">Linear Regression</h4>
              <span className="text-xs text-cyan-400 font-bold">Production Primary Model</span>
            </div>
            <span className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Zap className="h-4.5 w-4.5" />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4.5">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-bold">R² Score</span>
              <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-1">{linReg.r2_score}</div>
              <span className="text-2xs text-slate-400 font-medium">90.57% Variance</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-bold">MAE</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">{linReg.mae}</div>
              <span className="text-2xs text-slate-400 font-medium">Mean Abs Error</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-bold">RMSE</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">{linReg.rmse}</div>
              <span className="text-2xs text-slate-400 font-medium">Root Mean Sq</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-bold">MAPE</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{linReg.mape}%</div>
              <span className="text-2xs text-slate-400 font-medium">Percentage Error</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Provides complete mathematical transparency without black-box opacity. Features standard scaling and one-hot encoding pipelines.
          </p>
        </div>

        {/* Random Forest Card */}
        <div className="rounded-2xl glass-panel p-6 border-slate-750 relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div>
              <h4 className="text-lg font-bold text-white">Random Forest Regressor</h4>
              <span className="text-xs text-slate-300 font-bold">Non-Linear Benchmark Comparison</span>
            </div>
            <span className="p-2.5 rounded-lg bg-slate-800 text-slate-300">
              <Layers className="h-4.5 w-4.5" />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4.5">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-bold">R² Score</span>
              <div className="text-2xl font-extrabold font-mono text-teal-400 mt-1">{rfReg.r2_score}</div>
              <span className="text-2xs text-slate-400 font-medium">95.25% Variance</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-bold">MAE</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">{rfReg.mae}</div>
              <span className="text-2xs text-slate-400 font-medium">Mean Abs Error</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-bold">RMSE</span>
              <div className="text-2xl font-extrabold font-mono text-white mt-1">{rfReg.rmse}</div>
              <span className="text-2xs text-slate-400 font-medium">Root Mean Sq</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-300 font-bold">MAPE</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">{rfReg.mape}%</div>
              <span className="text-2xs text-slate-400 font-medium">Percentage Error</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            100 Decision Trees ensemble with max depth 12. Captures complex non-linear feature interactions for emergency case bursts.
          </p>
        </div>
      </div>

      {/* Feature Importance & Residual Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance Horizontal Bar */}
        <div className="rounded-2xl glass-panel p-5.5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-cyan-400" />
              Empirical Feature Importance Ranking (%)
            </h3>
            <span className="text-xs text-slate-400">Gini / MDI</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={features.slice(0, 8)}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} unit="%" />
                <YAxis
                  dataKey="feature"
                  type="category"
                  stroke="#cbd5e1"
                  fontSize={12}
                  tickLine={false}
                  width={115}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.5rem',
                    fontSize: '12.5px'
                  }}
                  formatter={(val) => [`${val}%`, 'Importance']}
                />
                <Bar dataKey="rf_importance" name="Relative Weight" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actual vs Predicted on Test Set */}
        <div className="rounded-2xl glass-panel p-5.5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-teal-400" />
              Actual vs Predicted Demand (Test Set Samples)
            </h3>
            <span className="text-xs text-slate-400">15 Hold-Out Batches</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sample" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12.5px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Actual Ground Truth"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={{ r: 3.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="linear_pred"
                  name="Linear Regression Pred"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  dot={{ r: 4.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="rf_pred"
                  name="Random Forest Pred"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 3.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformancePage;
