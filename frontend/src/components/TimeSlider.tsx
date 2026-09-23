import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';
import { TIMESTAMPS } from '../data/mockOceanData';

interface TimeSliderProps {
  timeIndex: number;
  onChangeTime: (idx: number) => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({ timeIndex, onChangeTime }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onChangeTime((timeIndex + 1) % TIMESTAMPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, timeIndex, onChangeTime]);

  return (
    <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-4 rounded-xl shadow-2xl text-slate-100 flex flex-col gap-2.5 min-w-[340px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center justify-center shadow-lg shadow-sky-500/20"
            title={isPlaying ? 'Pause 4D animation' : 'Play 4D animation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              onChangeTime(0);
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Reset to beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onChangeTime((timeIndex + 1) % TIMESTAMPS.length)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Step Forward"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-sky-400 font-semibold">4D Numerical Forecast</div>
          <div className="text-xs font-mono font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            {TIMESTAMPS[timeIndex]}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={TIMESTAMPS.length - 1}
          value={timeIndex}
          onChange={(e) => onChangeTime(parseInt(e.target.value, 10))}
          className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>-48h Hindcast</span>
          <span className="text-emerald-400">Now (T=0)</span>
          <span className="text-amber-400">+48h Forecast</span>
        </div>
      </div>
    </div>
  );
};
