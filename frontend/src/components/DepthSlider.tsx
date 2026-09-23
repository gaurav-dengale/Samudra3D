import React from 'react';
import { Layers, Compass } from 'lucide-react';
import { DEPTH_LEVELS } from '../data/mockOceanData';

interface DepthSliderProps {
  depth: number;
  onChangeDepth: (depth: number) => void;
  verticalExaggeration: number;
  onChangeExaggeration: (val: number) => void;
}

const DEPTH_ZONES = [
  { max: 200,  label: 'Epipelagic',   color: 'text-cyan-400',   emoji: '🌊' },
  { max: 1000, label: 'Mesopelagic',  color: 'text-blue-400',   emoji: '🐠' },
  { max: 2000, label: 'Bathypelagic', color: 'text-indigo-400', emoji: '🦑' },
  { max: 9999, label: 'Abyssopelagic',color: 'text-violet-400', emoji: '🐋' },
];

const QUICK_DEPTHS = [0, 50, 100, 200, 500, 1000, 2000];

function getZone(d: number) {
  return DEPTH_ZONES.find((z) => d <= z.max) || DEPTH_ZONES[DEPTH_ZONES.length - 1];
}

export const DepthSlider: React.FC<DepthSliderProps> = ({
  depth,
  onChangeDepth,
  verticalExaggeration,
  onChangeExaggeration,
}) => {
  const zone = getZone(depth);

  return (
    <div className="glass-bright rounded-xl shadow-2xl text-slate-100 flex flex-col gap-2.5 min-w-[270px] overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Depth Slice</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs mono font-bold ${zone.color}`}>{zone.emoji} {zone.label}</span>
          <span className={`text-[11px] font-black mono px-2 py-0.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300`}>
            {depth === 0 ? 'Surface' : `-${depth}m`}
          </span>
        </div>
      </div>

      {/* Depth gradient bar */}
      <div className="px-4">
        <div className="h-1.5 rounded-full mb-1.5 overflow-hidden"
          style={{ background: 'linear-gradient(to right, #22d3ee, #3b82f6, #6366f1, #7c3aed)' }}
        />
        <input
          type="range"
          min={0}
          max={DEPTH_LEVELS.length - 1}
          step={1}
          value={DEPTH_LEVELS.indexOf(depth) >= 0 ? DEPTH_LEVELS.indexOf(depth) : 0}
          onChange={(e) => onChangeDepth(DEPTH_LEVELS[parseInt(e.target.value, 10)])}
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-[9px] mono text-slate-500 mt-0.5">
          <span>0m</span>
          <span>1000m</span>
          <span>2000m</span>
        </div>
      </div>

      {/* Quick depth buttons */}
      <div className="px-3 flex flex-wrap gap-1">
        {QUICK_DEPTHS.map((d) => (
          <button
            key={d}
            onClick={() => onChangeDepth(d)}
            className={`text-[10px] px-2 py-1 rounded-lg transition-all duration-150 mono font-medium border ${
              depth === d
                ? 'bg-sky-500 text-slate-950 font-bold shadow-md border-sky-400'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/60 hover:text-white border-slate-700/40'
            }`}
          >
            {d === 0 ? 'Sfc' : `${d}m`}
          </button>
        ))}
      </div>

      {/* Vertical Exaggeration */}
      <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>V. Exaggeration</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2.5, 5].map((val) => (
            <button
              key={val}
              onClick={() => onChangeExaggeration(val)}
              className={`px-2 py-0.5 rounded-lg text-[11px] mono font-bold transition-all ${
                verticalExaggeration === val
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-800/60 text-slate-500 hover:text-white border border-slate-700/40'
              }`}
            >
              {val}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
