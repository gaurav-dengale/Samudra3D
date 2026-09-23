const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ProfilePoint {
  depth: number;
  temperature: number;
  salinity: number;
  oxygen?: number;
  chlorophyll?: number;
}

export interface ArgoFloatAPI {
  id: string;
  wmoNumber: number;
  platform: string;
  lat: number;
  lon: number;
  lastUpdate: string;
  maxDepth: number;
  cycleNumber: number;
  status: string;
  batteryPercent: number;
  profiles: ProfilePoint[];
}

export interface FloatsResponse {
  count: number;
  data: ArgoFloatAPI[];
}

export interface ModelSliceResponse {
  variable: string;
  depth_level_m: number;
  timestamp_index: number;
  grid: {
    lons: number[];
    lats: number[];
    mean_val: number;
    units: string;
  };
  metadata: {
    model: string;
    institution: string;
    conventions: string;
  };
}

/** Fetch all active Argo floats from the backend */
export async function fetchFloats(): Promise<FloatsResponse> {
  const res = await fetch(`${API_BASE}/api/floats`);
  if (!res.ok) throw new Error(`Failed to fetch floats: ${res.status}`);
  return res.json();
}

/** Fetch a specific float by ID */
export async function fetchFloatById(id: string): Promise<ArgoFloatAPI> {
  const res = await fetch(`${API_BASE}/api/floats/${id}`);
  if (!res.ok) throw new Error(`Float not found: ${res.status}`);
  return res.json();
}

/** Fetch model grid slice */
export async function fetchModelSlice(
  variable: string,
  depth: number,
  timestampIdx: number
): Promise<ModelSliceResponse> {
  const params = new URLSearchParams({
    variable,
    depth: String(depth),
    timestamp_idx: String(timestampIdx),
  });
  const res = await fetch(`${API_BASE}/api/model-slice?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch model slice: ${res.status}`);
  return res.json();
}

/** Upload a NetCDF file for ingestion */
export async function ingestNetCDF(file: File): Promise<{
  status: string;
  filename: string;
  size_kb: number;
  message: string;
  variables_extracted: string[];
}> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/ingest/netcdf`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`Ingest failed: ${res.status}`);
  return res.json();
}
