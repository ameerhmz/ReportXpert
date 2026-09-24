"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Award, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Globe2, 
  Layers, 
  BookOpen, 
  RefreshCw,
  Square
} from "lucide-react";
import { FrameworkInfo } from "../FrameworkTemplatesModal";

const STATIC_FRAMEWORK_DETAILS: Record<string, { criteria_list: string[]; sheet_list: string[]; badge: string; color: string }> = {
  NAAC: {
    badge: "Accreditation",
    color: "#de8535",
    criteria_list: [
      "Criterion 1: Curricular Aspects (Curriculum Design, CBCS, Feedback Systems)",
      "Criterion 2: Teaching-Learning & Evaluation (Student Enrollment, Diversity, CIE)",
      "Criterion 3: Research, Innovations & Extension (Grants, Seed Money, MoUs, Patents)",
      "Criterion 4: Infrastructure & Learning Resources (Classrooms, LMS, Wi-Fi Bandwidth)",
      "Criterion 5: Student Support & Progression (Scholarships, Career Guidance, Placements)",
      "Criterion 6: Governance, Leadership & Management (Vision, Strategic Plan, E-Governance)",
      "Criterion 7: Institutional Values & Best Practices (Green Audit, Gender Equity, NEP 2020)"
    ],
    sheet_list: [
      "1. Institutional Profile (AISHE, 2(f)/12(B), NAAC Cycles)",
      "2. Curricular Aspects (Metric 1.1 - 1.4)",
      "3. Teaching-Learning (Metric 2.1 - 2.7)",
      "4. Research & Extension (Metric 3.1 - 3.7)",
      "5. Infrastructure (Metric 4.1 - 4.4)",
      "6. Student Support (Metric 5.1 - 5.4)",
      "7. Governance & Leadership (Metric 6.1 - 6.5)",
      "8. Values & Best Practices (Metric 7.1 - 7.3)"
    ]
  },
  NIRF: {
    badge: "Govt Ranking",
    color: "#4b9b74",
    criteria_list: [
      "TLR (30%): Teaching, Learning & Resources (SS, FSR, FQ, FRU)",
      "RPC (30%): Research and Professional Practice (PU, QP, IPR, FPPP)",
      "GO (20%): Graduation Outcomes (GUE, GMS, GPHD)",
      "OI (10%): Outreach and Inclusivity (RD, WD, ES, PCS)",
      "PR (10%): Peer Perception (Academic & Employer Ratings)"
    ],
    sheet_list: [
      "1. Institutional Summary (Approved Intake & Actual Enrollment)",
      "2. TLR - Faculty & Student (FSR 1:15, Ph.D. Faculty, Capital Capex)",
      "3. RPC - Research & Patents (Scopus/WoS Publications, Citations, Grants)",
      "4. GO - Graduation Outcomes (Placements, Median Salary, Ph.D. Graduated)",
      "5. OI - Outreach & Diversity (Inter-state, Women %, PwD Facilities)",
      "6. PR - Perception & Ratings (Academic Peers & Public Disclosures)"
    ]
  },
  UGC: {
    badge: "Statutory",
    color: "#3d6a8a",
    criteria_list: [
      "Statutory Mandate: Section 2(f) & 12(B) of UGC Act 1956",
      "NEP 2020 Compliance: Curriculum & Credit Framework for UG (CCFUG)",
      "PBAS / CAS Category I: Teaching, Learning and Evaluation Activities",
      "PBAS / CAS Category II: Professional Development & Co-Curricular Governance",
      "PBAS / CAS Category III: Research & Academic Contributions (API Scores)"
    ],
    sheet_list: [
      "1. Statutory Compliance (2(f), 12(B), Land, Endowment, NEP 2020)",
      "2. CAS API - Category I (Teaching Hours, Examination Duties, Mentoring)",
      "3. CAS API - Category II (Institutional Committees, IQAC, Extension)",
      "4. CAS API - Category III (UGC-CARE Journals, Books, Funded Projects)"
    ]
  },
  WASC: {
    badge: "US / Global",
    color: "#9d5cdb",
    criteria_list: [
      "Standard 1: Defining Institutional Purposes and Ensuring Educational Objectives (CFR 1.1 - 1.8)",
      "Standard 2: Achieving Educational Objectives Through Core Functions (CFR 2.1 - 2.14)",
      "Standard 3: Developing and Applying Resources and Organizational Structures (CFR 3.1 - 3.10)",
      "Standard 4: Creating an Organization Committed to Quality Assurance and Improvement (CFR 4.1 - 4.7)"
    ],
    sheet_list: [
      "1. Institutional Profile (Accreditation History, Mission, Degrees)",
      "2. Standard 1 Inventory (Purpose, Integrity, Educational Intent)",
      "3. Standard 2 Inventory (Core Functions, Teaching, Research, Retention)",
      "4. Standard 3 Inventory (Faculty Resources, Fiscal Sustainability)",
      "5. Standard 4 Inventory (Assessment of Learning, Quality Assurance)"
    ]
  },
  QAA: {
    badge: "UK / Global",
    color: "#c9523c",
    criteria_list: [
      "Standard 1.1: Policy for Quality Assurance & Governance",
      "Standard 1.2: Design and Approval of Programmes & Learning Outcomes",
      "Standard 1.3: Student-Centred Learning, Teaching and Assessment",
      "Standard 1.4: Student Admission, Progression, Recognition and Certification",
      "Standard 1.5: Teaching Staff Qualifications, Recruitment & Continuous Development",
      "Standard 1.6: Learning Resources, Laboratories and Student Support Services",
      "Standard 1.7: Information Management & Student Information Systems",
      "Standard 1.8: Public Information Transparency & Integrity",
      "Standard 1.9: On-going Monitoring and Periodic Review of Programmes",
      "Standard 1.10: Cyclical External Quality Assurance"
    ],
    sheet_list: [
      "1. Institutional Overview (UK / International IQR Profile)",
      "2. ESG Standards 1.1-1.5 Matrix (Curriculum, Teaching, Staff Qualifications)",
      "3. ESG Standards 1.6-1.10 Matrix (Infrastructure, Info Systems, Reviews)",
      "4. Continuous QA Action Plan (Findings, Target Dates, Responsible Officers)"
    ]
  },
  MDRA: {
    badge: "Media Ranking",
    color: "#e5a04e",
    criteria_list: [
      "Pillar 1: Selection Process & Governance (Intake Quality, Cutoffs, Reserved Category)",
      "Pillar 2: Academic Excellence (Faculty Ph.D. %, Faculty-Student Ratio, Curriculum Review)",
      "Pillar 3: Infrastructure & Living Experience (Campus Acres, Hostels, Lab Equipment, Library)",
      "Pillar 4: Personality & Leadership Development (Clubs, Cultural Festivals, Sports, NSS)",
      "Pillar 5: Career Progression & Placements (Companies Visited, Highest Package, ROI)"
    ],
    sheet_list: [
      "1. General College Factsheet (Affiliation, Courses, AICTE/UGC Status)",
      "2. Pillar 1 - Selection Process (Applications Received, Cutoff Percentiles)",
      "3. Pillar 2 - Academic Excellence (Faculty Profiles, Scopus Research)",
      "4. Pillar 3 - Infrastructure (Auditorium, Green Campus, Bandwidth)",
      "5. Pillar 4 - Student Development (Hackathons, Student Leadership)",
      "6. Pillar 5 - Career Placements (Median Salary, Recruiter Roster)"
    ]
  },
  HANSA: {
    badge: "Media Ranking",
    color: "#4a85b5",
    criteria_list: [
      "Pillar 1: Academic & Research Excellence (Weightage: 300 / 1,000 Points)",
      "Pillar 2: Industry Interface & Placement (Weightage: 250 / 1,000 Points)",
      "Pillar 3: Governance & Administration (Weightage: 150 / 1,000 Points)",
      "Pillar 4: Infrastructure & Facilities (Weightage: 150 / 1,000 Points)",
      "Pillar 5: Diversity & Outreach (Weightage: 150 / 1,000 Points)"
    ],
    sheet_list: [
      "1. Institutional Profile (Establishment, Campus Size, Accreditation)",
      "2. Pillar 1 - Academic Excellence (300 Pts: Faculty, Scopus, H-Index)",
      "3. Pillar 2 - Industry Interface (250 Pts: Internships, Placement Rate)",
      "4. Pillar 3 - Governance (150 Pts: Finance, IQAC, Student Council)",
      "5. Pillar 4 - Infrastructure (150 Pts: High-tech Labs, Library Volumes)",
      "6. Pillar 5 - Diversity (150 Pts: Regional Diversity, Scholarships)"
    ]
  }
};

interface FrameworkTemplatesViewProps {
  onLaunchAudit?: (framework: string) => void;
}

export const FrameworkTemplatesView: React.FC<FrameworkTemplatesViewProps> = ({ onLaunchAudit }) => {
  const [frameworks, setFrameworks] = useState<Record<string, FrameworkInfo>>({});
  const [selectedKey, setSelectedKey] = useState<string>("NAAC");
  const [department, setDepartment] = useState<string>("University-Wide");
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingFormat, setGeneratingFormat] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://127.0.0.1:8000/api/frameworks/templates");
        if (res.ok) {
          const data = await res.json();
          if (data.frameworks) {
            setFrameworks(data.frameworks);
          }
        }
      } catch (e) {
        console.error("Could not fetch frameworks metadata:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const currentMeta = frameworks[selectedKey] || {
    id: selectedKey,
    name: `${selectedKey} Compliance Framework`,
    organization: "Statutory Accreditation Body",
    country: "Accreditation Authority",
    framework_type: "Accreditation & Ranking",
    standards: "Statutory Higher Education Metrics",
    file_formats: ["xlsx", "docx"],
    primary_outputs: ["Quantitative Metrics (.xlsx)", "Official Submission Dossier (.docx)"]
  };

  const currentDetails = STATIC_FRAMEWORK_DETAILS[selectedKey] || {
    badge: "Official",
    color: "#de8535",
    criteria_list: ["Standard Criteria and Evaluation Parameters"],
    sheet_list: ["Quantitative Evaluation Sheets"]
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setGeneratingFormat(null);
    try {
      fetch("http://127.0.0.1:8000/api/frameworks/stop", { method: "POST" }).catch(() => {});
    } catch (e) {}
  };

  const handleDownload = async (format: "xlsx" | "docx" | "both") => {
    try {
      setGeneratingFormat(format);
      setDownloadSuccess(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const formData = new FormData();
      formData.append("framework", selectedKey);
      formData.append("department", department);
      formData.append("format", format);

      const res = await fetch("http://127.0.0.1:8000/api/frameworks/generate", {
        method: "POST",
        body: formData,
        signal: controller.signal
      });

      if (!res.ok) throw new Error("Failed to generate framework dossier");

      const data = await res.json();

      if (format === "xlsx" || format === "both") {
        if (data.xlsx_url) {
          const a = document.createElement("a");
          a.href = `http://127.0.0.1:8000${data.xlsx_url}`;
          a.download = data.xlsx_filename || `${selectedKey}_Data_Sheet.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }

      if (format === "docx" || format === "both") {
        if (data.docx_url) {
          setTimeout(() => {
            const a = document.createElement("a");
            a.href = `http://127.0.0.1:8000${data.docx_url}`;
            a.download = data.docx_filename || `${selectedKey}_Dossier.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }, 300);
        }
      }

      setDownloadSuccess(`Successfully compiled and downloaded official ${selectedKey} files.`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (e: any) {
      if (e.name === "AbortError" || e.message?.includes("aborted")) {
        return;
      }
      console.error(e);
      alert(`Error generating submission files: ${e.message}`);
    } finally {
      abortControllerRef.current = null;
      setGeneratingFormat(null);
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Top Banner */}
      <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl shadow-xl tactile-chamfer flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-[#f5f1e8] flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-yellow-400" />
            Statutory Accreditation & Ranking Framework Submission Cockpit
          </h2>
          <p className="text-xs text-[#b8b2a4]">
            Official submission dossiers (.docx) and multi-sheet data capture workbooks (.xlsx) aligned with all 7 statutory bodies (NAAC, NIRF, UGC, WASC, QAA, MDRA, Hansa).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-[#4b9b74]/15 text-[#4b9b74] border border-[#4b9b74]/30 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            7 Standards Grounded
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="px-4 py-2.5 bg-[#4b9b74]/20 border border-[#4b9b74]/30 rounded-xl text-[#4b9b74] text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Framework Selection (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="px-2 pb-1 text-[10px] font-mono font-bold tracking-wider text-[#7d776b] uppercase">
            Select Accreditation Body
          </div>

          <div className="space-y-2">
            {Object.keys(STATIC_FRAMEWORK_DETAILS).map((key) => {
              const info = frameworks[key] || { id: key, name: `${key} Framework`, country: "Regulatory Body" };
              const details = STATIC_FRAMEWORK_DETAILS[key];
              const isSelected = selectedKey === key;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-[#1f2421] border-[#de8535]/80 shadow-md ring-1 ring-[#de8535]/30"
                      : "bg-[#181b19] border-[#2a2f2c] hover:bg-[#1e2220] hover:border-[#383e3a]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wide font-mono text-[#f5f1e8]">
                      {key}
                    </span>
                    <span 
                      className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border"
                      style={{ 
                        backgroundColor: `${details.color}15`, 
                        color: details.color,
                        borderColor: `${details.color}40`
                      }}
                    >
                      {details.badge}
                    </span>
                  </div>

                  <div className="text-[11px] font-medium text-[#dcd7cb] leading-tight line-clamp-2">
                    {info.name}
                  </div>

                  <div className="text-[10px] text-[#7d776b] font-mono flex items-center gap-1">
                    <Globe2 className="w-3 h-3 text-[#7d776b]" />
                    <span className="truncate">{info.country || "Statutory Authority"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Framework Deep Dive (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Header Card */}
          <div className="p-5 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm border"
                  style={{ 
                    backgroundColor: `${currentDetails.color}20`,
                    color: currentDetails.color,
                    borderColor: `${currentDetails.color}50`
                  }}
                >
                  {selectedKey}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f5f1e8]">
                    {currentMeta.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#b8b2a4]">
                    <span className="font-semibold text-[#de8535]">{currentMeta.organization}</span>
                    <span>•</span>
                    <span>{currentMeta.country}</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-[#222624] text-[#b8b2a4] border border-[#2e3430]">
                {currentMeta.framework_type}
              </span>
            </div>

            {/* Scope / Department */}
            <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-[#2e3430]">
              <label className="text-xs font-semibold text-[#b8b2a4]">Submission Scope:</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="bg-[#131514] border border-[#2e3430] rounded-xl px-3 py-1.5 text-xs text-[#f5f1e8] font-mono focus:outline-none focus:border-[#de8535]"
              >
                <option value="University-Wide">University-Wide (Consolidated Institutional)</option>
                <option value="Computer Science & Engineering">Dept of Computer Science & Engineering</option>
                <option value="Electronics & Communication">Dept of Electronics & Communication</option>
                <option value="Mechanical Engineering">Dept of Mechanical Engineering</option>
                <option value="Biotechnology">Dept of Biotechnology</option>
                <option value="School of Management">School of Management & Business</option>
              </select>
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1c221e] to-[#1a1d1b] border border-[#2e3430] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#f5f1e8]">Generate Official Deliverables</div>
              <div className="text-[11px] text-[#7d776b]">Compiled instantaneously with verified university research & achievement data.</div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleDownload("xlsx")}
                disabled={generatingFormat !== null}
                className="px-3.5 py-2 rounded-xl bg-[#4b9b74] hover:bg-[#438a68] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {generatingFormat === "xlsx" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                Download Sheet (.xlsx)
              </button>

              <button
                onClick={() => handleDownload("docx")}
                disabled={generatingFormat !== null}
                className="px-3.5 py-2 rounded-xl bg-[#3d6a8a] hover:bg-[#345b77] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {generatingFormat === "docx" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Download Dossier (.docx)
              </button>

              <button
                onClick={() => handleDownload("both")}
                disabled={generatingFormat !== null}
                className="px-3.5 py-2 rounded-xl bg-[#de8535] hover:bg-[#c9752b] text-[#131514] text-xs font-black transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {generatingFormat === "both" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Complete Package (Both)
              </button>

              {generatingFormat !== null && (
                <button
                  type="button"
                  onClick={handleStopGenerating}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md animate-pulse active:scale-95"
                  title="Stop generation immediately"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Generation</span>
                </button>
              )}

              {onLaunchAudit && (
                <button
                  onClick={() => onLaunchAudit(selectedKey)}
                  className="px-3.5 py-2 rounded-xl bg-[#222624] hover:bg-[#282d2a] border border-[#2e3430] hover:border-[#de8535]/50 text-[#f5f1e8] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Audit institutional readiness against this framework using Sovereign AI"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#de8535]" />
                  AI Pre-Audit
                </button>
              )}
            </div>
          </div>

          {/* Criteria & Sheets Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Criteria List */}
            <div className="p-4 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#de8535] uppercase tracking-wider font-mono">
                <BookOpen className="w-4 h-4" />
                Statutory Evaluation Criteria & Rubrics
              </div>
              <div className="space-y-2">
                {currentDetails.criteria_list.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#131514] border border-[#242826] text-xs text-[#dcd7cb] leading-relaxed flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#de8535] mt-1.5 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sheet Architecture */}
            <div className="p-4 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4b9b74] uppercase tracking-wider font-mono">
                <Layers className="w-4 h-4" />
                Quantitative Data Sheets in (.xlsx)
              </div>
              <div className="space-y-2">
                {currentDetails.sheet_list.map((s, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#131514] border border-[#242826] text-xs text-[#dcd7cb] leading-relaxed flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-[#4b9b74] shrink-0" />
                      <span className="font-mono text-xs">{s}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#4b9b74]/10 text-[#4b9b74] border border-[#4b9b74]/20 font-bold shrink-0">
                      LIVE FORMULAS
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Verification Sign-Off Footer */}
          <div className="p-4 rounded-2xl bg-[#131514] border border-[#2e3430] flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-[#de8535] shrink-0" />
              <div className="text-[11px] text-[#b8b2a4]">
                <strong className="text-[#f5f1e8]">Deterministic Compliance Sign-Off:</strong> All dossiers feature embedded 3-stage signature verification (IQAC Coordinator, Dean of Academic Affairs, Registrar / Vice-Chancellor).
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#2e3430] text-[#f5f1e8] font-bold">
              100% On-Premise Air-Gapped
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
