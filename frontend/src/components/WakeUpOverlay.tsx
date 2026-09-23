import React from 'react';
import { Waves } from 'lucide-react';

interface WakeUpOverlayProps {
  isVisible: boolean;
}

export const WakeUpOverlay: React.FC<WakeUpOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center animate-fade-in"
      style={{ background: 'radial-gradient(ellipse at center, #0c1a2e 0%, #030712 70%)' }}
    >
      {/* Animated ocean rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full border border-sky-500/10"
            style={{
              width: `${200 + i * 160}px`,
              height: `${200 + i * 160}px`,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `pulseGlow ${2 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="relative flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-indigo-500 flex items-center justify-center shadow-2xl glow-sky animate-breathe">
          <Waves className="w-10 h-10 text-white" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black tracking-wider">
            <span className="shimmer-text">SAMUDRA 3D</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Interactive 3D Ocean Intelligence Platform</p>
        </div>

        {/* Wave bars loading */}
        <div className="flex items-end gap-1.5" style={{ height: '32px' }}>
          {[28, 18, 32, 14, 24].map((h, i) => (
            <span
              key={i}
              className="wave-bar"
              style={{ height: `${h}px`, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <p className="text-amber-400 text-xs font-medium mono animate-pulse">
          ⏳ Waking backend server — first load may take ~30 seconds
        </p>
        <p className="text-slate-500 text-[11px]">Render free-tier cold start</p>
      </div>
    </div>
  );
};
