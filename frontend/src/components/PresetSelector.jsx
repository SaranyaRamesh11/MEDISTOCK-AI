import React from 'react';
import { Sparkles } from 'lucide-react';

export const PRESET_SCENARIOS = [
  {
    id: 'winter_flu',
    title: 'Winter Flu Surge (Paracetamol)',
    medicine: 'Paracetamol 500mg',
    category: 'Analgesics & Antipyretics',
    current_stock: 120,
    daily_usage: 210,
    patient_count: 480,
    emergency_cases: 42,
    season: 'Winter',
    holiday: 0,
    supplier_lead_time: 4,
    description: 'High in-patient census with seasonal respiratory infections causing severe stockout pressure.'
  },
  {
    id: 'icu_shortage',
    title: 'ICU Critical Antibiotic Shortage (Ceftriaxone)',
    medicine: 'Ceftriaxone 1g Inj',
    category: 'Antibiotics',
    current_stock: 45,
    daily_usage: 75,
    patient_count: 390,
    emergency_cases: 55,
    season: 'Winter',
    holiday: 1,
    supplier_lead_time: 7,
    description: 'Critical ICU antibiotic with only 0.6 days stock remaining and 7-day supplier fulfillment.'
  },
  {
    id: 'pediatric_asthma',
    title: 'Pediatric Respiratory Spike (Salbutamol)',
    medicine: 'Salbutamol 100mcg Inhaler',
    category: 'Respiratory',
    current_stock: 80,
    daily_usage: 95,
    patient_count: 420,
    emergency_cases: 38,
    season: 'Winter',
    holiday: 0,
    supplier_lead_time: 5,
    description: 'Sudden cold snap driving severe bronchospasm emergency admissions.'
  },
  {
    id: 'chronic_stable',
    title: 'Stable Outpatient Care (Metformin)',
    medicine: 'Metformin 500mg',
    category: 'Antidiabetics',
    current_stock: 850,
    daily_usage: 140,
    patient_count: 350,
    emergency_cases: 15,
    season: 'Spring',
    holiday: 0,
    supplier_lead_time: 4,
    description: 'Predictable maintenance medication with 6.1 days coverage and healthy safety stock.'
  }
];

export const PresetSelector = ({ onSelectPreset, selectedPresetId }) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 shrink-0">
        <Sparkles className="h-4 w-4" /> Demo Presets:
      </span>
      {PRESET_SCENARIOS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelectPreset(preset)}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
            selectedPresetId === preset.id
              ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/60 shadow-sm font-bold'
              : 'bg-slate-900/90 text-slate-200 border-slate-750 hover:bg-slate-800 hover:border-slate-600'
          }`}
          title={preset.description}
        >
          {preset.title.split('(')[0]}
        </button>
      ))}
    </div>
  );
};

export default PresetSelector;
