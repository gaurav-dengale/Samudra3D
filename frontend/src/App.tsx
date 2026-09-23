import { useState, useEffect } from 'react';
import { OceanGlobe } from './components/OceanGlobe';
import { DepthSlider } from './components/DepthSlider';
import { TimeSlider } from './components/TimeSlider';
import { VariableControl } from './components/VariableControl';
import { ColorbarLegend } from './components/ColorbarLegend';
import { TopNavigation } from './components/TopNavigation';
import { SensorProfileModal } from './components/SensorProfileModal';
import { DataIngestionModal } from './components/DataIngestionModal';
import { WakeUpOverlay } from './components/WakeUpOverlay';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import {
  MOCK_ARGO_FLOATS,
  type ArgoFloat,
  OCEAN_VARIABLES
} from './data/mockOceanData';
import { fetchFloats } from './services/api';
import {
  Radio, AlertOctagon, Info, Zap,
  Layers, Thermometer, Clock, X, ChevronUp
} from 'lucide-react';

type Platform = 'all' | 'Argo' | 'Glider' | 'CTD Mooring';
type MobilePanel = null | 'variable' | 'sensors' | 'depth' | 'time';

export function App() {
  const [variable, setVariable] = useState<string>('sst');
  const [depth, setDepth] = useState<number>(0);
  const [timeIndex, setTimeIndex] = useState<number>(4);
  const [verticalExaggeration, setVerticalExaggeration] = useState<number>(1);
  const [showCurrentVectors, setShowCurrentVectors] = useState<boolean>(true);
  const [selectedFloat, setSelectedFloat] = useState<ArgoFloat | null>(null);
  const [activePreset, setActivePreset] = useState<'general' | 'cyclone' | 'fisheries' | 'sar'>('general');
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [argoFloats, setArgoFloats] = useState<ArgoFloat[]>(MOCK_ARGO_FLOATS);
  const [isBackendWaking, setIsBackendWaking] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<Platform>('all');
  // Mobile: which bottom drawer is open
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);

  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetchFloats()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setArgoFloats(res.data as ArgoFloat[]);
          showToast('success', 'Live data loaded', `${res.data.length} sensors fetched`);
        }
      })
      .catch(() => setArgoFloats(MOCK_ARGO_FLOATS));
  }, []);

  const handleSelectPreset = (preset: 'general' | 'cyclone' | 'fisheries' | 'sar') => {
    setActivePreset(preset);
    if (preset === 'cyclone') {
      setVariable('ssh'); setDepth(0); setShowCurrentVectors(true);
      showToast('warning', 'Cyclone Mode', 'SSH anomalies highlighted in Bay of Bengal');
    } else if (preset === 'fisheries') {
      setVariable('chlorophyll'); setDepth(25);
      showToast('info', 'PFZ Mode', 'Chlorophyll-a fronts highlighted');
    } else if (preset === 'sar') {
      setVariable('currents'); setDepth(0); setShowCurrentVectors(true);
      showToast('info', 'SAR Mode', 'Surface current drift vectors active');
    } else {
      setVariable('sst'); setDepth(0);
    }
  };

  const toggleMobilePanel = (panel: MobilePanel) =>
    setMobilePanel((prev) => (prev === panel ? null : panel));

  const filteredFloats = platformFilter === 'all'
    ? argoFloats
    : argoFloats.filter((f) => f.platform === platformFilter);

  const PLATFORM_TABS: { id: Platform; label: string; dot: string }[] = [
    { id: 'all',          label: 'All',     dot: 'bg-slate-400' },
    { id: 'Argo',         label: 'Argo',    dot: 'bg-amber-400' },
    { id: 'Glider',       label: 'Glider',  dot: 'bg-emerald-400' },
    { id: 'CTD Mooring',  label: 'Mooring', dot: 'bg-pink-400' },
  ];

  // Sensor panel content (shared between mobile drawer & desktop panel)
  const SensorPanel = () => (
    <div className="flex flex-col gap-0 overflow-hidden h-full">
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-800/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Live In-Situ Network ({argoFloats.length})</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>
      {/* Platform filter */}
      <div className="flex border-b border-slate-800/60 bg-slate-900/40 shrink-0">
        {PLATFORM_TABS.map((tab) => {
          const count = tab.id === 'all' ? argoFloats.length : argoFloats.filter(f => f.platform === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setPlatformFilter(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold transition border-b-2 ${
                platformFilter === tab.id
                  ? 'border-sky-400 text-sky-300 bg-sky-500/5'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />
              {tab.label}
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>
      {/* Float list */}
      <div className="p-2 space-y-1.5 overflow-y-auto flex-1">
        {filteredFloats.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-6">No sensors for this filter</div>
        ) : filteredFloats.map((f) => {
          const isSel = selectedFloat?.id === f.id;
          return (
            <div
              key={f.id}
              onClick={() => { setSelectedFloat(f); setMobilePanel(null); }}
              className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                isSel
                  ? 'bg-sky-950/60 border-sky-400/60 text-sky-200 shadow-md glow-sky'
                  : 'bg-slate-800/40 border-slate-700/30 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold flex items-center gap-1.5 text-[11px]">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      f.platform === 'Argo' ? 'bg-amber-400' :
                      f.platform === 'Glider' ? 'bg-emerald-400' : 'bg-pink-400'
                    }`} />
                    {f.id}
                  </div>
                  <div className="text-[10px] text-slate-500 mono mt-0.5">
                    {f.lat.toFixed(1)}°N {f.lon.toFixed(1)}°E · {f.maxDepth}m
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    f.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    f.status === 'profiling' ? 'bg-sky-500/20 text-sky-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {f.status}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5 flex items-center gap-0.5 justify-end">
                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                    {f.batteryPercent}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col select-none overflow-hidden font-sans">
      <WakeUpOverlay isVisible={isBackendWaking} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <TopNavigation
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onBackendWaking={setIsBackendWaking}
      />

      {/* ═══════════════════════ MAIN VIEWPORT ═══════════════════════ */}
      <div className="relative flex-1 w-full overflow-hidden">
        <OceanGlobe
          variable={variable}
          depth={depth}
          timeIndex={timeIndex}
          selectedFloat={selectedFloat}
          onSelectFloat={(f) => setSelectedFloat(f)}
          floats={filteredFloats}
          showCurrentVectors={showCurrentVectors}
          verticalExaggeration={verticalExaggeration}
          palette={OCEAN_VARIABLES[variable]?.palette || []}
        />

        {/* ─── DESKTOP LEFT PANEL ─── */}
        <div className="hidden md:flex absolute top-4 left-4 z-10 flex-col gap-2.5 max-w-[280px]">
          <VariableControl
            selectedVariable={variable}
            onSelectVariable={(v) => setVariable(v)}
            showCurrentVectors={showCurrentVectors}
            onToggleVectors={() => setShowCurrentVectors(!showCurrentVectors)}
          />
          <ColorbarLegend variable={variable} />
        </div>

        {/* ─── DESKTOP RIGHT PANEL ─── */}
        <div className="hidden md:flex absolute top-4 right-4 z-10 flex-col gap-2.5 max-w-[300px]">
          <div className="glass-bright rounded-xl shadow-2xl text-slate-100 flex flex-col overflow-hidden" style={{ maxHeight: '360px' }}>
            <SensorPanel />
          </div>
          {activePreset === 'cyclone' && (
            <div className="glass-bright border border-red-500/40 p-3 rounded-xl text-xs shadow-2xl glow-red flex flex-col gap-1.5 animate-slide-down">
              <div className="font-bold flex items-center gap-1.5 text-red-400">
                <AlertOctagon className="w-4 h-4 animate-bounce" /> Cyclone Advisory
              </div>
              <p className="text-[11px] text-red-300/80 leading-relaxed">SSH anomalies highlighted in Bay of Bengal. Thermocline shallowing detected.</p>
            </div>
          )}
          {activePreset === 'fisheries' && (
            <div className="glass-bright border border-emerald-500/40 p-3 rounded-xl text-xs shadow-2xl glow-emerald flex flex-col gap-1.5 animate-slide-down">
              <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Info className="w-4 h-4" /> PFZ Advisories Active
              </div>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">High chlorophyll-a front along SW coast upwelling zone.</p>
            </div>
          )}
          {activePreset === 'sar' && (
            <div className="glass-bright border border-amber-500/40 p-3 rounded-xl text-xs shadow-2xl flex flex-col gap-1.5 animate-slide-down">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <Radio className="w-4 h-4 animate-pulse" /> SAR Drift Active
              </div>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">Surface current drift vectors for rescue trajectory estimation.</p>
            </div>
          )}
        </div>

        {/* ─── DESKTOP BOTTOM CONTROLS ─── */}
        <div className="hidden md:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-10 items-end gap-3 max-w-[95vw]">
          <DepthSlider
            depth={depth}
            onChangeDepth={(d) => setDepth(d)}
            verticalExaggeration={verticalExaggeration}
            onChangeExaggeration={(v) => setVerticalExaggeration(v)}
          />
          <TimeSlider timeIndex={timeIndex} onChangeTime={(t) => setTimeIndex(t)} />
        </div>

        {/* ─── DESKTOP hint ─── */}
        <div className="hidden md:flex absolute bottom-4 left-4 z-10 text-[9px] text-slate-600 mono items-center gap-2">
          <span>Drag: Rotate</span><span>·</span>
          <span>Scroll: Zoom</span><span>·</span>
          <span>Click sensor: Profile</span>
        </div>

        {/* ══════════════════════════════════════════════════════
            MOBILE DRAWERS — slide up from bottom
        ══════════════════════════════════════════════════════ */}

        {/* Backdrop */}
        {mobilePanel && (
          <div
            className="md:hidden fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobilePanel(null)}
          />
        )}

        {/* Variable drawer */}
        {mobilePanel === 'variable' && (
          <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 px-3 pb-2 animate-slide-up">
            <div className="glass-bright rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/60">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Variable</span>
                <button onClick={() => setMobilePanel(null)} className="text-slate-400 hover:text-white transition"><X className="w-4 h-4" /></button>
              </div>
              <VariableControl
                selectedVariable={variable}
                onSelectVariable={(v) => { setVariable(v); setMobilePanel(null); }}
                showCurrentVectors={showCurrentVectors}
                onToggleVectors={() => setShowCurrentVectors(!showCurrentVectors)}
              />
            </div>
          </div>
        )}

        {/* Sensor drawer */}
        {mobilePanel === 'sensors' && (
          <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 px-3 pb-2 animate-slide-up">
            <div className="glass-bright rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '70vh' }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/60">
                <span className="text-xs font-bold text-emerald-400">Live Sensors</span>
                <button onClick={() => setMobilePanel(null)} className="text-slate-400 hover:text-white transition"><X className="w-4 h-4" /></button>
              </div>
              <div style={{ maxHeight: 'calc(70vh - 48px)', overflow: 'hidden' }}>
                <SensorPanel />
              </div>
            </div>
          </div>
        )}

        {/* Depth drawer */}
        {mobilePanel === 'depth' && (
          <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 px-3 pb-2 animate-slide-up">
            <div className="glass-bright rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/60">
                <span className="text-xs font-bold text-sky-400">Depth Slice</span>
                <button onClick={() => setMobilePanel(null)} className="text-slate-400 hover:text-white transition"><X className="w-4 h-4" /></button>
              </div>
              <DepthSlider
                depth={depth}
                onChangeDepth={(d) => setDepth(d)}
                verticalExaggeration={verticalExaggeration}
                onChangeExaggeration={(v) => setVerticalExaggeration(v)}
              />
            </div>
          </div>
        )}

        {/* Time drawer */}
        {mobilePanel === 'time' && (
          <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 px-3 pb-2 animate-slide-up">
            <div className="glass-bright rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800/60">
                <span className="text-xs font-bold text-sky-400">4D Time Control</span>
                <button onClick={() => setMobilePanel(null)} className="text-slate-400 hover:text-white transition"><X className="w-4 h-4" /></button>
              </div>
              <TimeSlider timeIndex={timeIndex} onChangeTime={(t) => setTimeIndex(t)} />
            </div>
          </div>
        )}

        {/* ─── MOBILE BOTTOM TOOLBAR ─── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-slate-800/80"
          style={{ background: 'rgba(8,12,26,0.95)', backdropFilter: 'blur(20px)' }}
        >
          {[
            { id: 'variable' as MobilePanel, icon: <Thermometer className="w-5 h-5" />, label: 'Variable', active: 'text-sky-400' },
            { id: 'sensors'  as MobilePanel, icon: <Radio       className="w-5 h-5" />, label: `Sensors (${argoFloats.length})`, active: 'text-emerald-400' },
            { id: 'depth'    as MobilePanel, icon: <Layers      className="w-5 h-5" />, label: 'Depth',    active: 'text-cyan-400' },
            { id: 'time'     as MobilePanel, icon: <Clock       className="w-5 h-5" />, label: 'Time',     active: 'text-amber-400' },
          ].map((btn) => {
            const isActive = mobilePanel === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => toggleMobilePanel(btn.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all text-[10px] font-semibold ${
                  isActive ? btn.active : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  {btn.icon}
                </span>
                <span>{btn.label}</span>
                {isActive && (
                  <ChevronUp className="w-2.5 h-2.5 animate-bounce" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <SensorProfileModal floatData={selectedFloat} onClose={() => setSelectedFloat(null)} />
      <DataIngestionModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        onSuccess={(msg) => showToast('success', 'Ingestion Complete', msg)}
        onError={(msg) => showToast('error', 'Upload Failed', msg)}
      />
    </div>
  );
}

export default App;
