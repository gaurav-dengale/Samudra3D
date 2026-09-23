import React from 'react';
import { Thermometer, Droplet, Wind, Sprout, Waves } from 'lucide-react';
import { OCEAN_VARIABLES } from '../data/mockOceanData';

interface VariableControlProps {
  selectedVariable: string;
  onSelectVariable: (varId: string) => void;
  showCurrentVectors: boolean;
  onToggleVectors: () => void;
}

const VARIABLE_META: Record<string, { icon: React.ReactNode; gradient: string; glow: string }> = {
  sst: {
    icon: <Thermometer className="w-4 h-4" />,
    gradient: 'from-orange-950/60 to-red-950/40',
    glow: 'border-red-500/50 shadow-red-500/10',
  },
  salinity: {
    icon: <Droplet className="w-4 h-4" />,
    gradient: 'from-cyan-950/60 to-sky-950/40',
    glow: 'border-cyan-500/50 shadow-cyan-500/10',
  },
  currents: {
    icon: <Wind className="w-4 h-4" />,
    gradient: 'from-sky-950/60 to-blue-950/40',
    glow: 'border-sky-500/50 shadow-sky-500/10',
  },
  chlorophyll: {
    icon: <Sprout className="w-4 h-4" />,
    gradient: 'from-emerald-950/60 to-green-950/40',
    glow: 'border-emerald-500/50 shadow-emerald-500/10',
  },
  ssh: {
    icon: <Waves className="w-4 h-4" />,
    gradient: 'from-indigo-950/60 to-violet-950/40',
    glow: 'border-indigo-500/50 shadow-indigo-500/10',
  },
};

const ICON_COLORS: Record<string, string> = {
  sst:         'text-orange-400',
  salinity:    'text-cyan-400',
  currents:    'text-sky-400',
  chlorophyll: 'text-emerald-400',
  ssh:         'text-indigo-400',
};

export const VariableControl: React.FC<VariableControlProps> = ({
  selectedVariable,
  onSelectVariable,
  showCurrentVectors,
  onToggleVectors,
}) => {
  return (
    <div className="glass-bright rounded-xl shadow-2xl text-slate-100 flex flex-col gap-2 min-w-[260px] overflow-hidden animate-slide-right">
      {/* Header */}
      <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">Variable</span>
        <span className="text-[9px] text-slate-500 mono">CF-1.8</span>
      </div>

      <div className="px-2 pb-1 flex flex-col gap-1">
        {Object.values(OCEAN_VARIABLES).map((v) => {
          const isSelected = selectedVariable === v.id;
          const meta = VARIABLE_META[v.id] || VARIABLE_META.sst;
          const iconColor = ICON_COLORS[v.id] || 'text-sky-400';

          return (
            <button
              key={v.id}
              onClick={() => onSelectVariable(v.id)}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all duration-200 text-left border
                ${isSelected
                  ? `bg-gradient-to-r ${meta.gradient} ${meta.glow} shadow-md font-semibold`
                  : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:bg-slate-800/70 hover:border-slate-600/50 hover:text-slate-200'
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <span className={`${iconColor} transition-colors`}>{meta.icon}</span>
                <div>
                  <div className={`leading-none ${isSelected ? 'text-white' : ''}`}>{v.name}</div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5 mono">{v.unit}</div>
                </div>
              </div>
              {isSelected && (
                <span className={`w-2 h-2 rounded-full ${iconColor.replace('text-', 'bg-')} shadow-sm animate-pulse-glow`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Vector toggle */}
      <div className="mx-2 mb-2 px-3 py-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="flex items-center gap-2 text-xs text-slate-300">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span>Animated Streamlines</span>
          </span>
          <div
            onClick={onToggleVectors}
            className={`relative w-8 h-4 rounded-full transition-colors duration-200 cursor-pointer ${
              showCurrentVectors ? 'bg-sky-500' : 'bg-slate-700'
            }`}
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform duration-200 ${
              showCurrentVectors ? 'translate-x-4' : 'translate-x-0.5'
            }`} />
          </div>
        </label>
      </div>
    </div>
  );
};
