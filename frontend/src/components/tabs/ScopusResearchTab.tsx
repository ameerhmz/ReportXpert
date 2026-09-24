"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Sparkles, 
  Download, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  Search, 
  Upload, 
  Table, 
  Check, 
  ExternalLink,
  BookOpen,
  Filter
} from "lucide-react";

export const ScopusResearchTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"parser" | "repository" | "blank_template">("parser");
  
  // Scopus Parser State
  const [rawCitation, setRawCitation] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedPaper, setParsedPaper] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Repository & Deduplication State
  const [papers, setPapers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    total_papers: 0,
    total_citations: 0,
    q1_papers: 0,
    q2_papers: 0,
    scopus_indexed: 0,
    participating_faculty_count: 0
  });
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("ALL");
  const [dedupResult, setDedupResult] = useState<any | null>(null);
  const [isDeduplicating, setIsDeduplicating] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  // Blank Template State
  const [blankFile, setBlankFile] = useState<File | null>(null);
  const [uploadingBlank, setUploadingBlank] = useState(false);
  const [blankResult, setBlankResult] = useState<any | null>(null);

  const SAMPLE_CITATION = `MSFHNet: Mobile Siamese Forward Harmonic Net for Histological Structure-Based Breast Cancer Classification Using Histopathological Images\nSingh, Namrata,Srivastava, Meenakshi, Srivastava, Geetika Biomedical Materials and DevicesOpen source preview, 2026, 4(3), pp. 3302–3321`;

  // Fetch Papers from Backend
  const fetchPapers = async () => {
    setLoadingPapers(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/papers");
      const data = await res.json();
      if (data && data.papers) {
        setPapers(data.papers);
        setMetrics(data.metrics || {});
      }
    } catch (e) {
      console.error("Error loading research papers:", e);
    } finally {
      setLoadingPapers(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  // Parse Raw Scopus Line
  const handleParseCitation = async () => {
    if (!rawCitation.trim()) return;
    setParsing(true);
    setSaveStatus(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/parse-scopus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: rawCitation })
      });
      const data = await res.json();
      if (data.status === "success") {
        setParsedPaper(data.parsed_paper);
      }
    } catch (e) {
      console.error("Scopus parse error:", e);
    } finally {
      setParsing(false);
    }
  };

  // Save Parsed Paper into Database & Sync RAG
  const handleSaveParsedPaper = async () => {
    if (!parsedPaper) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/add-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paper: parsedPaper })
      });
      const data = await res.json();
      if (data.status === "success") {
        setSaveStatus("saved");
        fetchPapers();
      } else {
        setSaveStatus("error");
      }
    } catch (e) {
      console.error("Error saving paper:", e);
      setSaveStatus("error");
    }
  };

  // Run Deduplication
  const handleRunDeduplication = async () => {
    setIsDeduplicating(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/deduplicate", {
        method: "POST"
      });
      const data = await res.json();
      setDedupResult(data);
    } catch (e) {
      console.error("Deduplication error:", e);
    } finally {
      setIsDeduplicating(false);
    }
  };

  // Compile Excel (Sample research.xlsx)
  const handleCompileExcel = async () => {
    setIsCompiling(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/research/compile-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.download_url) {
        window.open(`http://127.0.0.1:8000${data.download_url}`, "_blank");
      }
    } catch (e) {
      console.error("Compile Excel error:", e);
    } finally {
      setIsCompiling(false);
    }
  };

  // Handle Blank Template Upload
  const handleUploadBlankTemplate = async () => {
    if (!blankFile) return;
    setUploadingBlank(true);
    setBlankResult(null);
    try {
      const formData = new FormData();
      formData.append("file", blankFile);
      const res = await fetch("http://127.0.0.1:8000/api/research/fill-blank-template", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setBlankResult(data);
      if (data.download_url) {
        window.open(`http://127.0.0.1:8000${data.download_url}`, "_blank");
      }
    } catch (e) {
      console.error("Upload blank template error:", e);
    } finally {
      setUploadingBlank(false);
    }
  };

  // Filtered papers
  const filteredPapers = papers.filter((p) => {
    const matchesSearch = 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authors?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.journal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.faculty_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFaculty = facultyFilter === "ALL" || p.faculty_name === facultyFilter;
    return matchesSearch && matchesFaculty;
  });

  const uniqueFaculties = Array.from(new Set(papers.map((p) => p.faculty_name).filter(Boolean)));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#161817] text-[#ece8e1] overflow-hidden">
      {/* Top Banner / Metrics Overview */}
      <div className="px-6 py-4 border-b border-[#2e3430] bg-[#1a1d1b] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#f5f1e8] font-sans">
              Faculty Research Compilation & Scopus Auto-Parser
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#de8535]/15 text-[#de8535] border border-[#de8535]/30 font-semibold">
              Sample research.xlsx Grounded (30 Cols)
            </span>
          </div>
          <p className="text-[11px] text-[#b8b2a4] mt-0.5">
            Auto-parse raw Scopus citation strings into 30 statutory reporting columns, deduplicate submissions, and generate dynamic reports.
          </p>
        </div>

        {/* Aggregate KPI Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[#131514] border border-[#2e3430] text-center">
            <span className="text-[10px] uppercase font-mono text-[#7d776b] block">Total Papers</span>
            <span className="text-xs font-bold text-[#f5f1e8]">{metrics.total_papers || papers.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#131514] border border-[#2e3430] text-center">
            <span className="text-[10px] uppercase font-mono text-[#7d776b] block">Q1 Journals</span>
            <span className="text-xs font-bold text-[#4b9b74]">{metrics.q1_papers || 0}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#131514] border border-[#2e3430] text-center">
            <span className="text-[10px] uppercase font-mono text-[#7d776b] block">Citations</span>
            <span className="text-xs font-bold text-[#de8535]">{metrics.total_citations || 0}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#131514] border border-[#2e3430] text-center">
            <span className="text-[10px] uppercase font-mono text-[#7d776b] block">Faculty</span>
            <span className="text-xs font-bold text-[#3d6a8a]">{metrics.participating_faculty_count || uniqueFaculties.length}</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="px-6 py-2 border-b border-[#2e3430] bg-[#141615] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("parser")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === "parser"
                ? "bg-[#2e3430] text-[#f5f1e8] shadow-sm"
                : "text-[#7d776b] hover:text-[#b8b2a4]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#de8535]" />
            Scopus Raw Line Parser
          </button>

          <button
            onClick={() => setActiveSubTab("repository")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === "repository"
                ? "bg-[#2e3430] text-[#f5f1e8] shadow-sm"
                : "text-[#7d776b] hover:text-[#b8b2a4]"
            }`}
          >
            <Table className="w-3.5 h-3.5 text-[#4b9b74]" />
            Compiled Repository & Deduplication ({papers.length})
          </button>

          <button
            onClick={() => setActiveSubTab("blank_template")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeSubTab === "blank_template"
                ? "bg-[#2e3430] text-[#f5f1e8] shadow-sm"
                : "text-[#7d776b] hover:text-[#b8b2a4]"
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#3d6a8a]" />
            Upload Blank Format & Generate Dynamic Report
          </button>
        </div>

        {/* Global Action: Compile Official Excel */}
        <button
          onClick={handleCompileExcel}
          disabled={isCompiling}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-semibold transition cursor-pointer shadow-md disabled:opacity-50"
          title="Download Sample research.xlsx with all 30 columns compiled"
        >
          {isCompiling ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span>Download Sample research.xlsx</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SUBTAB 1: SCOPUS PARSER */}
        {activeSubTab === "parser" && (
          <div className="space-y-6">
            {/* Input Card */}
            <div className="p-5 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#de8535]/15 text-[#de8535]">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#f5f1e8] font-sans">
                      Paste Raw Scopus Citation String
                    </h4>
                    <p className="text-[11px] text-[#7d776b]">
                      Faculty pastes raw text from Scopus citation preview, and our deterministic regex engine automatically extracts and assigns entries to all 30 columns.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRawCitation(SAMPLE_CITATION)}
                  className="px-2.5 py-1 text-[11px] font-mono text-[#de8535] hover:text-[#f5f1e8] bg-[#222624] hover:bg-[#2e3430] rounded-lg border border-[#2e3430] transition cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3 h-3" />
                  Fill Sample (Dr. Meenakshi Srivastava Ma&apos;am)
                </button>
              </div>

              <textarea
                value={rawCitation}
                onChange={(e) => setRawCitation(e.target.value)}
                placeholder="Paste Scopus line here, e.g.:&#10;MSFHNet: Mobile Siamese Forward Harmonic Net for Histological Structure-Based Breast Cancer Classification Using Histopathological Images&#10;Singh, Namrata,Srivastava, Meenakshi, Srivastava, Geetika Biomedical Materials and DevicesOpen source preview, 2026, 4(3), pp. 3302–3321"
                rows={4}
                className="w-full bg-[#131514] border border-[#2e3430] rounded-xl p-3 text-xs font-mono text-[#f5f1e8] placeholder-[#555a56] focus:outline-none focus:border-[#de8535] transition leading-relaxed resize-y"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-[#7d776b] font-mono">
                  {rawCitation.length > 0 ? `${rawCitation.length} characters • Ready to parse` : "Awaiting input"}
                </span>

                <button
                  onClick={handleParseCitation}
                  disabled={parsing || !rawCitation.trim()}
                  className="px-4 py-2 rounded-xl bg-[#de8535] hover:bg-[#c97428] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {parsing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Parse into 30 Columns</span>
                </button>
              </div>
            </div>

            {/* Parsed Result Preview */}
            {parsedPaper && (
              <div className="p-5 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#2e3430]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4b9b74]" />
                    <h4 className="text-xs font-bold text-[#f5f1e8]">
                      Successfully Parsed & Mapped (30 Institutional Columns)
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {saveStatus === "saved" ? (
                      <span className="text-xs text-[#4b9b74] font-semibold flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#4b9b74]/15 border border-[#4b9b74]/30">
                        <Check className="w-3.5 h-3.5" />
                        Persistently Ingested to Database
                      </span>
                    ) : (
                      <button
                        onClick={handleSaveParsedPaper}
                        disabled={saveStatus === "saving"}
                        className="px-3.5 py-1.5 rounded-lg bg-[#4b9b74] hover:bg-[#3d8361] text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {saveStatus === "saving" ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                        <span>Save to Research Database</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 30 Columns Detailed Table Preview */}
                <div className="rounded-xl border border-[#2e3430] overflow-hidden bg-[#131514]">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1e2220] text-[#7d776b] font-mono text-[10px] uppercase sticky top-0 border-b border-[#2e3430]">
                        <tr>
                          <th className="py-2.5 px-3 w-16">Col #</th>
                          <th className="py-2.5 px-3 w-48">Institutional Header</th>
                          <th className="py-2.5 px-3">Extracted & Assigned Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242826] font-sans">
                        {[
                          { col: 1, name: "Sl. No.", val: parsedPaper.sl_no || 1 },
                          { col: 2, name: "Name of University/ Campus", val: parsedPaper.campus },
                          { col: 3, name: "Name of Department/ Institute", val: parsedPaper.department },
                          { col: 4, name: "Name of Faculty/Scientist", val: parsedPaper.faculty_name },
                          { col: 5, name: "Emp. ID", val: parsedPaper.emp_id },
                          { col: 6, name: "Name of the Author/s", val: parsedPaper.authors },
                          { col: 7, name: "First/ Corresponding / Co-author", val: parsedPaper.author_role },
                          { col: 8, name: "Title of paper", val: parsedPaper.title, bold: true },
                          { col: 9, name: "Name of the Journal", val: parsedPaper.journal, italic: true },
                          { col: 10, name: "Impact Factor", val: parsedPaper.impact_factor },
                          { col: 11, name: "Date of Publication", val: parsedPaper.pub_date },
                          { col: 12, name: "Year of Publication", val: parsedPaper.pub_year },
                          { col: 13, name: "Research Paper/Article", val: parsedPaper.paper_type },
                          { col: 14, name: "National/ International", val: parsedPaper.national_international },
                          { col: 15, name: "Listed in PubMed/ ICI/ UGC", val: parsedPaper.pubmed_ici_ugc },
                          { col: 16, name: "Listed in Web of Science", val: parsedPaper.wos },
                          { col: 17, name: "Peer Reviewed", val: parsedPaper.peer_reviewed },
                          { col: 18, name: "Volume/ Edition", val: parsedPaper.volume_edition },
                          { col: 19, name: "Page (From-To)", val: parsedPaper.page_from_to },
                          { col: 20, name: "Listed in Scopus", val: parsedPaper.scopus },
                          { col: 21, name: "Journal quartile (Q1,Q2,Q3,Q4)", val: parsedPaper.quartile, badge: true },
                          { col: 22, name: "ISSN/ ISBN", val: parsedPaper.issn_isbn },
                          { col: 23, name: "Name of Publisher", val: parsedPaper.publisher },
                          { col: 24, name: "Institutional affiliation", val: parsedPaper.affiliation },
                          { col: 25, name: "Corresponding Author", val: parsedPaper.corresponding_author },
                          { col: 26, name: "Number of citations", val: parsedPaper.citations },
                          { col: 27, name: "Link of recognition in UGC", val: parsedPaper.ugc_link },
                          { col: 28, name: "Evidence (Upload / Link)", val: parsedPaper.evidence_link },
                          { col: 29, name: "If any other information", val: parsedPaper.other_info },
                          { col: 30, name: "Ref.", val: parsedPaper.ref_no }
                        ].map((item) => (
                          <tr key={item.col} className="hover:bg-[#1a1d1b] transition">
                            <td className="py-2 px-3 font-mono text-[10px] text-[#7d776b]">{item.col}</td>
                            <td className="py-2 px-3 font-mono text-[11px] text-[#b8b2a4]">{item.name}</td>
                            <td className="py-2 px-3">
                              {item.badge ? (
                                <span className="px-2 py-0.5 rounded bg-[#4b9b74]/15 text-[#4b9b74] font-mono font-bold text-[10px] border border-[#4b9b74]/30">
                                  {item.val}
                                </span>
                              ) : (
                                <span className={`text-xs text-[#f5f1e8] ${item.bold ? "font-bold text-[#de8535]" : ""} ${item.italic ? "italic text-sky-400" : ""}`}>
                                  {String(item.val || "—")}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: REPOSITORY & DEDUPLICATION */}
        {activeSubTab === "repository" && (
          <div className="space-y-6">
            {/* Filter and Action Bar */}
            <div className="p-4 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#7d776b] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, author, journal, or faculty..."
                    className="w-full bg-[#131514] border border-[#2e3430] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#f5f1e8] placeholder-[#555a56] focus:outline-none focus:border-[#de8535]"
                  />
                </div>

                <select
                  value={facultyFilter}
                  onChange={(e) => setFacultyFilter(e.target.value)}
                  className="bg-[#131514] border border-[#2e3430] rounded-xl px-3 py-1.5 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535] cursor-pointer"
                >
                  <option value="ALL">All Faculties</option>
                  {uniqueFaculties.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Deduplication Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunDeduplication}
                  disabled={isDeduplicating}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#c9523c]/20 hover:bg-[#c9523c]/30 text-[#e8705a] border border-[#c9523c]/40 text-xs font-semibold transition cursor-pointer shadow-sm disabled:opacity-50"
                  title="Remove duplicate faculty submissions using fuzzy similarity"
                >
                  {isDeduplicating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Layers className="w-3.5 h-3.5" />
                  )}
                  <span>Remove Redundant Data (Deduplicate)</span>
                </button>

                <button
                  onClick={fetchPapers}
                  className="p-1.5 rounded-lg bg-[#222624] text-[#b8b2a4] hover:text-[#f5f1e8] border border-[#2e3430] transition cursor-pointer"
                  title="Refresh repository"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Deduplication Report Banner */}
            {dedupResult && (
              <div className="p-4 rounded-2xl bg-[#1d1917] border border-[#c9523c]/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4b9b74]" />
                    <h5 className="text-xs font-bold text-[#f5f1e8]">
                      {dedupResult.summary}
                    </h5>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#c9523c]/20 text-[#e8705a] font-bold">
                    {dedupResult.duplicates_removed_count} Redundant Records Cleared
                  </span>
                </div>

                {dedupResult.duplicates_found?.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#2e3430]">
                    <span className="text-[10px] uppercase font-mono text-[#7d776b]">Resolved Duplicate Pairs:</span>
                    {dedupResult.duplicates_found.slice(0, 4).map((dup: any, i: number) => (
                      <div key={i} className="text-[11px] p-2 rounded-lg bg-[#141615] flex items-center justify-between border border-[#2a2f2c]">
                        <div className="truncate max-w-lg">
                          <span className="text-[#de8535] font-semibold">{dup.primary_title}</span>
                          <span className="text-[#7d776b] text-[10px] block">Faculty: {dup.faculty_a}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#4b9b74] px-1.5 py-0.5 rounded bg-[#4b9b74]/15">
                          {dup.similarity_score}% match
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Papers List Table */}
            <div className="rounded-2xl border border-[#2e3430] bg-[#1a1d1b] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141615] text-[#7d776b] font-mono text-[10px] uppercase border-b border-[#2e3430]">
                    <tr>
                      <th className="py-3 px-3 w-12 text-center">#</th>
                      <th className="py-3 px-4">Title of Paper</th>
                      <th className="py-3 px-4">Faculty / Authors</th>
                      <th className="py-3 px-3">Journal</th>
                      <th className="py-3 px-3 text-center">Quartile</th>
                      <th className="py-3 px-3 text-center">Year</th>
                      <th className="py-3 px-3 text-center">Citations</th>
                      <th className="py-3 px-3 text-center">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242826]">
                    {loadingPapers ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-xs text-[#7d776b]">
                          <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#de8535]" />
                          Loading compiled research papers...
                        </td>
                      </tr>
                    ) : filteredPapers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-xs text-[#7d776b]">
                          No research papers match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredPapers.map((p, idx) => (
                        <tr key={p.id || idx} className="hover:bg-[#1e2220] transition">
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#7d776b]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-4 font-medium text-[#f5f1e8] max-w-md">
                            <span className="block leading-tight">{p.title}</span>
                            <span className="text-[10px] text-[#7d776b] font-mono mt-0.5 block">
                              Ref: {p.ref_no || `AUUP-P${idx+1}`} • Vol: {p.volume_edition} • pp. {p.page_from_to}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="text-xs font-semibold text-[#de8535] block">
                              {p.faculty_name} ({p.emp_id})
                            </span>
                            <span className="text-[10px] text-[#b8b2a4] truncate block max-w-xs">
                              {p.authors}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-xs italic text-sky-400">
                            {p.journal}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${
                              p.quartile === "Q1" 
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : "bg-sky-500/15 text-sky-400 border-sky-500/30"
                            }`}>
                              {p.quartile || "Q1"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-[11px] text-[#b8b2a4]">
                            {p.pub_year}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold text-xs text-[#de8535]">
                            {p.citations || 0}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {p.evidence_link ? (
                              <a
                                href={p.evidence_link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-mono hover:underline"
                              >
                                DOI <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ) : (
                              <span className="text-[10px] text-[#555a56] font-mono">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: BLANK TEMPLATE UPLOAD & DYNAMIC REPORT */}
        {activeSubTab === "blank_template" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#3d6a8a]/20 text-sky-400 border border-[#3d6a8a]/40">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#f5f1e8]">
                    Upload Blank Format & Generate Dynamic Report
                  </h4>
                  <p className="text-[11px] text-[#b8b2a4] mt-0.5">
                    Upload any blank institutional Excel spreadsheet (`.xlsx`). Our dynamic mapper inspects the header row, matches column fields against SQLite records, and populates the report directly.
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-[#2e3430] hover:border-[#de8535]/60 rounded-2xl p-8 text-center transition bg-[#131514] space-y-3">
                <input
                  type="file"
                  id="blank-file-input"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setBlankFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <label
                  htmlFor="blank-file-input"
                  className="inline-flex flex-col items-center justify-center cursor-pointer space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#222624] flex items-center justify-center text-[#de8535] shadow-inner">
                    <Table className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-[#f5f1e8]">
                    {blankFile ? blankFile.name : "Click to select blank format (.xlsx) or drag & drop"}
                  </span>
                  <span className="text-[10px] text-[#7d776b] font-mono">
                    Supports Sample research blank sheets, NAAC Criteria 3, NIRF RPC, or custom institution formats
                  </span>
                </label>

                {blankFile && (
                  <div className="pt-3">
                    <button
                      onClick={handleUploadBlankTemplate}
                      disabled={uploadingBlank}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-md flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {uploadingBlank ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      <span>Dynamically Populate Report from Database</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Result */}
              {blankResult && (
                <div className="p-4 rounded-xl bg-[#131514] border border-[#4b9b74]/40 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4b9b74]" />
                      <h5 className="text-xs font-bold text-[#f5f1e8]">
                        {blankResult.message}
                      </h5>
                    </div>
                    {blankResult.download_url && (
                      <a
                        href={`http://127.0.0.1:8000${blankResult.download_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#4b9b74] hover:bg-[#3d8361] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3 h-3" />
                        Download Generated Workbook
                      </a>
                    )}
                  </div>
                  <div className="text-[11px] text-[#b8b2a4] flex flex-wrap gap-2 pt-1 font-mono">
                    <span className="text-[#7d776b]">Mapped Columns:</span>
                    {blankResult.columns_mapped?.map((c: string) => (
                      <span key={c} className="px-1.5 py-0.5 rounded bg-[#1e2220] border border-[#2e3430] text-[10px] text-sky-400">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
