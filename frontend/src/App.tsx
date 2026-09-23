import { useState, useEffect } from 'react';
import { OceanGlobe } from './components/OceanGlobe';
import { DepthSlider } from './components/DepthSlider';
import { TimeSlider } from './components/TimeSlider';
import { VariableControl } from './components/VariableControl';
import { ColorbarLegend } from './components/ColorbarLegend';
import { TopNavigation } from './components/TopNavigation';
import { SensorProfileModal } from './components/SensorProfileModal';
import { DataIngestionModal } from './components/DataIngestionModal';
import {
  MOCK_ARGO_FLOATS,
  type ArgoFloat,
  OCEAN_VARIABLES
} from './data/mockOceanData';
import { fetchFloats } from './services/api';
import { Radio, AlertOctagon, Info } from 'lucide-react';


export function App() {
  const [variable, setVariable] = useState<string>('sst');
  const [depth, setDepth] = useState<number>(0);
  const [timeIndex, setTimeIndex] = useState<number>(4); // Default to "Now"
  const [verticalExaggeration, setVerticalExaggeration] = useState<number>(1);
  const [showCurrentVectors, setShowCurrentVectors] = useState<boolean>(true);
  const [selectedFloat, setSelectedFloat] = useState<ArgoFloat | null>(null);
  const [activePreset, setActivePreset] = useState<'general' | 'cyclone' | 'fisheries' | 'sar'>('general');
  const [isDataModalOpen, setIsDataModalOpen] = useState<boolean>(false);
  const [argoFloats, setArgoFloats] = useState<ArgoFloat[]>(MOCK_ARGO_FLOATS);

  // Fetch live Argo floats from backend on mount
  useEffect(() => {
    fetchFloats()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setArgoFloats(res.data as ArgoFloat[]);
        }
      })
      .catch(() => {
        // Fall back to mock data if backend is unavailable
        setArgoFloats(MOCK_ARGO_FLOATS);
      });
  }, []);


  // Apply quick operational presets
  const handleSelectPreset = (preset: 'general' | 'cyclone' | 'fisheries' | 'sar') => {
    setActivePreset(preset);
    if (preset === 'cyclone') {
      setVariable('ssh'); // Sea surface height / storm surge
      setDepth(0);
      setShowCurrentVectors(true);
    } else if (preset === 'fisheries') {
      setVariable('chlorophyll'); // Chlorophyll fronts & SST upwelling
      setDepth(25);
    } else if (preset === 'sar') {
      setVariable('currents'); // Surface currents drift
      setDepth(0);
      setShowCurrentVectors(true);
    } else {
      setVariable('sst');
      setDepth(0);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col select-none overflow-hidden font-sans">
      {/* Top SIH Header */}
      <TopNavigation
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main 3D Viewport Area */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        {/* 3D WebGL Ocean Globe */}
        <OceanGlobe
          variable={variable}
          depth={depth}
          timeIndex={timeIndex}
          selectedFloat={selectedFloat}
          onSelectFloat={(f) => setSelectedFloat(f)}
          floats={argoFloats}
          showCurrentVectors={showCurrentVectors}
          verticalExaggeration={verticalExaggeration}
          palette={OCEAN_VARIABLES[variable]?.palette || []}
        />

        {/* Left Floating Controls Panel: Variable Selector & Colorbar */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 max-w-[280px]">
          <VariableControl
            selectedVariable={variable}
            onSelectVariable={(v) => setVariable(v)}
            showCurrentVectors={showCurrentVectors}
            onToggleVectors={() => setShowCurrentVectors(!showCurrentVectors)}
          />

          <ColorbarLegend variable={variable} />
        </div>

        {/* Right Floating Quick In-Situ Sensor Registry */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-3 max-w-[310px]">
          <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 p-3.5 rounded-xl shadow-2xl text-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
                <span>Live In-Situ Network ({argoFloats.length})</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">INCOIS Live Feed</span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {argoFloats.map((f) => {
                const isSel = selectedFloat?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFloat(f)}
                    className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                      isSel
                        ? 'bg-sky-950/80 border-sky-400 text-sky-200 shadow'
                        : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700/70'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${f.platform === 'Argo' ? 'bg-amber-400' : f.platform === 'Glider' ? 'bg-emerald-400' : 'bg-pink-400'}`} />
                        {f.id}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {f.lat}°N, {f.lon}°E • Depth: {f.maxDepth}m
                      </div>
                    </div>
                    <button className="text-[10px] px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/40 font-mono">
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Preset Operational Advisory Card */}
          {activePreset === 'cyclone' && (
            <div className="bg-red-950/80 backdrop-blur-md border border-red-500/60 p-3 rounded-xl text-red-200 text-xs shadow-2xl flex flex-col gap-1.5">
              <div className="font-bold flex items-center gap-1.5 text-red-400">
                <AlertOctagon className="w-4 h-4 text-red-400 animate-bounce" />
                Cyclone Advisory Mode Active
              </div>
              <p className="text-[11px] text-red-300/90 leading-relaxed">
                Storm surge sea surface height anomalies highlighted in Bay of Bengal. Vertical mixing indicates thermocline shallowing.
              </p>
            </div>
          )}

          {activePreset === 'fisheries' && (
            <div className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/60 p-3 rounded-xl text-emerald-200 text-xs shadow-2xl flex flex-col gap-1.5">
              <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                <Info className="w-4 h-4 text-emerald-400" />
                Potential Fishing Zone (PFZ) Advisories
              </div>
              <p className="text-[11px] text-emerald-300/90 leading-relaxed">
                High chlorophyll-a front detected along South-West coast upwelling zone. Co-located with optimal 27°C thermal fronts.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Floating Control Bar: Depth Slicer & 4D Time Slider */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 max-w-[95vw]">
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

        {/* Bottom Left Quick Help / Attribution */}
        <div className="absolute bottom-4 left-4 z-10 text-[10px] text-slate-500 font-mono flex items-center gap-2">
          <span>Drag to Rotate</span>
          <span>•</span>
          <span>Scroll to Zoom</span>
          <span>•</span>
          <span>Click Floats for Sounding</span>
        </div>
      </div>

      {/* Sensor In-Situ Sounding Chart Modal */}
      <SensorProfileModal
        floatData={selectedFloat}
        onClose={() => setSelectedFloat(null)}
      />

      {/* NetCDF & Observation Ingestion Pipeline Modal */}
      <DataIngestionModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
      />
    </div>
  );
}

export default App;
