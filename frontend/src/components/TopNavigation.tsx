import React, { useState } from 'react';
import { Waves, AlertTriangle, ShieldCheck, Fish, LifeBuoy, FileSpreadsheet, Menu, X } from 'lucide-react';
import { BackendStatus } from './BackendStatus';

interface TopNavigationProps {
  activePreset: 'general' | 'cyclone' | 'fisheries' | 'sar';
  onSelectPreset: (preset: 'general' | 'cyclone' | 'fisheries' | 'sar') => void;
  onOpenDataModal: () => void;
  onBackendWaking?: (isWaking: boolean) => void;
}

const PRESETS = [
  { id: 'general'  as const, label: 'General',       shortLabel: 'Ocean',     icon: ShieldCheck,    activeClass: 'bg-sky-500 text-slate-950',     iconClass: 'text-sky-400' },
  { id: 'cyclone'  as const, label: 'Cyclone Track',  shortLabel: 'Cyclone',   icon: AlertTriangle,  activeClass: 'bg-red-500 text-white',          iconClass: 'text-red-400' },
  { id: 'fisheries'as const, label: 'PFZ Fisheries',  shortLabel: 'Fisheries', icon: Fish,           activeClass: 'bg-emerald-500 text-slate-950',  iconClass: 'text-emerald-400' },
  { id: 'sar'      as const, label: 'SAR Drift',      shortLabel: 'SAR',       icon: LifeBuoy,       activeClass: 'bg-amber-500 text-slate-950',    iconClass: 'text-amber-400' },
];

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activePreset,
  onSelectPreset,
  onOpenDataModal,
  onBackendWaking,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative h-14 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0"
      style={{ boxShadow: '0 1px 0 rgba(56,189,248,0.06), 0 4px 24px rgba(0,0,0,0.4)' }}
    >
      {/* Subtle gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg glow-sky">
          <Waves className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black text-white tracking-wider leading-none">
              SAMUDRA <span className="shimmer-text">3D</span>
            </h1>
            <span className="hidden lg:inline text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/25 mono">
              SIH 2026 · PS 26067
            </span>
            <span className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mono">
              Burning Hammer
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-none mt-0.5 hidden md:block">
            3D Numerical Ocean Model & In-Situ Platform
          </p>
        </div>
      </div>

      {/* ── Preset Buttons (desktop) ── */}
      <div className="hidden md:flex items-center bg-slate-900/80 border border-slate-800/80 p-0.5 rounded-xl gap-0.5">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          const isActive = activePreset === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p.id)}
              title={p.label}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all duration-200
                ${isActive ? `${p.activeClass} shadow-md scale-[1.02]` : `text-slate-400 hover:text-white hover:bg-slate-800/60`}
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? '' : p.iconClass}`} />
              <span className="hidden lg:inline">{p.label}</span>
              <span className="lg:hidden">{p.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-2 shrink-0">
        <BackendStatus onWaking={onBackendWaking} />

        <button
          onClick={onOpenDataModal}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20 transition-all duration-200 hover:shadow-sky-500/30 hover:scale-[1.02]"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ingest Data</span>
          <span className="md:hidden">Ingest</span>
        </button>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 glass-bright border-b border-slate-800 p-3 flex flex-col gap-2 animate-slide-down md:hidden">
          <div className="grid grid-cols-2 gap-1.5">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              const isActive = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { onSelectPreset(p.id); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition
                    ${isActive ? `${p.activeClass} shadow` : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {p.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => { onOpenDataModal(); setMobileMenuOpen(false); }}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-semibold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Ingest NetCDF / In-Situ Data
          </button>
        </div>
      )}
    </header>
  );
};
