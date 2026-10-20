import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ArrowRight,
  Brain,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart
} from 'recharts';
import KPICard from '../components/KPICard';
import RiskBadge from '../components/RiskBadge';
import PresetSelector from '../components/PresetSelector';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../api/client';

export const Dashboard = ({ onNavigateToForecast, onSelectPresetScenario }) => {
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [selectedMedForChart, setSelectedMedForChart] = useState('Paracetamol 500mg');
  const [forecastChartData, setForecastChartData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedMedForChart) {
      loadMedicineForecast(selectedMedForChart);
    }
  }, [selectedMedForChart]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [invRes, anaRes, recRes] = await Promise.all([
        api.getInventory(),
        api.getAnalytics(),
        api.getRecommendations()
      ]);
      setInventoryData(invRes);
      setAnalyticsData(anaRes);
      setRecommendationsData(recRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMedicineForecast = async (medName) => {
    try {
      const fRes = await api.getForecast(medName);
      setForecastChartData(fRes);
    } catch (err) {
      console.error('Failed to fetch forecast for', medName, err);
    }
  };

  if (loading && !inventoryData) {
    return (
      <div className="space-y-6 p-6">
        <SkeletonLoader type="card" count={6} />
        <SkeletonLoader type="chart" />
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  const stats = inventoryData?.summary_stats || {};
  const items = inventoryData?.items || [];
  const topCriticalItems = items.filter(i => i.status === 'CRITICAL' || i.status === 'LOW').slice(0, 5);
  const topRec = recommendationsData?.recommendations?.[0];

  // Health categories count
  const healthyCount = items.filter(i => i.risk_level === 'Healthy').length;
  const monitorCount = items.filter(i => i.risk_level === 'Monitor').length;
  const lowCount = items.filter(i => i.risk_level === 'High Risk').length;
  const criticalCount = items.filter(i => i.risk_level === 'Critical').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Controls & Demo Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Hospital Inventory Intelligence Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-factorial demand predictions & replenishment decision engine
          </p>
        </div>

        <PresetSelector
          onSelectPreset={(preset) => {
            onSelectPresetScenario(preset);
          }}
        />
      </div>

      {/* 6 Core KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KPICard
          title="Total Medicines"
          value={stats.total_medicines || 20}
          unit="SKUs"
          subtitle="Hospital Formulary"
          icon={Package}
        />
        <KPICard
          title="Current Stock"
          value={(stats.total_current_stock || 0).toLocaleString()}
          unit="units"
          subtitle="On-hand physical stock"
          icon={Layers}
        />
        <KPICard
          title="Predicted Demand"
          value={(stats.total_predicted_demand || 0).toLocaleString()}
          unit="units"
          change="+14.2%"
          changeType="positive"
          subtitle="Next forecast cycle"
          icon={TrendingUp}
          highlight={true}
        />
        <KPICard
          title="Low Stock Items"
          value={stats.low_stock_items || 0}
          unit="items"
          change={`${stats.low_stock_items} SKUs`}
          changeType={stats.low_stock_items > 0 ? 'warning' : 'positive'}
          subtitle="Below safety buffer"
          icon={AlertTriangle}
        />
        <KPICard
          title="Reorder Required"
          value={stats.reorder_required_count || 0}
          unit="orders"
          change="Action Req"
          changeType="negative"
          subtitle="PO generation needed"
          icon={ShoppingCart}
        />
        <KPICard
          title="Inventory Risk"
          value={`${stats.average_risk_score || 0}`}
          unit="/ 100"
          subtitle="Explainable Index"
          icon={ShieldCheck}
          badge={<RiskBadge risk={stats.average_risk_score > 60 ? 'Critical' : stats.average_risk_score > 35 ? 'Monitor' : 'Healthy'} score={stats.average_risk_score} showScore={false} />}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Interactive Demand Forecast Chart */}
        <div className="rounded-2xl glass-panel p-5.5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <TrendingUp className="h-4.5 w-4.5" />
                </span>
                <h3 className="text-base font-bold text-white">
                  Demand Forecast & Stock Coverage Trajectory
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Historical usage vs ML projected demand with 95% confidence intervals & safety stock
              </p>
            </div>

            {/* Medicine Selector for Chart */}
            <select
              value={selectedMedForChart}
              onChange={(e) => setSelectedMedForChart(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500"
            >
              {items.map((m) => (
                <option key={m.id} value={m.medicine} className="bg-slate-900 text-white">
                  {m.medicine}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Container */}
          <div className="h-72 w-full">
            {forecastChartData?.time_series ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastChartData.time_series} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      fontSize: '13px',
                      color: '#f8fafc'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12.5px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="historical_demand"
                    name="Historical Demand"
                    fill="url(#histGrad)"
                    stroke="#94a3b8"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_demand"
                    name="Predicted Demand"
                    fill="url(#predGrad)"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="current_stock"
                    name="Stock Level"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="safety_stock"
                    name="Safety Stock Buffer"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Loading forecast visualization...
              </div>
            )}
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4 text-slate-300">
              <span>Coverage: <strong className="text-white font-mono">{forecastChartData?.stock_coverage_days || 0} days</strong></span>
              <span>Lead Time: <strong className="text-white font-mono">{forecastChartData?.supplier_lead_time || 0} days</strong></span>
              <span>Reorder: <strong className="text-cyan-400 font-mono font-bold">{forecastChartData?.reorder_quantity || 0} units</strong></span>
            </div>
            <button
              onClick={() => onNavigateToForecast(selectedMedForChart)}
              className="inline-flex items-center gap-1.5 font-bold text-cyan-400 hover:text-cyan-300 transition"
            >
              Open Live Simulator <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Col: Inventory Health & AI Recommendation Spotlight */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Inventory Health Breakdown */}
          <div className="rounded-2xl glass-panel p-5.5">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-teal-400" />
                Inventory Formulary Health
              </h3>
              <span className="text-xs font-semibold text-slate-400">{items.length} Total SKUs</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                <div className="text-xs text-emerald-400 font-bold">Healthy</div>
                <div className="text-3xl font-extrabold font-mono text-white mt-1">{healthyCount}</div>
                <div className="text-xs text-slate-300 mt-0.5">Adequate buffer</div>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/25">
                <div className="text-xs text-sky-400 font-bold">Monitor</div>
                <div className="text-3xl font-extrabold font-mono text-white mt-1">{monitorCount}</div>
                <div className="text-xs text-slate-300 mt-0.5">Stable consumption</div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <div className="text-xs text-amber-400 font-bold">High Risk</div>
                <div className="text-3xl font-extrabold font-mono text-white mt-1">{lowCount}</div>
                <div className="text-xs text-slate-300 mt-0.5">Near lead-time threshold</div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <div className="text-xs text-rose-400 font-bold">Critical</div>
                <div className="text-3xl font-extrabold font-mono text-white mt-1">{criticalCount}</div>
                <div className="text-xs text-slate-300 mt-0.5">Imminent stockout</div>
              </div>
            </div>
          </div>

          {/* AI Clinical Recommendation Spotlight Card */}
          <div className="rounded-2xl p-5.5 bg-gradient-to-br from-slate-900 via-slate-850 to-cyan-950/50 border border-cyan-500/30 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <Brain className="h-4 w-4" /> AI Priority Briefing
              </span>
              {topRec && <RiskBadge risk={topRec.urgency} score={topRec.risk_score} size="xs" />}
            </div>

            {topRec ? (
              <div className="my-3">
                <h4 className="text-base font-bold text-white">
                  {topRec.medicine}
                </h4>
                <p className="text-sm text-slate-200 mt-2 leading-relaxed font-normal">
                  "{topRec.ai_rationale}"
                </p>
                <div className="mt-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Recommended PO:</span>
                  <span className="font-mono font-bold text-sm text-cyan-400">{topRec.reorder_quantity} {topRec.unit} (${topRec.estimated_cost})</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 my-4">Generating clinical inventory briefing...</p>
            )}

            <button
              onClick={() => topRec && onNavigateToForecast(topRec.medicine)}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
            >
              Analyze & Execute Reorder <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Medicines by Demand & Critical Shortage Alerts Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 1 Col: Top Medicines by Demand Bar Chart */}
        <div className="rounded-2xl glass-panel p-5.5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-cyan-400" />
              Top Demand Medicines
            </h3>
            <span className="text-xs text-slate-400">Mean Daily Units</span>
          </div>

          <div className="h-64 w-full">
            {analyticsData?.top_medicines ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData.top_medicines.slice(0, 6)}
                  layout="vertical"
                  margin={{ top: 5, right: 15, left: 35, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis
                    dataKey="medicine"
                    type="category"
                    stroke="#cbd5e1"
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) => v.split(' ')[0]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '12.5px'
                    }}
                  />
                  <Bar dataKey="avg_demand" name="Daily Demand" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Loading analytics...
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Critical & Low Stock Table */}
        <div className="rounded-2xl glass-panel p-5.5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
                Critical & Low Stock Replenishment Queue
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Priority medicines requiring immediate purchase order generation
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {topCriticalItems.length} Urgent Items
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-xs">
                  <th className="pb-3 px-2">Medicine</th>
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2 text-right">Current Stock</th>
                  <th className="pb-3 px-2 text-right">Pred. Demand</th>
                  <th className="pb-3 px-2 text-center">Status</th>
                  <th className="pb-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {topCriticalItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-2 font-bold text-white">
                      {item.medicine}
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-300">
                      {item.category}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-slate-100 font-medium">
                      {item.current_stock}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-cyan-400">
                      {item.predicted_demand}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <RiskBadge risk={item.risk_level} score={item.risk_score} size="xs" />
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => onNavigateToForecast(item.medicine)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 font-bold text-slate-200 transition text-xs flex items-center gap-1.5"
                      >
                        Forecast <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-right">
            <button
              onClick={() => onNavigateToForecast('Paracetamol 500mg')}
              className="text-xs font-bold text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              View Full Inventory Intelligence Table <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
