import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Cpu,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Brain,
  Layers,
  Clock,
  Activity,
  ArrowRight,
  Sparkles,
  Sliders,
  DollarSign
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
  CartesianGrid
} from 'recharts';
import RiskBadge from '../components/RiskBadge';
import PresetSelector from '../components/PresetSelector';
import api from '../api/client';

export const ForecastPage = ({ initialMedicine = 'Paracetamol 500mg', initialPreset = null }) => {
  const [medicinesList, setMedicinesList] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedMed, setSelectedMed] = useState(initialMedicine);
  const [category, setCategory] = useState('Analgesics & Antipyretics');
  const [currentStock, setCurrentStock] = useState(250);
  const [dailyUsage, setDailyUsage] = useState(180);
  const [patientCount, setPatientCount] = useState(380);
  const [emergencyCases, setEmergencyCases] = useState(30);
  const [season, setSeason] = useState('Winter');
  const [holiday, setHoliday] = useState(0);
  const [leadTime, setLeadTime] = useState(4);
  const [modelType, setModelType] = useState('Linear Regression');

  const [loading, setLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [forecastTimeline, setForecastTimeline] = useState(null);
  const [activePresetId, setActivePresetId] = useState(null);

  // Load catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.getMedicines();
        setMedicinesList(res.medicines);
        setCatalog(res.medicines);

        // If initial preset is passed, apply it
        if (initialPreset) {
          applyPreset(initialPreset);
        } else {
          // Initialize with selected medicine default
          const medMeta = res.medicines.find(m => m.name === initialMedicine) || res.medicines[0];
          if (medMeta) {
            setCategory(medMeta.category);
            setDailyUsage(medMeta.base_daily_usage);
            setLeadTime(medMeta.default_lead_time);
            setCurrentStock(Math.round(medMeta.base_daily_usage * 1.5 * medMeta.default_lead_time));
          }
        }
      } catch (err) {
        console.error('Failed to load medicines catalog:', err);
      }
    };
    fetchCatalog();
  }, [initialMedicine, initialPreset]);

  // When medicine selection changes
  const handleMedicineChange = (medName) => {
    setSelectedMed(medName);
    const medMeta = catalog.find(m => m.name === medName);
    if (medMeta) {
      setCategory(medMeta.category);
      setDailyUsage(medMeta.base_daily_usage);
      setLeadTime(medMeta.default_lead_time);
      setCurrentStock(Math.round(medMeta.base_daily_usage * 1.5 * medMeta.default_lead_time));
    }
  };

  const applyPreset = (preset) => {
    setActivePresetId(preset.id);
    setSelectedMed(preset.medicine);
    setCategory(preset.category);
    setCurrentStock(preset.current_stock);
    setDailyUsage(preset.daily_usage);
    setPatientCount(preset.patient_count);
    setEmergencyCases(preset.emergency_cases);
    setSeason(preset.season);
    setHoliday(preset.holiday);
    setLeadTime(preset.supplier_lead_time);
  };

  // Run live prediction when inputs change
  useEffect(() => {
    if (selectedMed) {
      runInference();
    }
  }, [selectedMed, currentStock, dailyUsage, patientCount, emergencyCases, season, holiday, leadTime, modelType]);

  const runInference = async () => {
    try {
      setLoading(true);
      const payload = {
        medicine: selectedMed,
        category,
        current_stock: parseFloat(currentStock) || 0,
        daily_usage: parseFloat(dailyUsage) || 1,
        patient_count: parseInt(patientCount) || 300,
        emergency_cases: parseInt(emergencyCases) || 15,
        season,
        holiday: parseInt(holiday) || 0,
        supplier_lead_time: parseFloat(leadTime) || 4,
        model_type: modelType
      };

      const [predRes, fRes] = await Promise.all([
        api.predict(payload),
        api.getForecast(selectedMed)
      ]);

      setPredictionResult(predRes);
      setForecastTimeline(fRes.time_series);
    } catch (err) {
      console.error('Inference error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Presets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sliders className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Clinical Demand Forecasting Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tweak operational parameters to trigger real-time ML inference and replenishment calculations
          </p>
        </div>

        <PresetSelector
          onSelectPreset={applyPreset}
          selectedPresetId={activePresetId}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 5 Cols: Interactive Parameter Control Panel */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="h-4.5 w-4.5 text-cyan-400" />
              Input Parameter Matrix
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">ML Model:</span>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 focus:outline-none"
              >
                <option value="Linear Regression">Linear Regression (Prod)</option>
                <option value="Random Forest">Random Forest Regressor</option>
              </select>
            </div>
          </div>

          <div className="space-y-4.5">
            {/* Medicine Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">
                Select Hospital Medicine (Formulary)
              </label>
              <select
                value={selectedMed}
                onChange={(e) => handleMedicineChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              >
                {medicinesList.map((m) => (
                  <option key={m.name} value={m.name} className="bg-slate-900 text-white">
                    {m.name} ({m.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Stock & Daily Usage */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Current Stock</span>
                  <span className="font-mono text-cyan-400 font-bold">{currentStock}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Daily Usage (Units/Day)</span>
                  <span className="font-mono text-cyan-400 font-bold">{dailyUsage}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={dailyUsage}
                  onChange={(e) => setDailyUsage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Patient Census & Emergency Cases */}
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Patient Census</span>
                  <span className="font-mono text-slate-300 font-bold">{patientCount}</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="600"
                  value={patientCount}
                  onChange={(e) => setPatientCount(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Emergency Cases</span>
                  <span className="font-mono text-rose-400 font-bold">{emergencyCases}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  value={emergencyCases}
                  onChange={(e) => setEmergencyCases(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-2"
                />
              </div>
            </div>

            {/* Season, Holiday, Supplier Lead Time */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Season</label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-white focus:outline-none"
                >
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Autumn">Autumn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Holiday/Weekend</label>
                <select
                  value={holiday}
                  onChange={(e) => setHoliday(parseInt(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-white focus:outline-none"
                >
                  <option value="0">No (Standard)</option>
                  <option value="1">Yes (Holiday)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Time (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={leadTime}
                  onChange={(e) => setLeadTime(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>Inference Latency: <strong className="text-cyan-400 font-mono font-bold">{predictionResult?.latency_ms || 1.2} ms</strong></span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-Evaluating
            </span>
          </div>
        </div>

        {/* Right 7 Cols: Live Prediction & Supply Chain Intelligence Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Prediction Results Banner */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-cyan-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  ML Prediction Result
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  {selectedMed}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">{category} • {predictionResult?.model_used}</p>
              </div>

              <div className="flex items-center gap-3">
                <RiskBadge
                  risk={predictionResult?.risk_level}
                  score={predictionResult?.risk_score}
                  size="lg"
                />
              </div>
            </div>

            {/* Core Forecast Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                  Predicted Demand
                </span>
                <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1.5">
                  {predictionResult?.predicted_demand || 0}
                </div>
                <span className="text-2xs text-slate-400 font-medium">
                  95% CI: {predictionResult?.confidence_interval?.lower} - {predictionResult?.confidence_interval?.upper}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                  Current Stock
                </span>
                <div className="text-3xl font-extrabold font-mono text-white mt-1.5">
                  {predictionResult?.current_stock || 0}
                </div>
                <span className="text-2xs text-slate-400 font-medium">
                  Coverage: {predictionResult?.stock_coverage_days} days
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                  Stock Gap
                </span>
                <div className={`text-3xl font-extrabold font-mono mt-1.5 ${
                  (predictionResult?.stock_gap || 0) < 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {predictionResult?.stock_gap > 0 ? `+${predictionResult.stock_gap}` : predictionResult?.stock_gap}
                </div>
                <span className="text-2xs text-slate-400 font-medium">
                  {predictionResult?.stock_gap < 0 ? 'Deficit / Shortage' : 'Surplus Buffer'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-500/40 bg-cyan-950/20">
                <span className="text-xs uppercase tracking-wider text-cyan-300 font-bold">
                  Recommended PO
                </span>
                <div className="text-3xl font-extrabold font-mono text-white mt-1.5">
                  {predictionResult?.reorder_quantity || 0}
                </div>
                <span className="text-2xs text-cyan-300 font-semibold">
                  {predictionResult?.reorder_action}
                </span>
              </div>
            </div>

            {/* AI Explanation & Justification Box */}
            <div className="mt-5 p-4.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
                <Brain className="h-4.5 w-4.5" />
                <span>AI Clinical Intelligence Briefing</span>
              </div>
              <p className="text-sm text-slate-100 leading-relaxed font-normal">
                {predictionResult?.ai_explanation}
              </p>
              <div className="pt-2.5 border-t border-slate-850 flex items-center justify-between text-xs text-slate-300">
                <span>Safety Stock Buffer: <strong className="text-slate-100 font-mono">{predictionResult?.safety_stock} units</strong></span>
                <span>Lead Time Consumption: <strong className="text-slate-100 font-mono">{predictionResult?.lead_time_demand} units</strong></span>
              </div>
            </div>
          </div>

          {/* Time Series Depletion & Replenishment Chart */}
          <div className="rounded-2xl glass-panel p-5.5">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-cyan-400" />
                Dynamic Forward Depletion Simulation (Next 7 Days)
              </h4>
              <span className="text-xs text-slate-400 font-medium">Daily Demand vs Depletion</span>
            </div>

            <div className="h-60 w-full">
              {forecastTimeline ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={forecastTimeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12.5px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12.5px', paddingTop: '6px' }} />
                    <Area
                      type="monotone"
                      dataKey="predicted_demand"
                      name="Forecast Demand"
                      fill="#0ea5e9"
                      fillOpacity={0.2}
                      stroke="#0ea5e9"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="current_stock"
                      name="Simulated Stock Depletion"
                      stroke="#f43f5e"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="safety_stock"
                      name="Safety Stock Threshold"
                      stroke="#f59e0b"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Loading timeline simulation...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;
