export interface ArgoFloat {
  id: string;
  wmoNumber: number;
  platform: 'Argo' | 'Glider' | 'CTD Mooring';
  lat: number;
  lon: number;
  lastUpdate: string;
  maxDepth: number;
  cycleNumber: number;
  status: 'active' | 'profiling' | 'surfaced';
  batteryPercent: number;
  profiles: {
    depth: number;
    temperature: number; // Celsius
    salinity: number;    // PSU
    oxygen?: number;     // umol/kg
    chlorophyll?: number; // mg/m3
  }[];
}

export interface OceanVariableConfig {
  id: 'sst' | 'salinity' | 'currents' | 'chlorophyll' | 'ssh';
  name: string;
  unit: string;
  description: string;
  min: number;
  max: number;
  defaultMin: number;
  defaultMax: number;
  palette: string[];
}

export const OCEAN_VARIABLES: Record<string, OceanVariableConfig> = {
  sst: {
    id: 'sst',
    name: 'Sea Temperature',
    unit: '°C',
    description: 'Potential temperature across chosen depth slice',
    min: 4,
    max: 32,
    defaultMin: 18,
    defaultMax: 31,
    palette: ['#000080', '#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000', '#800000'],
  },
  salinity: {
    id: 'salinity',
    name: 'Salinity',
    unit: 'PSU',
    description: 'Practical Salinity Units in ocean water column',
    min: 30,
    max: 38,
    defaultMin: 32,
    defaultMax: 36.5,
    palette: ['#2e0854', '#4b0082', '#0000cd', '#00ced1', '#98fb98', '#ffd700'],
  },
  currents: {
    id: 'currents',
    name: 'Ocean Currents',
    unit: 'm/s',
    description: 'Horizontal vector velocity magnitude and streamlines',
    min: 0,
    max: 2.5,
    defaultMin: 0.1,
    defaultMax: 1.8,
    palette: ['#0f172a', '#0369a1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
  },
  chlorophyll: {
    id: 'chlorophyll',
    name: 'Chlorophyll-a',
    unit: 'mg/m³',
    description: 'Phytoplankton density indicator for Potential Fishing Zones (PFZ)',
    min: 0.01,
    max: 5.0,
    defaultMin: 0.05,
    defaultMax: 2.2,
    palette: ['#022c22', '#065f46', '#059669', '#10b981', '#34d399', '#a7f3d0'],
  },
  ssh: {
    id: 'ssh',
    name: 'Sea Surface Height Anomaly',
    unit: 'm',
    description: 'SSH altimetry anomalies for eddies, storm surges & tsunami tracking',
    min: -0.5,
    max: 0.5,
    defaultMin: -0.3,
    defaultMax: 0.3,
    palette: ['#1e3a8a', '#3b82f6', '#93c5fd', '#ffffff', '#fca5a5', '#ef4444', '#7f1d1d'],
  }
};

export const DEPTH_LEVELS = [
  0, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000
];

export const MOCK_ARGO_FLOATS: ArgoFloat[] = [
  {
    id: 'ARGO-IND-2902341',
    wmoNumber: 2902341,
    platform: 'Argo',
    lat: 14.5,
    lon: 68.2, // Arabian Sea
    lastUpdate: '2026-09-10T12:00:00Z',
    maxDepth: 2000,
    cycleNumber: 142,
    status: 'active',
    batteryPercent: 88,
    profiles: [
      { depth: 0, temperature: 29.8, salinity: 36.4, oxygen: 210, chlorophyll: 0.45 },
      { depth: 25, temperature: 29.3, salinity: 36.5, oxygen: 205, chlorophyll: 0.62 },
      { depth: 50, temperature: 28.1, salinity: 36.6, oxygen: 195, chlorophyll: 0.95 },
      { depth: 100, temperature: 24.2, salinity: 36.1, oxygen: 120, chlorophyll: 0.28 },
      { depth: 200, temperature: 18.5, salinity: 35.6, oxygen: 45, chlorophyll: 0.05 },
      { depth: 500, temperature: 11.8, salinity: 35.1, oxygen: 28, chlorophyll: 0.01 },
      { depth: 1000, temperature: 7.2, salinity: 34.9, oxygen: 40, chlorophyll: 0.0 },
      { depth: 1500, temperature: 4.5, salinity: 34.8, oxygen: 65, chlorophyll: 0.0 },
      { depth: 2000, temperature: 2.9, salinity: 34.8, oxygen: 88, chlorophyll: 0.0 },
    ]
  },
  {
    id: 'ARGO-IND-2902409',
    wmoNumber: 2902409,
    platform: 'Argo',
    lat: 13.8,
    lon: 86.4, // Bay of Bengal
    lastUpdate: '2026-09-10T14:30:00Z',
    maxDepth: 2000,
    cycleNumber: 98,
    status: 'profiling',
    batteryPercent: 92,
    profiles: [
      { depth: 0, temperature: 30.4, salinity: 32.8, oxygen: 215, chlorophyll: 0.85 },
      { depth: 25, temperature: 30.1, salinity: 33.1, oxygen: 210, chlorophyll: 1.10 },
      { depth: 50, temperature: 27.5, salinity: 34.2, oxygen: 180, chlorophyll: 1.35 },
      { depth: 100, temperature: 22.0, salinity: 35.0, oxygen: 90, chlorophyll: 0.22 },
      { depth: 200, temperature: 16.2, salinity: 35.2, oxygen: 35, chlorophyll: 0.03 },
      { depth: 500, temperature: 10.4, salinity: 35.0, oxygen: 25, chlorophyll: 0.0 },
      { depth: 1000, temperature: 6.8, salinity: 34.9, oxygen: 52, chlorophyll: 0.0 },
      { depth: 1500, temperature: 4.1, salinity: 34.8, oxygen: 75, chlorophyll: 0.0 },
      { depth: 2000, temperature: 2.6, salinity: 34.8, oxygen: 92, chlorophyll: 0.0 },
    ]
  },
  {
    id: 'GLIDER-INCOIS-004',
    wmoNumber: 6903120,
    platform: 'Glider',
    lat: 8.5,
    lon: 76.5, // Lakshadweep Sea / Kerala Coast
    lastUpdate: '2026-09-10T15:45:00Z',
    maxDepth: 1000,
    cycleNumber: 312,
    status: 'active',
    batteryPercent: 74,
    profiles: [
      { depth: 0, temperature: 29.5, salinity: 35.2, oxygen: 212, chlorophyll: 1.25 },
      { depth: 25, temperature: 28.8, salinity: 35.4, oxygen: 200, chlorophyll: 1.65 },
      { depth: 50, temperature: 26.9, salinity: 35.8, oxygen: 165, chlorophyll: 0.90 },
      { depth: 100, temperature: 21.5, salinity: 35.5, oxygen: 85, chlorophyll: 0.15 },
      { depth: 200, temperature: 15.8, salinity: 35.2, oxygen: 38, chlorophyll: 0.02 },
      { depth: 500, temperature: 10.8, salinity: 35.0, oxygen: 30, chlorophyll: 0.0 },
      { depth: 1000, temperature: 6.9, salinity: 34.9, oxygen: 55, chlorophyll: 0.0 },
    ]
  },
  {
    id: 'MOORING-BD08',
    wmoNumber: 23008,
    platform: 'CTD Mooring',
    lat: 18.2,
    lon: 89.6, // North Bay of Bengal
    lastUpdate: '2026-09-10T16:00:00Z',
    maxDepth: 500,
    cycleNumber: 640,
    status: 'active',
    batteryPercent: 99,
    profiles: [
      { depth: 0, temperature: 30.8, salinity: 31.5, oxygen: 220, chlorophyll: 1.45 },
      { depth: 25, temperature: 30.2, salinity: 32.2, oxygen: 215, chlorophyll: 1.80 },
      { depth: 50, temperature: 28.0, salinity: 33.8, oxygen: 190, chlorophyll: 0.70 },
      { depth: 100, temperature: 23.1, salinity: 34.9, oxygen: 110, chlorophyll: 0.12 },
      { depth: 200, temperature: 17.0, salinity: 35.1, oxygen: 42, chlorophyll: 0.01 },
      { depth: 500, temperature: 11.2, salinity: 35.0, oxygen: 31, chlorophyll: 0.0 },
    ]
  },
  {
    id: 'ARGO-IND-2902388',
    wmoNumber: 2902388,
    platform: 'Argo',
    lat: 5.2,
    lon: 80.8, // South of Sri Lanka / Equatorial Indian Ocean
    lastUpdate: '2026-09-10T10:15:00Z',
    maxDepth: 2000,
    cycleNumber: 184,
    status: 'active',
    batteryPercent: 65,
    profiles: [
      { depth: 0, temperature: 29.2, salinity: 34.8, oxygen: 208, chlorophyll: 0.35 },
      { depth: 25, temperature: 28.9, salinity: 34.9, oxygen: 204, chlorophyll: 0.42 },
      { depth: 50, temperature: 28.1, salinity: 35.2, oxygen: 198, chlorophyll: 0.58 },
      { depth: 100, temperature: 25.0, salinity: 35.4, oxygen: 140, chlorophyll: 0.20 },
      { depth: 200, temperature: 19.8, salinity: 35.2, oxygen: 60, chlorophyll: 0.04 },
      { depth: 500, temperature: 12.5, salinity: 35.1, oxygen: 35, chlorophyll: 0.0 },
      { depth: 1000, temperature: 7.9, salinity: 34.9, oxygen: 48, chlorophyll: 0.0 },
      { depth: 1500, temperature: 4.8, salinity: 34.8, oxygen: 70, chlorophyll: 0.0 },
      { depth: 2000, temperature: 3.1, salinity: 34.8, oxygen: 90, chlorophyll: 0.0 },
    ]
  }
];

export const TIMESTAMPS = [
  '2026-09-08 00:00 UTC',
  '2026-09-08 12:00 UTC',
  '2026-09-09 00:00 UTC',
  '2026-09-09 12:00 UTC',
  '2026-09-10 00:00 UTC (Now)',
  '2026-09-10 12:00 UTC (+12h Forecast)',
  '2026-09-11 00:00 UTC (+24h Forecast)',
  '2026-09-11 12:00 UTC (+36h Forecast)',
  '2026-09-12 00:00 UTC (+48h Forecast)',
];
