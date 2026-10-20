import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Download,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../api/client';

export const InventoryPage = ({ onNavigateToForecast }) => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [sortField, setSortField] = useState('risk_score');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    loadInventory();
  }, [selectedCategory, selectedRisk, search]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedRisk !== 'All') params.risk = selectedRisk;
      if (search) params.search = search;

      const res = await api.getInventory(params);
      setInventory(res.items);

      // Extract unique categories
      const cats = Array.from(new Set(res.items.map(i => i.category)));
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedItems = [...inventory].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const exportCSV = () => {
    const headers = ['Medicine', 'Category', 'Current Stock', 'Daily Usage', 'Predicted Demand', 'Stock Gap', 'Coverage (Days)', 'Lead Time', 'Reorder Qty', 'Risk Score', 'Status'];
    const rows = sortedItems.map(i => [
      `"${i.medicine}"`,
      `"${i.category}"`,
      i.current_stock,
      i.daily_usage,
      i.predicted_demand,
      i.stock_gap,
      i.stock_coverage_days,
      i.supplier_lead_time,
      i.reorder_quantity,
      i.risk_score,
      i.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medistock_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl glass-panel">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Package className="h-5 w-5" />
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Hospital Inventory & Replenishment Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock monitoring, lead-time vulnerability, and dynamic reorder calculations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInventory}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Refresh Inventory"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sm font-semibold text-white flex items-center gap-2 transition shadow-sm"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 p-4.5 rounded-2xl glass-panel">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-sm font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c} className="bg-slate-900">{c}</option>
            ))}
          </select>
        </div>

        {/* Risk Filter */}
        <div>
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-750 text-sm font-medium text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical (Imminent Stockout)</option>
            <option value="High Risk">High Risk (Reorder Soon)</option>
            <option value="Monitor">Monitor (Stable)</option>
            <option value="Healthy">Healthy (Optimal)</option>
          </select>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between sm:justify-end px-3 py-2 text-sm text-slate-300 font-medium">
          <span>Showing <strong className="text-white font-bold">{sortedItems.length}</strong> of 20 formulary items</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl glass-panel overflow-hidden">
        {loading && sortedItems.length === 0 ? (
          <div className="p-6">
            <SkeletonLoader type="table" count={8} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-xs">
                  <th className="py-4 px-4 cursor-pointer hover:text-white transition" onClick={() => handleSort('medicine')}>
                    <div className="flex items-center gap-1.5">
                      Medicine / Category <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-3 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort('current_stock')}>
                    <div className="flex items-center justify-end gap-1">
                      Current Stock <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-3 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort('predicted_demand')}>
                    <div className="flex items-center justify-end gap-1">
                      Pred. Demand <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-3 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort('stock_coverage_days')}>
                    <div className="flex items-center justify-end gap-1">
                      Coverage (Days) <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-3 text-center cursor-pointer hover:text-white transition" onClick={() => handleSort('supplier_lead_time')}>
                    <div className="flex items-center justify-center gap-1">
                      Lead Time <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-3 text-right cursor-pointer hover:text-white transition" onClick={() => handleSort('reorder_quantity')}>
                    <div className="flex items-center justify-end gap-1">
                      Reorder Qty <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-3 text-center cursor-pointer hover:text-white transition" onClick={() => handleSort('risk_score')}>
                    <div className="flex items-center justify-center gap-1">
                      Risk Score <ArrowUpDown className="h-3.5 w-3.5" />
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sortedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/60 transition group">
                    <td className="py-4 px-4">
                      <div className="font-bold text-white group-hover:text-cyan-300 transition text-sm">
                        {item.medicine}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.category} • ${item.unit_price}/{item.unit}</div>
                    </td>

                    <td className="py-4 px-3 text-right font-mono font-bold text-slate-100">
                      {item.current_stock.toLocaleString()}
                    </td>

                    <td className="py-4 px-3 text-right font-mono font-extrabold text-cyan-400">
                      {item.predicted_demand.toLocaleString()}
                    </td>

                    <td className="py-4 px-3 text-right">
                      <div className="font-mono font-bold text-white">
                        {item.stock_coverage_days} d
                      </div>
                      <div className="w-20 ml-auto bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            item.stock_coverage_days < item.supplier_lead_time
                              ? 'bg-rose-500'
                              : item.stock_coverage_days < item.supplier_lead_time * 2
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.stock_coverage_days / 15) * 100)}%` }}
                        ></div>
                      </div>
                    </td>

                    <td className="py-4 px-3 text-center font-mono font-medium text-slate-300">
                      {item.supplier_lead_time} days
                    </td>

                    <td className="py-4 px-3 text-right font-mono font-extrabold">
                      {item.reorder_quantity > 0 ? (
                        <span className="text-amber-400 font-bold">+{item.reorder_quantity}</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>

                    <td className="py-4 px-3 text-center">
                      <RiskBadge risk={item.risk_level} score={item.risk_score} size="xs" />
                    </td>

                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => onNavigateToForecast(item.medicine)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 font-bold text-slate-200 transition text-xs inline-flex items-center gap-1.5 shadow-sm"
                      >
                        Forecast <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
