"use client";

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Award, 
  DollarSign, 
  HelpCircle, 
  RefreshCw, 
  ChevronRight, 
  Search, 
  Sliders, 
  ExternalLink,
  ShieldAlert,
  Copy,
  Check
} from "lucide-react";

export const ScholarshipFinderTab: React.FC = () => {
  // Query state
  const [queryText, setQueryText] = useState("");
  const [cgpa, setCgpa] = useState<number>(8.8);
  const [incomeLakhs, setIncomeLakhs] = useState<number>(4.2);
  const [category, setCategory] = useState<string>("OBC");
  const [gender, setGender] = useState<string>("FEMALE");
  const [department, setDepartment] = useState<string>("AIIT");

  const [evaluating, setEvaluating] = useState(false);
  const [matchResult, setMatchResult] = useState<any | null>(null);
  const [allScholarships, setAllScholarships] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [viewMode, setViewMode] = useState<"matcher" | "catalog">("matcher");
  const [copiedDoc, setCopiedDoc] = useState<string | null>(null);

  // Pre-set prompt chips matching Dr. Meenakshi Srivastava Ma'am's specification
  const PRESET_QUERIES = [
    {
      label: "Ma'am's Sample (8.8 CGPA, ₹4.2L Income)",
      text: "what are the scholarship available for a student having 8.8 CGPA and family income 4.2 Lakhs?",
      cgpa: 8.8,
      income: 4.2,
      cat: "OBC",
      gen: "FEMALE"
    },
    {
      label: "Top Meritorious Scholar (9.4 CGPA)",
      text: "Available scholarships for top ranker student with 9.4 CGPA and family income 12 Lakhs",
      cgpa: 9.4,
      income: 12.0,
      cat: "General",
      gen: "ALL"
    },
    {
      label: "AICTE Pragati (Girl Student, Technical)",
      text: "What scholarships can a female student in engineering get with 7.5 CGPA and family income 5 Lakhs?",
      cgpa: 7.5,
      income: 5.0,
      cat: "General",
      gen: "FEMALE"
    },
    {
      label: "Post-Matric SC/ST Full Reimbursement",
      text: "Scholarships available for SC category student with 7.2 CGPA and family income 2.0 Lakhs",
      cgpa: 7.2,
      income: 2.0,
      cat: "SC",
      gen: "ALL"
    }
  ];

  // Fetch full catalog
  const fetchScholarships = async () => {
    setLoadingList(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/scholarships/list");
      const data = await res.json();
      if (data && data.scholarships) {
        setAllScholarships(data.scholarships);
      }
    } catch (e) {
      console.error("Error loading scholarships list:", e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
    // Run initial evaluation with default Ma'am's parameters
    handleRunMatch();
  }, []);

  // Run Match Request
  const handleRunMatch = async (customQuery?: string) => {
    setEvaluating(true);
    try {
      const payload = {
        query_text: customQuery || queryText || undefined,
        cgpa: cgpa,
        income_lakhs: incomeLakhs,
        category: category,
        gender: gender,
        department: department
      };

      const res = await fetch("http://127.0.0.1:8000/api/scholarships/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === "success") {
        setMatchResult(data);
      }
    } catch (e) {
      console.error("Match scholarships error:", e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleApplyPreset = (p: typeof PRESET_QUERIES[0]) => {
    setQueryText(p.text);
    setCgpa(p.cgpa);
    setIncomeLakhs(p.income);
    setCategory(p.cat);
    setGender(p.gen);
    handleRunMatch(p.text);
  };

  const handleCopyDocs = (docs: string[], id: string) => {
    const text = docs.join("\n• ");
    navigator.clipboard.writeText(`Mandatory Documents for ${id}:\n• ${text}`);
    setCopiedDoc(id);
    setTimeout(() => setCopiedDoc(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#161817] text-[#ece8e1] overflow-hidden">
      {/* Top Banner */}
      <div className="px-6 py-4 border-b border-[#2e3430] bg-[#1a1d1b] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#f5f1e8] font-sans">
              Student Scholarship Eligibility & Policy Matcher
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4b9b74]/15 text-[#4b9b74] border border-[#4b9b74]/30 font-semibold">
              Requirement 5A Grounded (10 Verified Policies)
            </span>
          </div>
          <p className="text-[11px] text-[#b8b2a4] mt-0.5">
            Query and match student XYZ details (CGPA, family income, social category, gender) against institutional merit and statutory government schemes.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#131514] p-1 rounded-xl border border-[#2e3430] gap-1">
            <button
              onClick={() => setViewMode("matcher")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "matcher" ? "bg-[#2e3430] text-[#f5f1e8]" : "text-[#7d776b] hover:text-[#b8b2a4]"
              }`}
            >
              XYZ Eligibility Calculator
            </button>
            <button
              onClick={() => setViewMode("catalog")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "catalog" ? "bg-[#2e3430] text-[#f5f1e8]" : "text-[#7d776b] hover:text-[#b8b2a4]"
              }`}
            >
              Full Policy Catalog ({allScholarships.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {viewMode === "matcher" && (
          <div className="space-y-6">
            {/* Natural Language Prompt & Interactive Controls */}
            <div className="p-5 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#de8535]/15 text-[#de8535]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-[#f5f1e8]">
                    Prompt Query (Requirement 5A)
                  </h4>
                  <p className="text-[11px] text-[#7d776b]">
                    Enter arbitrary student inquiries like &quot;What are the scholarship available for a student having ... XYZ details&quot;
                  </p>
                </div>
              </div>

              {/* Natural Query Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#7d776b] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="e.g. What scholarships are available for a girl student having 8.8 CGPA and family income 4.2 Lakhs from OBC category?"
                    className="w-full bg-[#131514] border border-[#2e3430] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#f5f1e8] placeholder-[#555a56] focus:outline-none focus:border-[#de8535]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRunMatch();
                    }}
                  />
                </div>

                <button
                  onClick={() => handleRunMatch()}
                  disabled={evaluating}
                  className="px-5 py-2.5 rounded-xl bg-[#de8535] hover:bg-[#c97428] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50 shrink-0"
                >
                  {evaluating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Match Schemes</span>
                </button>
              </div>

              {/* Preset Query Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-[#7d776b] font-mono self-center mr-1">Quick Scenarios:</span>
                {PRESET_QUERIES.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#131514] hover:bg-[#222624] text-[#b8b2a4] hover:text-[#f5f1e8] border border-[#2e3430] hover:border-[#de8535]/50 transition cursor-pointer"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Fine-Tuning Sliders & Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 border-t border-[#2e3430]">
                {/* CGPA Slider */}
                <div className="p-3 rounded-xl bg-[#131514] border border-[#2e3430] space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#b8b2a4] font-medium">Academic CGPA</span>
                    <span className="font-mono font-bold text-[#de8535] bg-[#de8535]/15 px-1.5 py-0.5 rounded text-[11px]">
                      {cgpa.toFixed(1)} / 10.0
                    </span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="10.0"
                    step="0.1"
                    value={cgpa}
                    onChange={(e) => {
                      setCgpa(parseFloat(e.target.value));
                    }}
                    className="w-full accent-[#de8535] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[#7d776b]">
                    <span>6.0 Min</span>
                    <span>9.3 Full Merit</span>
                    <span>10.0</span>
                  </div>
                </div>

                {/* Family Income */}
                <div className="p-3 rounded-xl bg-[#131514] border border-[#2e3430] space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#b8b2a4] font-medium">Annual Income</span>
                    <span className="font-mono font-bold text-[#4b9b74] bg-[#4b9b74]/15 px-1.5 py-0.5 rounded text-[11px]">
                      ₹{incomeLakhs.toFixed(1)} L/yr
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.2"
                    value={incomeLakhs}
                    onChange={(e) => {
                      setIncomeLakhs(parseFloat(e.target.value));
                    }}
                    className="w-full accent-[#4b9b74] cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-[#7d776b]">
                    <span>₹1L (BPL)</span>
                    <span>₹4.5L (EWS)</span>
                    <span>₹15L+</span>
                  </div>
                </div>

                {/* Social Category */}
                <div className="p-3 rounded-xl bg-[#131514] border border-[#2e3430] space-y-1.5">
                  <span className="text-[#b8b2a4] font-medium text-xs block">Category</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1e2220] border border-[#2e3430] rounded-lg px-2.5 py-1 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535] cursor-pointer"
                  >
                    <option value="General">General / Open</option>
                    <option value="OBC">OBC (Non-Creamy Layer)</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                    <option value="EWS">EWS (Economically Weaker)</option>
                    <option value="Defence Ward">Defence Personnel Ward</option>
                    <option value="Sports">Sports / National Achiever</option>
                  </select>
                  <span className="text-[9px] font-mono text-[#7d776b] block">Mandatory Caste Certificate</span>
                </div>

                {/* Gender */}
                <div className="p-3 rounded-xl bg-[#131514] border border-[#2e3430] space-y-1.5">
                  <span className="text-[#b8b2a4] font-medium text-xs block">Gender Mandate</span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#1e2220] border border-[#2e3430] rounded-lg px-2.5 py-1 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535] cursor-pointer"
                  >
                    <option value="FEMALE">Female (Girl Student)</option>
                    <option value="MALE">Male</option>
                    <option value="ALL">Any / Co-Ed</option>
                  </select>
                  <span className="text-[9px] font-mono text-[#7d776b] block">Pragati / SGC Eligible</span>
                </div>

                {/* Department */}
                <div className="p-3 rounded-xl bg-[#131514] border border-[#2e3430] space-y-1.5">
                  <span className="text-[#b8b2a4] font-medium text-xs block">Department</span>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#1e2220] border border-[#2e3430] rounded-lg px-2.5 py-1 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535] cursor-pointer"
                  >
                    <option value="AIIT">AIIT (Information Tech)</option>
                    <option value="CSE">Computer Science & Engg</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Management">School of Business</option>
                    <option value="ALL">University-Wide (ALL)</option>
                  </select>
                  <span className="text-[9px] font-mono text-[#7d776b] block">Dean / HoI Endorsement</span>
                </div>
              </div>
            </div>

            {/* Results Display */}
            {matchResult && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Evaluated Profile Summary Card */}
                <div className="p-4 rounded-2xl bg-[#131514] border border-[#2e3430] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#de8535] to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[#f5f1e8]">
                        Evaluated Student Standing: {matchResult.student_profile?.cgpa} CGPA • {matchResult.student_profile?.category} Category
                      </h5>
                      <p className="text-[11px] text-[#7d776b]">
                        Income: {matchResult.student_profile?.family_income} • Gender: {matchResult.student_profile?.gender} • Institute: {department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-[#4b9b74]/15 border border-[#4b9b74]/30 text-xs font-bold text-[#4b9b74] font-mono">
                      {matchResult.total_eligible} Eligible Schemes
                    </span>
                    {matchResult.total_near_eligible > 0 && (
                      <span className="px-3 py-1 rounded-xl bg-[#de8535]/15 border border-[#de8535]/30 text-xs font-bold text-[#de8535] font-mono">
                        {matchResult.total_near_eligible} Next-Tier
                      </span>
                    )}
                  </div>
                </div>

                {/* Eligible Schemes Grid */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#b8b2a4] font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4b9b74]" />
                    Verified Eligible Scholarships ({matchResult.total_eligible})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchResult.eligible_scholarships?.map((s: any, idx: number) => (
                      <div
                        key={s.id || idx}
                        className="p-5 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] hover:border-[#4b9b74]/50 transition space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#2e3430]">
                            <div>
                              <span className="text-[10px] font-mono text-sky-400 font-bold block uppercase">
                                {s.category} • {s.sponsoring_agency}
                              </span>
                              <h5 className="text-xs font-bold text-[#f5f1e8] mt-0.5 leading-snug">
                                {s.name}
                              </h5>
                            </div>
                            <span className="p-1 rounded-lg bg-[#4b9b74]/15 text-[#4b9b74] shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          </div>

                          {/* Financial Award */}
                          <div className="mt-3 p-2.5 rounded-xl bg-[#131514] border border-[#2e3430]">
                            <span className="text-[10px] text-[#7d776b] font-mono uppercase block">Financial Concession / Grant:</span>
                            <span className="text-xs font-bold text-[#4b9b74] leading-tight block mt-0.5">
                              {s.financial_benefit}
                            </span>
                          </div>

                          {/* Eligibility Justification */}
                          <div className="mt-3 space-y-1">
                            <span className="text-[10px] font-mono uppercase text-[#7d776b] block">Eligibility Match:</span>
                            {s.match_reasons?.map((r: string, rIdx: number) => (
                              <div key={rIdx} className="flex items-start gap-1.5 text-xs text-[#b8b2a4]">
                                <span className="text-[#4b9b74] font-bold">✓</span>
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>

                          {/* Documents Checklist */}
                          {s.documents_required?.length > 0 && (
                            <div className="mt-3 space-y-1 pt-2 border-t border-[#2e3430]">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono uppercase text-[#de8535] font-semibold">
                                  Mandatory Documents Checklist:
                                </span>
                                <button
                                  onClick={() => handleCopyDocs(s.documents_required, s.id)}
                                  className="text-[10px] text-[#7d776b] hover:text-[#f5f1e8] flex items-center gap-1 font-mono transition cursor-pointer"
                                  title="Copy document checklist to clipboard"
                                >
                                  {copiedDoc === s.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-[#4b9b74]" />
                                      <span className="text-[#4b9b74]">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <ul className="space-y-1 text-[11px] text-[#b8b2a4]">
                                {s.documents_required.map((doc: string, dIdx: number) => (
                                  <li key={dIdx} className="flex items-start gap-1.5">
                                    <span className="text-[#7d776b]">•</span>
                                    <span>{doc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Footer Status */}
                        <div className="pt-3 border-t border-[#2e3430] flex items-center justify-between text-[10px] font-mono text-[#7d776b]">
                          <span>Endorsement: Student Welfare Office</span>
                          <span className="text-[#4b9b74] font-semibold">Ready for Application</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Near-Eligible Next Tier Opportunities */}
                {matchResult.near_eligible_scholarships?.length > 0 && (
                  <div className="p-5 rounded-2xl bg-[#1d1917] border border-[#de8535]/40 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#de8535]" />
                      <h4 className="text-xs font-bold text-[#f5f1e8]">
                        Next-Tier / Near-Eligible Higher Scholarships
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#b8b2a4]">
                      The student is close to meeting criteria for higher fee waivers. Review the shortfalls below:
                    </p>

                    <div className="space-y-2">
                      {matchResult.near_eligible_scholarships.map((near: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#131514] border border-[#2e3430] flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold text-[#f5f1e8] block">
                              {near.name} ({near.financial_benefit})
                            </span>
                            <div className="text-[11px] text-[#de8535] mt-0.5 space-y-0.5">
                              {near.reasons?.map((r: string, rIdx: number) => (
                                <span key={rIdx} className="block">• {r}</span>
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#de8535]/15 text-[#de8535] border border-[#de8535]/30">
                            Higher Concession
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIEW MODE 2: FULL POLICY CATALOG */}
        {viewMode === "catalog" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#f5f1e8]">
                  Verified Institutional & Statutory Scholarship Policies ({allScholarships.length})
                </h4>
                <p className="text-[11px] text-[#7d776b]">
                  Persistently indexed in SQLite and available for sovereign RAG queries without cloud egress.
                </p>
              </div>

              <button
                onClick={fetchScholarships}
                className="p-1.5 rounded-lg bg-[#222624] text-[#b8b2a4] hover:text-[#f5f1e8] border border-[#2e3430] transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allScholarships.map((sch, idx) => (
                <div key={sch.id || idx} className="p-5 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#de8535] font-bold block uppercase">
                        {sch.category} • {sch.sponsoring_agency}
                      </span>
                      <h5 className="text-xs font-bold text-[#f5f1e8] mt-0.5">
                        {sch.name}
                      </h5>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2e3430] text-[#b8b2a4]">
                      Min CGPA: {sch.min_cgpa || "6.0"}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#b8b2a4] leading-relaxed">
                    {sch.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#131514] border border-[#2e3430]">
                    <span className="text-[10px] text-[#7d776b] font-mono uppercase block">Award:</span>
                    <span className="text-xs font-bold text-[#4b9b74]">
                      {sch.financial_benefit}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-[#7d776b] flex justify-between pt-1 border-t border-[#2e3430]">
                    <span>Income Ceiling: ₹{sch.max_income_lakhs}L</span>
                    <span>Gender: {sch.target_gender}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
