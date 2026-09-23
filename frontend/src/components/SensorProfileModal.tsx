import React, { useState } from 'react';
import { X, Battery, Activity, MapPin, Download, CheckCircle2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { ArgoFloat } from '../data/mockOceanData';


interface SensorProfileModalProps {
  floatData: ArgoFloat | null;
  onClose: () => void;
}

export const SensorProfileModal: React.FC<SensorProfileModalProps> = ({ floatData, onClose }) => {
  const [activeTab, setActiveTab] = useState<'temperature' | 'salinity' | 'oxygen'>('temperature');

  if (!floatData) return null;

  // Prepare chart data with Depth as vertical inverted concept
  const chartData = floatData.profiles.map((p) => ({
    depth: p.depth,
    observed: activeTab === 'temperature' ? p.temperature : activeTab === 'salinity' ? p.salinity : (p.oxygen || 0),
    // Simulate ROMS numerical model output to show Model vs Observation correlation
    modelForecast:
      activeTab === 'temperature'
        ? Number((p.temperature + (Math.sin(p.depth / 200) * 0.4)).toFixed(2))
        : activeTab === 'salinity'
        ? Number((p.salinity + (Math.cos(p.depth / 150) * 0.15)).toFixed(2))
        : Number(((p.oxygen || 0) + (Math.sin(p.depth / 300) * 8)).toFixed(1)),
  }));

  // Calculate Mean Absolute Error (Model vs In-situ)
  const mae = (
    chartData.reduce((acc, curr) => acc + Math.abs(curr.observed - curr.modelForecast), 0) /
    chartData.length
  ).toFixed(2);

  const unit = activeTab === 'temperature' ? '°C' : activeTab === 'salinity' ? 'PSU' : 'µmol/kg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-sky-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-850 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">{floatData.id}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {floatData.platform}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                  WMO #{floatData.wmoNumber}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-1 font-mono">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-sky-400" />
                  {floatData.lat}°N, {floatData.lon}°E
                </span>
                <span>•</span>
                <span>Cycle #{floatData.cycleNumber}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Battery className="w-3 h-3" /> {floatData.batteryPercent}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison KPI Banner */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-center font-mono">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Max Sounding Depth</div>
            <div className="text-sm font-bold text-sky-400">{floatData.maxDepth} meters</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Model vs In-Situ MAE</div>
            <div className="text-sm font-bold text-emerald-400">±{mae} {unit}</div>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Quality Control (QC)</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Passed (Flag 1)
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 bg-slate-900/40">
          {(['temperature', 'salinity', 'oxygen'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold capitalize transition border-b-2 ${
                activeTab === tab
                  ? 'border-sky-400 text-sky-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'temperature' ? 'Temperature Profile' : tab === 'salinity' ? 'Salinity Profile' : 'Dissolved Oxygen'}
            </button>
          ))}
        </div>

        {/* Vertical Profile Chart (Depth vs Parameter) */}
        <div className="p-4 flex-1 flex flex-col min-h-[280px]">
          <div className="text-xs text-slate-400 mb-2 flex items-center justify-between">
            <span>In-situ Sensor Sounding vs. ROMS / INCOIS Model Grid</span>
            <span className="text-[11px] font-mono text-slate-400">Y-axis: Depth (m)</span>
          </div>

          <div className="flex-1 w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  domain={['auto', 'auto']}
                  unit={unit}
                />
                <YAxis
                  dataKey="depth"
                  type="number"
                  reversed={true} // Inverted so 0m is at top and 2000m is at bottom
                  stroke="#94a3b8"
                  tick={{ fontSize: 11 }}
                  unit="m"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#38bdf8',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} ${unit}`]}
                  labelFormatter={(label) => `Depth: -${label}m`}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line
                  type="monotone"
                  dataKey="observed"
                  name="In-Situ Sensor (Observed)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#38bdf8' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="modelForecast"
                  name="ROMS Model (Predicted)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            Source: INCOIS National Argo Data Centre (CF / NetCDF-4)
          </div>
          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(floatData, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `${floatData.id}_profile.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export Profile JSON
          </button>
        </div>
      </div>
    </div>
  );
};
