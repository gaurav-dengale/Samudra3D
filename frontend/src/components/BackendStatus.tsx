import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

type Status = 'checking' | 'online' | 'waking' | 'offline';

interface BackendStatusProps {
  onWaking?: (isWaking: boolean) => void;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ onWaking }) => {
  const [status, setStatus] = useState<Status>('checking');
  const [floatsCount, setFloatsCount] = useState<number | null>(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          setStatus('online');
          setFloatsCount(data.floats_count ?? null);
          onWaking?.(false);
        } else {
          throw new Error('not ok');
        }
      } catch {
        attempts++;
        if (attempts === 1) {
          setStatus('waking');
          onWaking?.(true);
        }
        if (attempts < maxAttempts) {
          setTimeout(check, 5000);
        } else {
          setStatus('offline');
          onWaking?.(false);
        }
      }
    };

    check();
  }, []);

  const configs = {
    checking: {
      dot: 'bg-slate-400 animate-pulse',
      text: 'text-slate-400',
      label: 'Connecting...',
      icon: <Loader className="w-3 h-3 animate-spin-slow" />,
      border: 'border-slate-600/40',
    },
    online: {
      dot: 'bg-emerald-400 animate-breathe',
      text: 'text-emerald-400',
      label: `API Online${floatsCount !== null ? ` • ${floatsCount} sensors` : ''}`,
      icon: <Wifi className="w-3 h-3" />,
      border: 'border-emerald-500/30',
    },
    waking: {
      dot: 'bg-amber-400 animate-pulse',
      text: 'text-amber-400',
      label: 'Waking backend...',
      icon: <Loader className="w-3 h-3 animate-spin-slow" />,
      border: 'border-amber-500/30',
    },
    offline: {
      dot: 'bg-red-400',
      text: 'text-red-400',
      label: 'API Offline',
      icon: <WifiOff className="w-3 h-3" />,
      border: 'border-red-500/30',
    },
  };

  const c = configs[status];

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${c.border} bg-slate-900/60`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`flex items-center gap-1 text-[10px] font-medium mono ${c.text}`}>
        {c.icon}
        {c.label}
      </span>
    </div>
  );
};
