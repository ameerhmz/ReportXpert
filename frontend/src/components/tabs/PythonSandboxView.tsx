"use client";

import React, { useState } from "react";
import { 
  Play, 
  Terminal, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Loader2,
  Code2
} from "lucide-react";

const DEFAULT_SCRIPT = `# NAAC / NIRF Academic Research & Accreditation Metrics Calculator
total_faculty = 45
total_students = 675
scopus_publications = 180
total_citations = 950
h_index_avg = 14.2
research_grants_lakhs = 78.50  # INR Lakhs
assessment_years = 5.0

# 1. Faculty-Student Ratio (FSR) (UGC / NAAC Benchmark: 1:15)
fsr = total_students / total_faculty
fsr_score = min(20.0, (15.0 / fsr) * 20.0) if fsr > 0 else 0.0

# 2. Research Publications per Faculty (RPF) (Criterion 3.4)
pub_per_faculty = scopus_publications / total_faculty

# 3. Citation Impact per Paper (CPP)
citations_per_paper = total_citations / scopus_publications if scopus_publications > 0 else 0

# 4. NIRF Research & Professional Practice (RPC) Composite Score (out of 100)
# Formula: Combined score of Publications (Pub), Citations (Cit), and Sponsored Research (FPSR)
score_publications = min(35.0, (pub_per_faculty / 3.0) * 35.0)
score_citations = min(35.0, (citations_per_paper / 5.0) * 35.0)
score_grants = min(30.0, (research_grants_lakhs / (total_faculty * 1.5)) * 30.0)
nirf_rpc_score = score_publications + score_citations + score_grants

print("=" * 50)
print("  OFFICIAL NAAC & NIRF ACCREDITATION AUDIT REPORT")
print("=" * 50)
print(f"Faculty-to-Student Ratio (FSR):   1:{fsr:.1f} (Score: {fsr_score:.1f}/20)")
print(f"Publications per Faculty:         {pub_per_faculty:.2f} papers/faculty")
print(f"Average Citation per Paper:       {citations_per_paper:.2f} citations")
print(f"Sponsored Grants per Faculty:     ₹{research_grants_lakhs/total_faculty:.2f} Lakhs")
print(f"NIRF RPC Composite Score:         {nirf_rpc_score:.2f} / 100")
print("-" * 50)
if fsr <= 15.0 and nirf_rpc_score >= 60.0:
    print("STATUS: ✓ EXCELLENT — FULLY COMPLIANT WITH A++ BENCHMARK")
else:
    print("STATUS: ⚠️ GAP IDENTIFIED — FACULTY RATIO OR CITATIONS REQUIRE UPLIFT")
print("=" * 50)
`;

export const PythonSandboxView: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_SCRIPT);
  const [stdout, setStdout] = useState("");
  const [stderr, setStderr] = useState("");
  const [execTime, setExecTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [deliverables, setDeliverables] = useState<{ xlsx?: string; docx?: string; chart?: string }>({});

  const handleRunCode = async () => {
    setIsRunning(true);
    setStdout("");
    setStderr("");
    try {
      // 1. Execute code in sandbox
      const res = await fetch("http://127.0.0.1:8000/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      setStdout(data.stdout || "");
      setStderr(data.stderr || "");
      setExecTime(data.execution_time_ms || 0);

      // 2. Also trigger deliverables compilation for full pipeline integrity
      const calcRes = await fetch("http://127.0.0.1:8000/api/calculations/run", {
        method: "POST",
        body: new URLSearchParams({
          department_id: "Computer Science & Engineering",
          framework: "NAAC",
          total_faculty: "25",
          total_publications: "150",
          total_citations: "450",
          h_index_avg: "12.5",
          research_grants_lakhs: "50.0",
          years_assessed: "5.0"
        })
      });
      const calcData = await calcRes.json();
      if (calcData.deliverables) {
        setDeliverables({
          xlsx: calcData.deliverables.xlsx,
          docx: calcData.deliverables.docx,
          chart: calcData.deliverables.chart_png
        });
      }
    } catch (err: any) {
      setStderr(err.message || "Failed to execute in sandbox.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#0E1322]/90 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* View Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-[#0B0F19]/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Isolated Python Code Sandbox
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Local Subprocess
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Generates and executes Python scripts with execution guards to calculate NAAC/NIRF academic metrics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCode(DEFAULT_SCRIPT)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl transition cursor-pointer"
            title="Reset Script"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Content: Code on Left, Terminal & Output on Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left: Code Editor */}
        <div className="flex flex-col border-r border-slate-800 bg-[#070A14]">
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>academic_metrics_calc.py</span>
            <span className="text-[10px] text-slate-500">Python 3.12 (Sandboxed)</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 p-4 bg-transparent text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-emerald-500/20"
            spellCheck={false}
          />
        </div>

        {/* Right: Console Output & Generated Deliverables */}
        <div className="flex flex-col bg-[#090D18] overflow-y-auto p-5 space-y-4">
          {/* Execution Time Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>Sandbox Console Output</span>
            </div>
            {execTime !== null && (
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-emerald-400">
                ⚡ {execTime} ms runtime
              </span>
            )}
          </div>

          {/* Console Box */}
          <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 font-mono text-xs min-h-[220px] whitespace-pre-wrap leading-relaxed">
            {stdout ? (
              <span className="text-slate-200">{stdout}</span>
            ) : stderr ? (
              <span className="text-red-400">{stderr}</span>
            ) : (
              <span className="text-slate-600">
                Click &quot;Execute Script&quot; above to run this code in an isolated subprocess.
              </span>
            )}
          </div>

          {/* Deliverables Section */}
          {deliverables && (deliverables.xlsx || deliverables.docx) && (
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <span className="text-xs font-bold text-white block">
                Compiled Industrial Deliverables:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {deliverables.xlsx && (
                  <a
                    href={`http://127.0.0.1:8000/api/deliverables/${deliverables.xlsx.split("/").pop()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-white transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium">Calculation Sheet (.xlsx)</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
                  </a>
                )}
                {deliverables.docx && (
                  <a
                    href={`http://127.0.0.1:8000/api/deliverables/${deliverables.docx.split("/").pop()}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-white transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-400" />
                      <span className="font-medium">Approval Memo (.docx)</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
