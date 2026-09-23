import React from 'react';
import { OCEAN_VARIABLES } from '../data/mockOceanData';

interface ColorbarLegendProps {
  variable: string;
}

export const ColorbarLegend: React.FC<ColorbarLegendProps> = ({ variable }) => {
  const config = OCEAN_VARIABLES[variable] || OCEAN_VARIABLES.sst;
  const gradient = `linear-gradient(to right, ${config.palette.join(', ')})`;
  const mid = ((config.defaultMin + config.defaultMax) / 2).toFixed(1);

  return (
    <div className="glass-bright rounded-xl shadow-2xl text-slate-100 flex flex-col gap-2 min-w-[240px] overflow-hidden animate-slide-right">
      <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-200">{config.name}</span>
        <span className="text-[10px] font-bold mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded">
          {config.unit}
        </span>
      </div>

      {/* Gradient bar with tick marks */}
      <div className="px-3">
        <div className="relative h-3 rounded-lg border border-slate-700/60 overflow-hidden shadow-inner"
          style={{ background: gradient }}
        />
        {/* Tick marks */}
        <div className="relative h-2 mt-0.5">
          {[0, 25, 50, 75, 100].map((pct) => (
            <div
              key={pct}
              className="absolute top-0 w-px h-1.5 bg-slate-600"
              style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] mono text-slate-400 mt-0.5">
          <span>{config.defaultMin}</span>
          <span>{mid}</span>
          <span>{config.defaultMax}</span>
        </div>
      </div>

      <div className="px-3 pb-2.5 text-[10px] text-slate-500 italic leading-tight">
        {config.description}
      </div>
    </div>
  );
};
