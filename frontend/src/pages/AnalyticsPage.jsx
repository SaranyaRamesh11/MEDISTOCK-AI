import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  AlertCircle,
  PieChart as PieIcon,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import SkeletonLoader from '../components/SkeletonLoader';
import KPICard from '../components/KPICard';
import api from '../api/client';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

export const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="space-y-6 p-6">
        <SkeletonLoader type="card" count={4} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonLoader type="chart" />
          <SkeletonLoader type="chart" />
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-5 rounded-2xl glass-panel">
        <div className="flex items-center gap-2.5">
          <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Hospital Supply Chain Analytics & Clinical Correlations
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Empirical insights extracted from 10,000 synthetic hospital operational records
            </p>
          </div>
        </div>
      </div>

      {/* Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Dataset Size"
          value={(kpis.dataset_records || 10000).toLocaleString()}
          unit="rows"
          subtitle="Hospital Daily Records"
          icon={Layers}
        />
        <KPICard
          title="Average Daily Demand"
          value={kpis.overall_avg_demand || 169.8}
          unit="units"
          subtitle="Across All Formulary Meds"
          icon={Activity}
        />
        <KPICard
          title="Emergency Correlation"
          value={`+${kpis.correlation_emergency_demand || 0.566}`}
          unit="r"
          subtitle="Strong Emergency Demand Driver"
          change="r = 0.57"
          changeType="positive"
          icon={AlertCircle}
        />
        <KPICard
          title="Patient Census Correlation"
          value={`+${kpis.correlation_patient_demand || 0.254}`}
          unit="r"
          subtitle="Baseline Bed Occupancy"
          change="r = 0.25"
          changeType="positive"
          icon={Users}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Seasonal Demand Dynamics */}
        <div className="rounded-2xl glass-panel p-5.5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
              Seasonal Demand Variations (Average Daily Volume)
            </h3>
            <span className="text-xs font-bold text-cyan-400">Winter Peak</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.seasonal_trend || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="season" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '13px'
                  }}
                />
                <Bar dataKey="avg_demand" name="Average Daily Demand" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Demand Breakdown */}
        <div className="rounded-2xl glass-panel p-5.5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="h-4.5 w-4.5 text-teal-400" />
              Therapeutic Category Consumption Share
            </h3>
            <span className="text-xs font-semibold text-slate-300">% Total Formulary</span>
          </div>

          <div className="h-64 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.category_breakdown || []}
                  dataKey="total_demand"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {(analytics?.category_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '13px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Emergency Department Cases vs Demand Sensitivity */}
        <div className="rounded-2xl glass-panel p-5.5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-4.5 w-4.5 text-rose-400" />
              Emergency Admission Surges vs Medicine Demand
            </h3>
            <span className="text-xs text-rose-400 font-bold">+68% Surge Impact</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.emergency_correlation || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="tier" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '13px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_demand"
                  name="Mean Medicine Demand"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#f43f5e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Patient Count vs Demand Scatter */}
        <div className="rounded-2xl glass-panel p-5.5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-cyan-400" />
              Hospital Census vs Daily Consumption (100 Sample Points)
            </h3>
            <span className="text-xs font-semibold text-slate-300">Linear Scatter</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="patient_count" name="Patient Census" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis dataKey="demand" name="Demand Units" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12.5px'
                  }}
                />
                <Scatter data={analytics?.patient_vs_demand || []} fill="#38bdf8" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
