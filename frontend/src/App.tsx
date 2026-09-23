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
import { Radio, AlertOctagon, Info, Zap } from 'lucide-react';

type Platform = 'all' | 'Argo' | 'Glider' | 'CTD Mooring';

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

  const { toasts, showToast, removeToast } = useToast();

  // Fetch live floats from backend
  useEffect(() => {
    fetchFloats()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setArgoFloats(res.data as ArgoFloat[]);
          showToast('success', 'Live data loaded', `${res.data.length} sensors fetched from backend`);
        }
      })
      .catch(() => {
        setArgoFloats(MOCK_ARGO_FLOATS);
      });
  }, []);

  const handleSelectPreset = (preset: 'general' | 'cyclone' | 'fisheries' | 'sar') => {
    setActivePreset(preset);
    if (preset === 'cyclone') {
      setVariable('ssh');
      setDepth(0);
      setShowCurrentVectors(true);
      showToast('warning', 'Cyclone Mode Active', 'SSH anomalies highlighted in Bay of Bengal');
    } else if (preset === 'fisheries') {
      setVariable('chlorophyll');
      setDepth(25);
      showToast('info', 'PFZ Mode Active', 'Chlorophyll-a fronts and upwelling zones highlighted');
    } else if (preset === 'sar') {
      setVariable('currents');
      setDepth(0);
      setShowCurrentVectors(true);
      showToast('info', 'SAR Mode Active', 'Surface current drift vectors for rescue operations');
    } else {
      setVariable('sst');
      setDepth(0);
    }
  };

  const filteredFloats = platformFilter === 'all'
    ? argoFloats
    : argoFloats.filter((f) => f.platform === platformFilter);

  const PLATFORM_TABS: { id: Platform; label: string; dot: string }[] = [
    { id: 'all',         label: 'All',     dot: 'bg-slate-400' },
    { id: 'Argo',        label: 'Argo',    dot: 'bg-amber-400' },
    { id: 'Glider',      label: 'Glider',  dot: 'bg-emerald-400' },
    { id: 'CTD Mooring', label: 'Mooring', dot: 'bg-pink-400' },
  ];

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col select-none overflow-hidden font-sans">
      {/* Wake-up overlay */}
      <WakeUpOverlay isVisible={isBackendWaking} />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Top Navigation */}
      <TopNavigation
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        onOpenDataModal={() => setIsDataModalOpen(true)}
        onBackendWaking={setIsBackendWaking}
      />

      {/* Main 3D Viewport */}
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

        {/* Left controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2.5 max-w-[280px]">
          <VariableControl
            selectedVariable={variable}
            onSelectVariable={(v) => setVariable(v)}
            showCurrentVectors={showCurrentVectors}
            onToggleVectors={() => setShowCurrentVectors(!showCurrentVectors)}
          />
          <ColorbarLegend variable={variable} />
        </div>

        {/* Right panel — sensor registry */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2.5 max-w-[300px]">
          <div className="glass-bright rounded-xl shadow-2xl text-slate-100 flex flex-col gap-0 overflow-hidden">
            {/* Panel header */}
            <div className="px-3.5 py-2.5 border-b border-slate-800/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Live In-Situ Network</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-500 mono">INCOIS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
              </div>
            </div>

            {/* Platform filter tabs */}
            <div className="flex border-b border-slate-800/60 bg-slate-900/40">
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
                    <span className="text-[9px] opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Float list */}
            <div className="p-2 space-y-1.5 max-h-56 overflow-y-auto">
              {filteredFloats.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-4">No sensors for this filter</div>
              ) : filteredFloats.map((f) => {
                const isSel = selectedFloat?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFloat(f)}
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
                      <div className="text-right">
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

          {/* Operational advisory cards */}
          {activePreset === 'cyclone' && (
            <div className="glass-bright border border-red-500/40 p-3 rounded-xl text-red-200 text-xs shadow-2xl glow-red flex flex-col gap-1.5 animate-slide-down">
              <div className="font-bold flex items-center gap-1.5 text-red-400">
                <AlertOctagon className="w-4 h-4 animate-bounce" />
                Cyclone Advisory Mode
              </div>
              <p className="text-[11px] text-red-300/80 leading-relaxed">
                SSH anomalies highlighted in Bay of Bengal. Thermocline shallowing detected.
              </p>
            </div>
          )}
          {activePreset === 'fisheries' && (
            <div className="glass-bright border border-emerald-500/40 p-3 rounded-xl text-emerald-200 text-xs shadow-2xl glow-emerald flex flex-col gap-1.5 animate-slide-down">
              <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Info className="w-4 h-4" />
                PFZ Advisories Active
              </div>
              <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                High chlorophyll-a front along SW coast upwelling zone. Optimal 27°C thermal fronts detected.
              </p>
            </div>
          )}
          {activePreset === 'sar' && (
            <div className="glass-bright border border-amber-500/40 p-3 rounded-xl text-amber-200 text-xs shadow-2xl flex flex-col gap-1.5 animate-slide-down">
              <div className="font-bold flex items-center gap-1.5 text-amber-400">
                <Radio className="w-4 h-4 animate-pulse" />
                SAR Drift Mode Active
              </div>
              <p className="text-[11px] text-amber-300/80 leading-relaxed">
                Surface current drift vectors active for search & rescue trajectory estimation.
              </p>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-end gap-3 max-w-[95vw]">
          <DepthSlider
            depth={depth}
            onChangeDepth={(d) => setDepth(d)}
            verticalExaggeration={verticalExaggeration}
            onChangeExaggeration={(v) => setVerticalExaggeration(v)}
          />
          <TimeSlider
            timeIndex={timeIndex}
            onChangeTime={(t) => setTimeIndex(t)}
          />
        </div>

        {/* Bottom-left hint */}
        <div className="absolute bottom-4 left-4 z-10 text-[9px] text-slate-600 mono flex items-center gap-2">
          <span>Drag: Rotate</span>
          <span>·</span>
          <span>Scroll: Zoom</span>
          <span>·</span>
          <span>Click sensor: Profile</span>
        </div>
      </div>

      {/* Modals */}
      <SensorProfileModal
        floatData={selectedFloat}
        onClose={() => setSelectedFloat(null)}
      />
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
