"use client";

import React, { useState } from "react";
import { 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  FileCode, 
  FileSearch, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Check, 
  Zap, 
  Layers,
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  Award,
  FileCheck
} from "lucide-react";

interface IngestedResultItem {
  filename: string;
  category: string;
  category_label: string;
  destination_tab: string;
  confidence: number;
  signals: string[];
  records_ingested: number;
  message: string;
}

interface UniversalAutoIngestionTabProps {
  onSwitchTab?: (tabKey: "standards" | "research" | "scholarships" | "faculty" | "students" | "events" | "bulk") => void;
}

export const UniversalAutoIngestionTab: React.FC<UniversalAutoIngestionTabProps> = ({ onSwitchTab }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [overrideType, setOverrideType] = useState<string>("auto");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<IngestedResultItem[] | null>(null);
  const [summary, setSummary] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string>("");

  // Handle Drag & Drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
      setError(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selected]);
      setError(null);
    }
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Sample File Injectors for quick instant demonstration
  const handleLoadSample = (sampleType: "student" | "faculty" | "research" | "event" | "standard") => {
    let filename = "";
    let content = "";

    if (sampleType === "student") {
      filename = "Aarav_Patel_Student_Record.txt";
      content = `Student Name: Aarav Patel\nStudent ID: STU-2024-088\nRoll No: 21BCE1045\nDepartment: Computer Science & Engineering\nProgram: B.Tech (AI & Machine Learning)\nBatch: 2021-2025\nCGPA: 9.45 / 10.0\nAcademic Standing: Rank #2, Dean's Honor Roll\nAchievements & Honors:\n- Team Lead & Winner, Smart India Hackathon (SIH 2024 Finalist) with ₹1,00,000 Cash Prize.\n- Pre-Placement Offer (PPO) as Senior AI Research Intern with CTC ₹28.50 LPA.\n- Published 1 Scopus-indexed research paper in IEEE Access on Edge-LLM optimization.`;
    } else if (sampleType === "faculty") {
      filename = "Dr_Sunita_Mehra_Faculty_CV.txt";
      content = `Curriculum Vitae\nFaculty Name: Dr. Sunita Mehra\nDesignation: Professor & Dean of Academics\nEmployee ID: FAC-2024-029\nDepartment: Information Technology\nSpecialization: Quantum Cryptography & Distributed Systems\nTeaching Experience: 16 Years\nPh.D Guide Status: 8 Doctoral Candidates Supervised.\nExtramural Grants: DST-SERB Core Research Grant (₹24.50 Lakhs).\nPublications: 38 Scopus/WoS-indexed papers, H-Index: 18.`;
    } else if (sampleType === "research") {
      filename = "MSFHNet_Breast_Cancer_Scopus_Paper.txt";
      content = `Title: MSFHNet: Mobile Siamese Forward Harmonic Net for Histological Structure-Based Breast Cancer Classification Using Histopathological Images\nAuthors: Dr. Rajesh Sharma, Dr. Meenakshi Srivastava, Ameer Hamza\nJournal: Biomedical Materials and Devices (Springer)\nDOI: 10.1007/s44174-024-00188-7\nISSN: 2731-4812\nQuartile: Q1\nScopus Indexed: Yes\nCitations: 14\nImpact Factor: 4.80\nAbstract: This paper introduces a sovereign parameter-efficient forward harmonic network for digital histopathology.`;
    } else if (sampleType === "event") {
      filename = "FDP_Agentic_AI_Circular.txt";
      content = `Institutional Circular: 5-Day National Faculty Development Programme (FDP)\nEvent Title: National FDP on Sovereign Agentic AI Architectures\nOrganized by: Department of Computer Science & Engineering\nDates: November 18-22, 2024\nParticipants Count: 140 Faculty Members & Researchers\nResource Person: Dr. Anand Rao, AIIMS & IIT Delhi\nFunding Agency: DST-SERB Sponsored Grant (₹4.50 Lakhs)\nOutcomes: Hands-on implementation of air-gapped LLM deployment.`;
    } else {
      filename = "NAAC_Criterion_3_Manual.txt";
      content = `NAAC Institutional Assessment Manual - Criterion III: Research, Innovations and Extension\nMetric 3.4.2: Number of candidates registered for Ph.D. per teacher recognized as research guide during the year.\nMetric 3.2.1: Extramural funding for research projects from government and non-government funding agencies.\nInstitutional Standard: Complete SSR self-study compliance verification.`;
    }

    const blob = new Blob([content], { type: "text/plain" });
    const sampleFile = new File([blob], filename, { type: "text/plain" });
    setFiles(prev => [...prev, sampleFile]);
    setError(null);
  };

  // Run Smart Autonomous Ingestion
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setResults(null);
    setSummary(null);
    setActiveStep("Parsing document structures and reading text...");

    const formData = new FormData();
    files.forEach(f => {
      formData.append("files", f);
    });
    formData.append("override_type", overrideType);

    try {
      setTimeout(() => {
        setActiveStep("Running multi-signal AI classification & entity extraction...");
      }, 500);

      setTimeout(() => {
        setActiveStep("Generating dense BGE-M3 vectors and writing to Sovereign Vault...");
      }, 1200);

      const res = await fetch("http://127.0.0.1:8000/api/knowledge/smart-ingest", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
        setSummary(data);
        setFiles([]);
      } else {
        setError(data.detail || "Failed to process and embed documents.");
      }
    } catch (e: any) {
      setError(e.message || "Network connection error.");
    } finally {
      setUploading(false);
      setActiveStep("");
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "student_profile":
        return { label: "Student Record", color: "bg-[#2a7a58]/20 text-[#6ee7b7] border-[#2a7a58]/40", icon: GraduationCap, tab: "students" as const };
      case "faculty_profile":
        return { label: "Faculty Profile", color: "bg-[#7a52aa]/20 text-[#d8b4fe] border-[#7a52aa]/40", icon: Users, tab: "faculty" as const };
      case "research_publication":
        return { label: "Research Publication", color: "bg-[#de8535]/20 text-[#f5aa67] border-[#de8535]/40", icon: Sparkles, tab: "research" as const };
      case "campus_event":
        return { label: "Campus Event", color: "bg-[#c9523c]/20 text-[#fca5a5] border-[#c9523c]/40", icon: Calendar, tab: "events" as const };
      default:
        return { label: "Statutory Standard", color: "bg-[#3d6a8a]/20 text-[#93c5fd] border-[#3d6a8a]/40", icon: BookOpen, tab: "standards" as const };
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "csv" || ext === "xlsx" || ext === "xls") return <FileSpreadsheet className="w-4 h-4 text-[#4b9b74]" />;
    if (ext === "pdf") return <FileText className="w-4 h-4 text-[#c9523c]" />;
    if (ext === "docx" || ext === "doc") return <FileText className="w-4 h-4 text-[#3d6a8a]" />;
    return <FileCode className="w-4 h-4 text-[#de8535]" />;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl shadow-xl tactile-chamfer relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4b9b74] animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#de8535] font-bold">
                AUTONOMOUS NEURAL INGESTION
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4b9b74]/15 text-[#4b9b74] border border-[#4b9b74]/30 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                0.00 KB Egress
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#f5f1e8] flex items-center gap-2.5 font-sans">
              <UploadCloud className="w-5 h-5 text-[#de8535]" />
              Universal Smart Document Ingestion & Auto-Classifier
            </h2>
            <p className="text-xs text-[#b8b2a4] max-w-2xl mt-1 leading-relaxed">
              Upload <strong>any</strong> document (PDF, DOCX, XLSX, CSV, or TXT). The system automatically detects whether it belongs to <strong>Faculty Profiles</strong>, <strong>Student Records</strong>, <strong>Research & Scopus</strong>, <strong>Campus Events</strong>, or <strong>Statutory Standards</strong>, extracts structured metadata, and embeds it into the Sovereign Knowledge Vault with zero manual tab-hopping!
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-[#7d776b] uppercase">Supported Formats</span>
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#b8b2a4]">
              <span className="px-1.5 py-0.5 rounded bg-[#222624] border border-[#2e3430]">.PDF</span>
              <span className="px-1.5 py-0.5 rounded bg-[#222624] border border-[#2e3430]">.DOCX</span>
              <span className="px-1.5 py-0.5 rounded bg-[#222624] border border-[#2e3430]">.XLSX</span>
              <span className="px-1.5 py-0.5 rounded bg-[#222624] border border-[#2e3430]">.CSV</span>
              <span className="px-1.5 py-0.5 rounded bg-[#222624] border border-[#2e3430]">.TXT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ingestion Box */}
      <div className="p-6 bg-[#161817] border border-[#2e3430] rounded-2xl shadow-md space-y-6">
        {/* Step 1: Mode Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#f5f1e8] uppercase tracking-wider block font-sans">
              1. Routing & Classification Mode
            </label>
            <span className="text-[11px] text-[#7d776b]">AI multi-signal heuristic + lexical analysis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-2">
            <button
              type="button"
              onClick={() => setOverrideType("auto")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                overrideType === "auto"
                  ? "bg-[#de8535]/15 border-[#de8535] text-[#de8535] shadow-sm ring-1 ring-[#de8535]/50"
                  : "bg-[#1a1d1b] border-[#2e3430] text-[#8c877a] hover:text-[#f5f1e8]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">✨ Auto-Detect</span>
                {overrideType === "auto" && <Check className="w-3.5 h-3.5 text-[#de8535]" />}
              </div>
              <div className="text-[10px] opacity-75">AI Classifier (Recommended)</div>
            </button>

            <button
              type="button"
              onClick={() => setOverrideType("student_profile")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                overrideType === "student_profile"
                  ? "bg-[#2a7a58]/20 border-[#2a7a58] text-[#6ee7b7] shadow-sm ring-1 ring-[#2a7a58]/50"
                  : "bg-[#1a1d1b] border-[#2e3430] text-[#8c877a] hover:text-[#f5f1e8]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">🎓 Student</span>
                {overrideType === "student_profile" && <Check className="w-3.5 h-3.5 text-[#6ee7b7]" />}
              </div>
              <div className="text-[10px] opacity-75">CGPA, Honors, Awards</div>
            </button>

            <button
              type="button"
              onClick={() => setOverrideType("faculty_profile")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                overrideType === "faculty_profile"
                  ? "bg-[#7a52aa]/20 border-[#7a52aa] text-[#d8b4fe] shadow-sm ring-1 ring-[#7a52aa]/50"
                  : "bg-[#1a1d1b] border-[#2e3430] text-[#8c877a] hover:text-[#f5f1e8]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">👨‍🏫 Faculty</span>
                {overrideType === "faculty_profile" && <Check className="w-3.5 h-3.5 text-[#d8b4fe]" />}
              </div>
              <div className="text-[10px] opacity-75">CVs, Grants, Teaching</div>
            </button>

            <button
              type="button"
              onClick={() => setOverrideType("research_publication")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                overrideType === "research_publication"
                  ? "bg-[#de8535]/20 border-[#de8535] text-[#f5aa67] shadow-sm ring-1 ring-[#de8535]/50"
                  : "bg-[#1a1d1b] border-[#2e3430] text-[#8c877a] hover:text-[#f5f1e8]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">📄 Scopus</span>
                {overrideType === "research_publication" && <Check className="w-3.5 h-3.5 text-[#f5aa67]" />}
              </div>
              <div className="text-[10px] opacity-75">30-Col Scopus/WoS Papers</div>
            </button>

            <button
              type="button"
              onClick={() => setOverrideType("campus_event")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                overrideType === "campus_event"
                  ? "bg-[#c9523c]/20 border-[#c9523c] text-[#fca5a5] shadow-sm ring-1 ring-[#c9523c]/50"
                  : "bg-[#1a1d1b] border-[#2e3430] text-[#8c877a] hover:text-[#f5f1e8]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">📅 Events</span>
                {overrideType === "campus_event" && <Check className="w-3.5 h-3.5 text-[#fca5a5]" />}
              </div>
              <div className="text-[10px] opacity-75">FDPs, Workshops, Confs</div>
            </button>

            <button
              type="button"
              onClick={() => setOverrideType("standard")}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                overrideType === "standard"
                  ? "bg-[#3d6a8a]/20 border-[#3d6a8a] text-[#93c5fd] shadow-sm ring-1 ring-[#3d6a8a]/50"
                  : "bg-[#1a1d1b] border-[#2e3430] text-[#8c877a] hover:text-[#f5f1e8]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">📜 Standards</span>
                {overrideType === "standard" && <Check className="w-3.5 h-3.5 text-[#93c5fd]" />}
              </div>
              <div className="text-[10px] opacity-75">NAAC, NIRF, UGC SOPs</div>
            </button>
          </div>
        </div>

        {/* Step 2: Drag & Drop Zone */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#f5f1e8] uppercase tracking-wider block font-sans">
              2. Upload Academic Documents or Spreadsheets
            </label>
            <span className="text-[11px] text-[#7d776b]">Multi-file batch upload enabled</span>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition cursor-pointer group relative ${
              isDragging
                ? "border-[#de8535] bg-[#de8535]/10"
                : "border-[#2e3430] hover:border-[#de8535]/60 bg-[#1a1d1b]/60"
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf, .docx, .doc, .xlsx, .xls, .csv, .txt, .json"
              onChange={handleFileInputChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-12 h-12 rounded-2xl bg-[#222624] border border-[#2e3430] flex items-center justify-center text-[#de8535] group-hover:scale-110 transition mb-3 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-semibold text-[#f5f1e8] mb-1 font-sans">
              Click to Browse or Drag & Drop Documents Here
            </div>
            <div className="text-xs text-[#7d776b] max-w-md">
              Drop student rosters, faculty CVs, Scopus papers, event brochures, or accreditation manuals. Supports multi-file batches.
            </div>
          </div>
        </div>

        {/* Quick Sample File Trigger Bar */}
        <div className="pt-2 border-t border-[#262a28] flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[#7d776b] font-mono">Test with Sample Data:</span>
          <button
            type="button"
            onClick={() => handleLoadSample("student")}
            className="px-2.5 py-1 rounded-lg bg-[#1f2421] hover:bg-[#28322c] border border-[#2a7a58]/40 text-[#6ee7b7] text-[11px] transition cursor-pointer flex items-center gap-1 font-mono"
          >
            <GraduationCap className="w-3 h-3" />
            + Student (Aarav Patel)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample("faculty")}
            className="px-2.5 py-1 rounded-lg bg-[#241f2a] hover:bg-[#32283a] border border-[#7a52aa]/40 text-[#d8b4fe] text-[11px] transition cursor-pointer flex items-center gap-1 font-mono"
          >
            <Users className="w-3 h-3" />
            + Faculty (Dr. Sunita Mehra)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample("research")}
            className="px-2.5 py-1 rounded-lg bg-[#2a221a] hover:bg-[#3a2d20] border border-[#de8535]/40 text-[#f5aa67] text-[11px] transition cursor-pointer flex items-center gap-1 font-mono"
          >
            <Sparkles className="w-3 h-3" />
            + Research Paper (MSFHNet Q1)
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample("event")}
            className="px-2.5 py-1 rounded-lg bg-[#2a1d1d] hover:bg-[#382424] border border-[#c9523c]/40 text-[#fca5a5] text-[11px] transition cursor-pointer flex items-center gap-1 font-mono"
          >
            <Calendar className="w-3 h-3" />
            + FDP Event Circular
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample("standard")}
            className="px-2.5 py-1 rounded-lg bg-[#1b232a] hover:bg-[#22303c] border border-[#3d6a8a]/40 text-[#93c5fd] text-[11px] transition cursor-pointer flex items-center gap-1 font-mono"
          >
            <BookOpen className="w-3 h-3" />
            + NAAC Standard SOP
          </button>
        </div>

        {/* Queued Files List */}
        {files.length > 0 && (
          <div className="space-y-2.5 pt-2 border-t border-[#262a28]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#f5f1e8] font-sans">
                Queued for Ingestion ({files.length} file{files.length > 1 ? "s" : ""}):
              </span>
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-[11px] text-[#c9523c] hover:underline cursor-pointer"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#1a1d1b] border border-[#2e3430] flex items-center justify-between text-xs text-[#f5f1e8] shadow-sm animate-in fade-in"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-[#222624] border border-[#2e3430] shrink-0">
                      {getFileIcon(f.name)}
                    </div>
                    <div className="truncate">
                      <div className="font-mono text-xs truncate max-w-[200px]">{f.name}</div>
                      <div className="text-[10px] text-[#7d776b]">{(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-1 text-[#7d776b] hover:text-[#c9523c] rounded hover:bg-[#222624] transition cursor-pointer"
                    title="Remove"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          className="w-full py-3.5 bg-[#de8535] hover:bg-[#c9752b] disabled:opacity-40 disabled:hover:bg-[#de8535] text-[#131514] font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer font-sans uppercase tracking-wider"
        >
          {uploading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#131514]" />
              <span>{activeStep || "Autonomous Ingestion in Progress..."}</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#131514]" />
              <span>Run Autonomous Ingestion & Vectorization ({files.length} Document{files.length === 1 ? "" : "s"})</span>
            </>
          )}
        </button>

        {/* Error Notice */}
        {error && (
          <div className="p-4 rounded-xl bg-[#c9523c]/15 border border-[#c9523c]/30 text-[#fca5a5] flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-[#c9523c]" />
            <div className="text-xs font-sans">
              <strong className="block font-bold">Ingestion Error</strong>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Ingestion Results Breakdown */}
      {results && results.length > 0 && (
        <div className="p-6 bg-[#161817] border border-[#2e3430] rounded-2xl shadow-xl space-y-5 animate-in fade-in">
          {/* Summary Stats Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#262a28] gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#4b9b74] uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Ingestion & Auto-Classification Complete!</span>
              </div>
              <h3 className="text-sm font-semibold text-[#f5f1e8] font-sans">
                Embedded {summary?.total_records_ingested || results.length} total records across {results.length} file(s) into Sovereign Vault.
              </h3>
            </div>

            {/* Category Counts Breakdown */}
            {summary?.category_breakdown && (
              <div className="flex flex-wrap items-center gap-1.5">
                {Object.entries(summary.category_breakdown).map(([cat, count]: [string, any]) => {
                  if (count === 0) return null;
                  const meta = getCategoryBadge(cat);
                  return (
                    <span
                      key={cat}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold flex items-center gap-1 ${meta.color}`}
                    >
                      <span>{count}</span>
                      <span>{meta.label}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Individual File Result Cards */}
          <div className="space-y-3">
            {results.map((item, idx) => {
              const meta = getCategoryBadge(item.category);
              const BadgeIcon = meta.icon;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#1a1d1b] border border-[#2e3430] hover:border-[#383e3a] transition flex flex-col md:flex-row md:items-center justify-between gap-4 tactile-chamfer"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#f5f1e8] flex items-center gap-1.5">
                        {getFileIcon(item.filename)}
                        {item.filename}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${meta.color}`}>
                        <BadgeIcon className="w-3 h-3" />
                        {item.category_label}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4b9b74]/15 text-[#4b9b74] border border-[#4b9b74]/30 font-semibold">
                        {(item.confidence * 100).toFixed(0)}% Confident
                      </span>
                    </div>

                    {/* Detected Classification Signals */}
                    {item.signals && item.signals.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-[11px] text-[#b8b2a4]">
                        <span className="text-[#7d776b] font-mono text-[10px]">Detected:</span>
                        {item.signals.map((sig, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-1.5 py-0.5 rounded bg-[#131514] border border-[#2a2f2c] text-[#8e897e] font-mono text-[10px]"
                          >
                            {sig}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] text-[#7d776b]">
                      Vectorized {item.records_ingested} entity record(s) &bull; Indexed in on-premise BGE-M3 RAG
                    </div>
                  </div>

                  {/* Direct Switch to Destination Tab */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSwitchTab?.(meta.tab)}
                      className="px-3.5 py-2 rounded-xl bg-[#222624] hover:bg-[#282d2a] border border-[#383e3a] hover:border-[#de8535]/50 text-xs font-semibold text-[#f5f1e8] transition cursor-pointer flex items-center gap-1.5 shadow-sm group"
                    >
                      <span>View in {meta.label} Tab</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#de8535] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
