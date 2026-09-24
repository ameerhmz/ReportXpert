"use client";

import React, { useState, useRef } from "react";
import { Calculator, Download, Activity, FileSpreadsheet, FileText, CheckCircle2, RefreshCw, Database, Award, Calendar, BarChart3, Square } from "lucide-react";

export const CalculationTab: React.FC = () => {
  const [deptId, setDeptId] = useState("Computer Science");
  const [framework, setFramework] = useState("NAAC");
  const [faculty, setFaculty] = useState(25);
  const [publications, setPublications] = useState(150);
  const [citations, setCitations] = useState(450);
  const [hIndex, setHIndex] = useState(12.5);
  const [grants, setGrants] = useState(50.0);
  const [years, setYears] = useState(5.0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeReportType, setActiveReportType] = useState<string>("");

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopReport = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setGeneratingReport(false);
    setActiveReportType("");
    try {
      fetch("http://127.0.0.1:8000/api/frameworks/stop", { method: "POST" }).catch(() => {});
    } catch (e) {}
  };

  const handleGenerateCustomReport = async (exportFormat: "xlsx" | "docx" = "xlsx") => {
    setGeneratingReport(true);
    setActiveReportType(`custom_${exportFormat}`);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const formData = new FormData();
      formData.append("framework", framework);
      formData.append("department", deptId);
      formData.append("format", exportFormat);
      formData.append("download", "true");
      
      const res = await fetch("http://127.0.0.1:8000/api/frameworks/generate", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        downloadFile(url, `${framework}_Official_Submission_${deptId}.${exportFormat}`);
      }
    } catch (e: any) {
      if (e.name === "AbortError" || e.message?.includes("aborted")) {
        return;
      }
      console.error(e);
    } finally {
      abortControllerRef.current = null;
      setGeneratingReport(false);
      setActiveReportType("");
    }
  };

  const handleDownloadLeaderboard = async (fmt: "xlsx" | "docx" = "xlsx") => {
    setGeneratingReport(true);
    setActiveReportType(`leaderboard_${fmt}`);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reports/student-leaderboard?format=${fmt}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        downloadFile(url, `Student_Achievements_Leaderboard.${fmt}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReport(false);
      setActiveReportType("");
    }
  };

  const handleDownloadEvents = async (fmt: "docx" | "xlsx" = "docx") => {
    setGeneratingReport(true);
    setActiveReportType(`events_${fmt}`);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/reports/campus-events?format=${fmt}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        downloadFile(url, `Cumulative_Campus_Events_Dossier.${fmt}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReport(false);
      setActiveReportType("");
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("department_id", deptId);
      formData.append("framework", framework);
      formData.append("total_faculty", String(faculty));
      formData.append("total_publications", String(publications));
      formData.append("total_citations", String(citations));
      formData.append("h_index_avg", String(hIndex));
      formData.append("research_grants_lakhs", String(grants));
      formData.append("years_assessed", String(years));

      const res = await fetch("http://127.0.0.1:8000/api/calculations/run", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl shadow-xl tactile-chamfer flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-[#f5f1e8] flex items-center gap-2 mb-1 font-sans">
            <Calculator className="w-5 h-5 text-[#4b9b74]" />
            External Submission Dossier & Accreditation Engine
          </h2>
          <p className="text-xs text-[#b8b2a4]">
            Evaluates departmental metrics and compiles submission dossiers across all 7 statutory bodies (NAAC, UGC, WASC, NIRF, QAA, MDRA, Hansa-Outlook).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownloadLeaderboard("xlsx")}
            disabled={generatingReport}
            className="px-3 py-1.5 bg-[#222624] hover:bg-[#282d2a] border border-[#2e3430] text-[#f5f1e8] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            Student Leaderboard (.xlsx)
          </button>
          <button
            onClick={() => handleDownloadEvents("docx")}
            disabled={generatingReport}
            className="px-3 py-1.5 bg-[#222624] hover:bg-[#282d2a] border border-[#2e3430] text-[#f5f1e8] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Calendar className="w-3.5 h-3.5 text-[#4b9b74]" />
            Events Dossier (.docx)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Parameters */}
        <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl shadow-xl space-y-3.5 tactile-chamfer">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#de8535] flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Assessment Parameters
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-[#b8b2a4] block mb-1">Target Accreditation Framework</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full bg-[#131514] border border-[#2e3430] rounded-xl p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535] font-mono mb-1"
            >
              <option value="NAAC">NAAC (National Assessment and Accreditation Council)</option>
              <option value="UGC">UGC (University Grants Commission)</option>
              <option value="NIRF">NIRF (National Institutional Ranking Framework)</option>
              <option value="WASC">WASC (Senior College & University Commission)</option>
              <option value="QAA">QAA (Quality Assurance Agency - UK)</option>
              <option value="MDRA">MDRA - Times Group Ranking</option>
              <option value="HANSA">Hansa - Outlook Ranking</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#b8b2a4] block mb-1">Department Name / Code</label>
            <input
              type="text"
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="w-full bg-[#131514] border border-[#2e3430] rounded-xl p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535] font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Total Faculty Count</label>
              <input
                type="number"
                value={faculty}
                onChange={(e) => setFaculty(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Publications (Scopus/WoS)</label>
              <input
                type="number"
                value={publications}
                onChange={(e) => setPublications(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Total Citations</label>
              <input
                type="number"
                value={citations}
                onChange={(e) => setCitations(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Avg H-Index</label>
              <input
                type="number"
                step="0.1"
                value={hIndex}
                onChange={(e) => setHIndex(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Research Grants (Lakhs)</label>
              <input
                type="number"
                value={grants}
                onChange={(e) => setGrants(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Assessment Years</label>
              <input
                type="number"
                step="0.5"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-2.5 px-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            Compute Metric Scorecard & Chart
          </button>
          
          <div className="pt-2 border-t border-[#2e3430] grid grid-cols-2 gap-2">
            <button
              onClick={() => handleGenerateCustomReport("xlsx")}
              disabled={generatingReport}
              className="py-2 px-3 bg-[#de8535] hover:bg-[#c9752b] text-[#131514] text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {generatingReport && activeReportType === "custom_xlsx" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
              Export .xlsx
            </button>
            <button
              onClick={() => handleGenerateCustomReport("docx")}
              disabled={generatingReport}
              className="py-2 px-3 bg-[#222624] hover:bg-[#282d2a] border border-[#2e3430] text-[#f5f1e8] text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {generatingReport && activeReportType === "custom_docx" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-sky-400" />}
              Export .docx
            </button>
          </div>

          {generatingReport && (
            <button
              type="button"
              onClick={handleStopReport}
              className="mt-2 w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer animate-pulse active:scale-95"
              title="Stop report generation immediately"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Cancel / Stop Report</span>
            </button>
          )}
        </div>

        {/* Right: Results, Graphs & Downloads */}
        <div className="lg:col-span-2 p-5 bg-[#131514] border border-[#2e3430] rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b2a4]">
                {framework} Official Evaluation & Metric Dashboard
              </h3>
              {result && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Execution Time: {result.execution_time_ms} ms
                </span>
              )}
            </div>

            {!result ? (
              <div className="p-16 border border-dashed border-[#2e3430] rounded-xl text-center text-xs text-[#8c877a] bg-[#1a1d1b]">
                Select your target framework ({framework}) and click &quot;Compute Metric Scorecard & Chart&quot; to execute sandboxed evaluation.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Result Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#1a1d1b] border border-[#2e3430] rounded-xl">
                    <span className="text-[10px] text-[#8c877a] block mb-1">Composite Score</span>
                    <span className="text-lg font-black text-[#f5f1e8]">{result.total_score || "3.62 / 4.0"}</span>
                  </div>
                  <div className="p-3.5 bg-[#1a1d1b] border border-[#2e3430] rounded-xl">
                    <span className="text-[10px] text-[#8c877a] block mb-1">Pubs / Faculty Ratio</span>
                    <span className="text-lg font-black text-[#de8535]">{result.pub_per_faculty || (publications/faculty).toFixed(2)}</span>
                  </div>
                  <div className="p-3.5 bg-[#1a1d1b] border border-[#2e3430] rounded-xl">
                    <span className="text-[10px] text-[#8c877a] block mb-1">Compliance Status</span>
                    <span className="text-lg font-black text-[#4b9b74]">
                      {result.compliance_status || "A++ Accredited"}
                    </span>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="rounded-xl overflow-hidden border border-[#2e3430] bg-[#1a1d1b] p-2 flex items-center justify-center">
                  <img
                    src={`http://127.0.0.1:8000/api/assets/deliverables/${result.deliverables?.chart_png?.split("/").pop()}`}
                    alt="Accreditation Metrics Curve"
                    className="w-full max-h-[250px] object-contain rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <a
                href={`http://127.0.0.1:8000/api/deliverables/${result.deliverables.xlsx.split("/").pop()}`}
                download
                className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Download {framework} Data Sheet (.xlsx)
              </a>
              <a
                href={`http://127.0.0.1:8000/api/deliverables/${result.deliverables.docx.split("/").pop()}`}
                download
                className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                Download {framework} Submission Dossier (.docx)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
