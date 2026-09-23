import React from 'react';
import { Waves, AlertTriangle, ShieldCheck, Fish, LifeBuoy, FileSpreadsheet } from 'lucide-react';

interface TopNavigationProps {
  activePreset: 'general' | 'cyclone' | 'fisheries' | 'sar';
  onSelectPreset: (preset: 'general' | 'cyclone' | 'fisheries' | 'sar') => void;
  onOpenDataModal: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activePreset,
  onSelectPreset,
  onOpenDataModal,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between z-20">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Waves className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-white tracking-wider flex items-center gap-1.5">
              SAMUDRA <span className="text-sky-400">3D</span>
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
              SIH 2026 • PS 26067
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Team Burning Hammer
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Interactive 3D Numerical Ocean Model & In-Situ Observation Platform
          </p>
        </div>
      </div>

      {/* Preset Operation Scenarios */}
      <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl gap-1">
        <button
          onClick={() => onSelectPreset('general')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activePreset === 'general'
              ? 'bg-sky-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          General Ocean State
        </button>

        <button
          onClick={() => onSelectPreset('cyclone')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activePreset === 'cyclone'
              ? 'bg-red-500 text-white font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          Disaster (Cyclone Tracking)
        </button>

        <button
          onClick={() => onSelectPreset('fisheries')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activePreset === 'fisheries'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Fish className="w-3.5 h-3.5 text-emerald-400" />
          PFZ / Fisheries
        </button>

        <button
          onClick={() => onSelectPreset('sar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            activePreset === 'sar'
              ? 'bg-amber-500 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
          Search & Rescue Drift
        </button>
      </div>

      {/* Action / Data Ingestion trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenDataModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/25 transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Ingest NetCDF / In-Situ Data
        </button>
      </div>
    </header>
  );
};
