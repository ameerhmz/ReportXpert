"use client";

import React, { useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, FileText } from "lucide-react";

export const BulkIngestionTab: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<"faculty_profile" | "student_profile" | "campus_event">("faculty_profile");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_type", docType);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/knowledge/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.detail || "Failed to parse and embed file.");
      }
    } catch (e: any) {
      setError(e.message || "Network error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl shadow-xl tactile-chamfer">
        <h2 className="text-base font-bold text-[#f5f1e8] flex items-center gap-2 mb-1 font-sans">
          <UploadCloud className="w-5 h-5 text-[#de8535]" />
          Bulk Spreadsheet Vector Ingestion (CSV / XLSX)
        </h2>
        <p className="text-xs text-[#b8b2a4]">
          Batch ingest hundreds of faculty publications, student achievements, or campus events directly into the on-premise BGE-M3 Vector DB without manual data entry.
        </p>
      </div>

      <div className="p-6 bg-[#131514] border border-[#2e3430] rounded-2xl space-y-6">
        {/* Step 1: Select Type */}
        <div>
          <label className="text-xs font-bold text-[#f5f1e8] uppercase tracking-wider block mb-2">
            1. Select Target Data Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDocType("faculty_profile")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${docType === "faculty_profile" ? "bg-[#de8535]/15 border-[#de8535] text-[#de8535]" : "bg-[#1a1d1b] border-[#2e3430] text-[#8c877a] hover:text-[#f5f1e8]"}`}
            >
              <div className="font-bold text-xs mb-0.5">Faculty Profiles</div>
              <div className="text-[10px] opacity-70">Publications, Citations, Grants</div>
            </button>

            <button
              type="button"
              onClick={() => setDocType("student_profile")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${docType === "student_profile" ? "bg-[#3d6a8a]/15 border-[#3d6a8a] text-[#3d6a8a]" : "bg-[#1a1d1b] border-[#2e3430] text-[#8c877a] hover:text-[#f5f1e8]"}`}
            >
              <div className="font-bold text-xs mb-0.5">Student Profiles</div>
              <div className="text-[10px] opacity-70">Awards, Research, Hackathons</div>
            </button>

            <button
              type="button"
              onClick={() => setDocType("campus_event")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${docType === "campus_event" ? "bg-[#4b9b74]/15 border-[#4b9b74] text-[#4b9b74]" : "bg-[#1a1d1b] border-[#2e3430] text-[#8c877a] hover:text-[#f5f1e8]"}`}
            >
              <div className="font-bold text-xs mb-0.5">Campus Events</div>
              <div className="text-[10px] opacity-70">Conferences, FDPs, Workshops</div>
            </button>
          </div>
        </div>

        {/* Step 2: Upload Box */}
        <div>
          <label className="text-xs font-bold text-[#f5f1e8] uppercase tracking-wider block mb-2">
            2. Choose CSV or Excel File
          </label>
          <label className="border-2 border-dashed border-[#2e3430] hover:border-[#de8535]/50 bg-[#1a1d1b]/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileSpreadsheet className="w-10 h-10 text-[#7d776b] group-hover:text-[#de8535] transition mb-3" />
            <div className="text-sm font-semibold text-[#f5f1e8] mb-1">
              {file ? file.name : "Click to Browse or Drag & Drop Spreadsheet"}
            </div>
            <div className="text-xs text-[#7d776b]">
              Accepts .xlsx or .csv files with column headers (Name, Department, ID, etc.)
            </div>
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-3 bg-[#de8535] hover:bg-[#c9752b] text-[#131514] font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
        >
          {uploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Parsing & Generating Neural Embeddings...
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              Start Bulk Embedding & Ingestion
            </>
          )}
        </button>

        {/* Success / Error Callouts */}
        {result && (
          <div className="p-4 rounded-xl bg-[#4b9b74]/15 border border-[#4b9b74]/30 text-[#4b9b74] flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div className="text-xs font-sans">
              <strong className="block font-bold">Ingestion Successful!</strong>
              {result.message}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-[#c9523c]/15 border border-[#c9523c]/30 text-[#c9523c] flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="text-xs font-sans">
              <strong className="block font-bold">Upload Failed</strong>
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
