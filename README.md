# SAMUDRA 3D - Interactive 3D Ocean Visualization Platform
**Smart India Hackathon 2026** | **Problem Statement ID:** 26067  
**Theme:** Disaster Management / Ocean Sciences | **Team:** Burning Hammer

---

## 🌊 Overview
**SAMUDRA 3D** is a web-based, GPU-accelerated interactive 3D ocean data visualization platform that integrates numerical ocean model outputs (such as ROMS, HYCOM, and INCOIS forecasts) with in-situ observational platforms (Argo profiling floats, autonomous underwater gliders, and moored CTD buoys).

## 🚀 Key Features Implemented

1. **WebGL / Three.js 3D Ocean Globe & Water Column**:
   - High-fidelity bathymetry focused on the **Indian Ocean & Indian EEZ** (40°E–105°E, 35°S–25°N).
   - Atmospheric shader glow and realistic ocean layer lighting.
   - Dynamic vertical depth slicing from the surface (**0m**) down to **2,000m** with vertical exaggeration controls (1x to 5x).
   - Animated vector particle streamlines representing monsoonal surface currents and circulation.

2. **Oceanographic Variables (CF-1.8 Compliant)**:
   - **Sea Temperature (SST & Subsurface)**
   - **Salinity (PSU)**
   - **Ocean Current Velocity (m/s)**
   - **Chlorophyll-a (mg/m³)** for Potential Fishing Zones (PFZ)
   - **Sea Surface Height Anomaly (SSHA)** for eddies and storm surges
   - Dynamic scientific colorbar palettes (Turbo, Coolwarm, Viridis).

3. **In-Situ Sensor Network & Real-Time Sounding**:
   - Interactive 3D markers for **Argo Profiling Floats**, **Underwater Gliders**, and **CTD Moorings**.
   - Interactive modal inspection displaying **Depth vs. Temperature/Salinity profile curves** (0m to 2000m).
   - Direct correlation and **Model vs. Observation Mean Absolute Error (MAE)** calculation.
   - Profile export as standardized JSON.

4. **Operational Presets**:
   - **General Ocean State**
   - **Disaster Management (Cyclone Tracking & Storm Surge)**
   - **PFZ / Sustainable Fisheries**
   - **Search & Rescue (S&R Current Drift)**

5. **Data Ingestion Pipeline**:
   - Automated ingestion pipeline modal for NetCDF (.nc), Argo GDAC profiler, and CTD ASCII formats.
   - Python FastAPI backend equipped with `xarray` and `netCDF4` ready to parse real INCOIS numerical grids.

---

## 🛠️ Quick Start

### Option 1: One-Click Startup (Windows)
Double-click `start.bat` in `d:\AImeeting\samudra3d\` or run:
```bash
.\start.bat
```

### Option 2: Run Separately

#### 1. Frontend (React + Three.js + Tailwind CSS)
```bash
cd samudra3d/frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your web browser.

#### 2. Backend (FastAPI + xarray)
```bash
cd samudra3d/backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000
```
API Documentation: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**
