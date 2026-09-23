@echo off
echo Starting SAMUDRA 3D Full-Stack Development Services...

start "SAMUDRA 3D Frontend (React + Three.js)" cmd /k "cd frontend && npm run dev"
start "SAMUDRA 3D Backend (FastAPI + NetCDF)" cmd /k "cd backend && .\venv\Scripts\python -m uvicorn main:app --reload --port 8000"

echo SAMUDRA 3D is launched!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
pause
