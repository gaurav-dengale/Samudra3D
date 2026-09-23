import React from 'react';
import { Palette } from 'lucide-react';
import { OCEAN_VARIABLES } from '../data/mockOceanData';

interface ColorbarLegendProps {
  variable: string;
}

export const ColorbarLegend: React.FC<ColorbarLegendProps> = ({ variable }) => {
  const config = OCEAN_VARIABLES[variable] || OCEAN_VARIABLES.sst;

  const gradientString = `linear-gradient(to right, ${config.palette.join(', ')})`;

  return (
    <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-3 rounded-xl shadow-2xl text-slate-100 flex flex-col gap-1.5 min-w-[240px]">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <Palette className="w-3.5 h-3.5 text-sky-400" />
          <span>{config.name}</span>
        </div>
        <span className="text-[11px] font-mono text-sky-400 font-bold">[{config.unit}]</span>
      </div>

      {/* Gradient Bar */}
      <div
        className="w-full h-3.5 rounded border border-slate-700 shadow-inner"
        style={{ background: gradientString }}
      />

      {/* Dynamic Min / Max scale */}
      <div className="flex justify-between text-[10px] font-mono text-slate-400">
        <span>{config.defaultMin} {config.unit}</span>
        <span>{((config.defaultMin + config.defaultMax) / 2).toFixed(1)}</span>
        <span>{config.defaultMax} {config.unit}</span>
      </div>

      <div className="text-[9px] text-slate-400 italic text-center">
        {config.description}
      </div>
    </div>
  );
};
