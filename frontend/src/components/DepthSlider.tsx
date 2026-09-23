import React from 'react';
import { Layers, Compass } from 'lucide-react';
import { DEPTH_LEVELS } from '../data/mockOceanData';

interface DepthSliderProps {
  depth: number;
  onChangeDepth: (depth: number) => void;
  verticalExaggeration: number;
  onChangeExaggeration: (val: number) => void;
}

export const DepthSlider: React.FC<DepthSliderProps> = ({
  depth,
  onChangeDepth,
  verticalExaggeration,
  onChangeExaggeration,
}) => {
  return (
    <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-4 rounded-xl shadow-2xl text-slate-100 flex flex-col gap-3 min-w-[280px]">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
          <Layers className="w-4 h-4" />
          <span>3D Water Column Depth Slice</span>
        </div>
        <span className="text-xs bg-sky-500/20 text-sky-300 font-mono px-2 py-0.5 rounded border border-sky-500/30 font-bold">
          {depth === 0 ? 'Surface (0m)' : `-${depth} meters`}
        </span>
      </div>

      {/* Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
          <span>0m (Epipelagic)</span>
          <span>1000m (Mesopelagic)</span>
          <span>2000m (Bathypelagic)</span>
        </div>
        <input
          type="range"
          min={0}
          max={DEPTH_LEVELS.length - 1}
          step={1}
          value={DEPTH_LEVELS.indexOf(depth) >= 0 ? DEPTH_LEVELS.indexOf(depth) : 0}
          onChange={(e) => {
            const idx = parseInt(e.target.value, 10);
            onChangeDepth(DEPTH_LEVELS[idx]);
          }}
          className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />
        <div className="flex flex-wrap gap-1 pt-1 justify-between">
          {[0, 50, 100, 200, 500, 1000, 2000].map((d) => (
            <button
              key={d}
              onClick={() => onChangeDepth(d)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition font-mono ${
                depth === d
                  ? 'bg-sky-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {d === 0 ? 'Sfc' : `${d}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Exaggeration */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Vertical Exaggeration</span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2.5, 5].map((val) => (
            <button
              key={val}
              onClick={() => onChangeExaggeration(val)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                verticalExaggeration === val
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {val}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
