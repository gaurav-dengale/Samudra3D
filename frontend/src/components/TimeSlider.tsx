import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { TIMESTAMPS } from '../data/mockOceanData';

interface TimeSliderProps {
  timeIndex: number;
  onChangeTime: (idx: number) => void;
}

const NOW_INDEX = 4;
const SPEEDS = [0.5, 1, 2];

export const TimeSlider: React.FC<TimeSliderProps> = ({ timeIndex, onChangeTime }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onChangeTime((timeIndex + 1) % TIMESTAMPS.length);
    }, 1800 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, timeIndex, speed, onChangeTime]);

  const isNow = timeIndex === NOW_INDEX;
  const isForecast = timeIndex > NOW_INDEX;

  return (
    <div className="glass-bright rounded-xl shadow-2xl text-slate-100 flex flex-col gap-2.5 min-w-[320px] overflow-hidden animate-slide-up">
      {/* Header row */}
      <div className="px-4 pt-3 flex items-center justify-between gap-3">
        {/* Playback controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setIsPlaying(false); onChangeTime(0); }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center shadow-lg
              ${isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/25 hover:scale-105'
              }`}
            title={isPlaying ? 'Pause' : 'Play 4D'}
          >
            {isPlaying
              ? <Pause className="w-4 h-4" />
              : <Play  className="w-4 h-4 ml-0.5" />
            }
          </button>

          <button
            onClick={() => onChangeTime((timeIndex + 1) % TIMESTAMPS.length)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Step forward"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Speed selector */}
          <div className="flex items-center gap-0.5 ml-1 bg-slate-800/60 rounded-lg p-0.5 border border-slate-700/40">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold mono transition
                  ${speed === s ? 'bg-sky-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Current time badge */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-[9px] uppercase tracking-widest text-sky-400 font-bold">4D Forecast</span>
            {isNow && (
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                LIVE
              </span>
            )}
            {isForecast && (
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                FCST
              </span>
            )}
          </div>
          <div className="text-[10px] font-bold text-white mono bg-slate-800/70 px-2 py-0.5 rounded border border-slate-700/60 mt-0.5">
            {TIMESTAMPS[timeIndex]}
          </div>
        </div>
      </div>

      {/* Timeline dots + slider */}
      <div className="px-4 pb-3 space-y-1.5">
        {/* Colored segment track */}
        <div className="relative flex h-1.5 rounded-full overflow-hidden">
          <div className="flex-[4] bg-slate-600/60" title="Hindcast" />
          <div className="w-1 bg-emerald-400" title="Now" />
          <div className="flex-[4] bg-amber-500/40" title="Forecast" />
        </div>

        <input
          type="range"
          min={0}
          max={TIMESTAMPS.length - 1}
          value={timeIndex}
          onChange={(e) => onChangeTime(parseInt(e.target.value, 10))}
          className="w-full cursor-pointer"
        />

        <div className="flex justify-between text-[10px] mono">
          <span className="text-slate-500">−48h Hindcast</span>
          <span className={`font-bold ${isNow ? 'text-emerald-400' : 'text-slate-400'}`}>T=0 Now</span>
          <span className="text-amber-400/80">+48h Forecast</span>
        </div>
      </div>
    </div>
  );
};
