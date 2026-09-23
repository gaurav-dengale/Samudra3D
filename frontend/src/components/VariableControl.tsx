import React from 'react';
import { Thermometer, Droplet, Wind, Sprout, Waves } from 'lucide-react';
import { OCEAN_VARIABLES } from '../data/mockOceanData';

interface VariableControlProps {
  selectedVariable: string;
  onSelectVariable: (varId: string) => void;
  showCurrentVectors: boolean;
  onToggleVectors: () => void;
}

export const VariableControl: React.FC<VariableControlProps> = ({
  selectedVariable,
  onSelectVariable,
  showCurrentVectors,
  onToggleVectors,
}) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'sst':
        return <Thermometer className="w-4 h-4 text-red-400" />;
      case 'salinity':
        return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'currents':
        return <Wind className="w-4 h-4 text-sky-400" />;
      case 'chlorophyll':
        return <Sprout className="w-4 h-4 text-emerald-400" />;
      case 'ssh':
        return <Waves className="w-4 h-4 text-indigo-400" />;
      default:
        return <Waves className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-xl shadow-2xl text-slate-100 flex flex-col gap-2 min-w-[260px]">
      <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center justify-between">
        <span>Oceanographic Variable</span>
        <span className="text-[10px] text-slate-400 font-mono">CF-1.8 Compliant</span>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {Object.values(OCEAN_VARIABLES).map((v) => {
          const isSelected = selectedVariable === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onSelectVariable(v.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition border text-left ${
                isSelected
                  ? 'bg-sky-950/70 border-sky-400 text-sky-200 font-semibold shadow-inner'
                  : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/70 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {getIcon(v.id)}
                <div>
                  <div className="leading-none">{v.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight mt-0.5">{v.unit}</div>
                </div>
              </div>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow" />}
            </button>
          );
        })}
      </div>

      {/* Vector Streamline Particle Flow Toggle */}
      <div className="pt-2 border-t border-slate-800">
        <label className="flex items-center justify-between cursor-pointer text-xs text-slate-300 hover:text-white select-none">
          <span className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-sky-400" />
            <span>Animated Streamlines</span>
          </span>
          <input
            type="checkbox"
            checked={showCurrentVectors}
            onChange={onToggleVectors}
            className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};
