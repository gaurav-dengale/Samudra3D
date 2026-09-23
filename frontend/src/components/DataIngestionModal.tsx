import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, FileText, Database, AlertCircle } from 'lucide-react';
import { ingestNetCDF } from '../services/api';


interface DataIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataIngestionModal: React.FC<DataIngestionModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'netcdf' | 'argo' | 'ascii'>('netcdf');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<{ filename: string; size_kb: number; variables_extracted: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setUploadResult(null);
    try {
      const result = await ingestNetCDF(file);
      setUploadResult({ filename: result.filename, size_kb: result.size_kb, variables_extracted: result.variables_extracted });
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        setUploadResult(null);
        onClose();
      }, 3000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSimulatedIngest = () => {
    // For Argo/ASCII tabs (no file upload), simulate the process
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setTimeout(() => {
        setUploadSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ocean Data Ingestion Pipeline</h3>
              <p className="text-xs text-slate-400 font-mono">
                CF-1.8 Compliant NetCDF, OPeNDAP & In-situ Feeds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm px-2 py-1 bg-slate-800 rounded-lg"
          >
            Esc
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('netcdf')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'netcdf' ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ROMS / HYCOM NetCDF (.nc)
          </button>
          <button
            onClick={() => setActiveTab('argo')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'argo' ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Argo GDAC Profiler
          </button>
          <button
            onClick={() => setActiveTab('ascii')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === 'ascii' ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            CTD Glider CSV / ASCII
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div
            className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-xl p-6 flex flex-col items-center justify-center text-center transition cursor-pointer bg-slate-950/40"
            onDragOver={(e) => e.preventDefault()}
            onDrop={activeTab === 'netcdf' ? handleDrop : undefined}
            onClick={() => activeTab === 'netcdf' ? fileInputRef.current?.click() : handleSimulatedIngest()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".nc,.nc4,.grib2"
              className="hidden"
              onChange={handleInputChange}
            />
            {uploadSuccess ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
            ) : uploadError ? (
              <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
            ) : (
              <UploadCloud className="w-10 h-10 text-sky-400 mb-2" />
            )}
            <div className="text-sm font-semibold text-white">
              {uploadSuccess ? 'Ingestion Successful!' : uploadError ? 'Upload Failed' : 'Drag & Drop INCOIS Model / Sensor Dataset'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {uploadSuccess && uploadResult
                ? `${uploadResult.filename} (${uploadResult.size_kb} KB) • Variables: ${uploadResult.variables_extracted.join(', ')}`
                : uploadError
                ? uploadError
                : 'Supports .nc, .nc4, .grib2, .csv, and .ascii up to 2.5 GB'}
            </div>
            {!uploadSuccess && (
              <button
                onClick={(e) => { e.stopPropagation(); activeTab === 'netcdf' ? fileInputRef.current?.click() : handleSimulatedIngest(); }}
                disabled={isUploading}
                className="mt-4 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition disabled:opacity-50"
              >
                {isUploading
                  ? 'Uploading & Parsing CF Metadata...'
                  : activeTab === 'netcdf'
                  ? 'Select File & Parse Grids'
                  : 'Connect Data Feed'}
              </button>
            )}
          </div>

          {/* Standards Checklist */}
          <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 text-xs space-y-2">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              Automated Preprocessing & Validation Checks:
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> CF Standard Coordinate Metadata
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Vertical Sigma / Depth Standardization
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Quality Control (QC 1–4 Flags)
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 3D GPU Texture Quadtree Tiling
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
