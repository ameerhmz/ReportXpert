"use client";

import React, { useState, useEffect } from "react";
import { X, Database, ShieldCheck, Users, GraduationCap, Calendar, UploadCloud, BookOpen, Award, FileSpreadsheet, Sparkles } from "lucide-react";
import { VectorSearchRAGView } from "./tabs/VectorSearchRAGView";
import { FacultyProfilesTab } from "./tabs/FacultyProfilesTab";
import { StudentProfilesTab } from "./tabs/StudentProfilesTab";
import { CampusEventsTab } from "./tabs/CampusEventsTab";
import { UniversalAutoIngestionTab } from "./tabs/UniversalAutoIngestionTab";
import { ScopusResearchTab } from "./tabs/ScopusResearchTab";
import { ScholarshipFinderTab } from "./tabs/ScholarshipFinderTab";

interface KnowledgeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchAudit?: (framework: string) => void;
  initialTab?: "standards" | "research" | "scholarships" | "faculty" | "students" | "events" | "bulk";
}

const TAB_METADATA: Record<string, { title: string; subtitle: string; icon: any; color: string }> = {
  research: {
    title: "Research & Scopus Repository",
    subtitle: "30-Column Research Data Compilation, Scopus Citation Parser & Redundancy Removal",
    icon: Sparkles,
    color: "text-[#de8535] bg-[#de8535]/15 border-[#de8535]/30",
  },
  scholarships: {
    title: "Student Scholarship Matcher",
    subtitle: "Eligibility Calculator & Scheme Matcher across 10 Verified State & Central Policies",
    icon: GraduationCap,
    color: "text-[#4b9b74] bg-[#4b9b74]/15 border-[#4b9b74]/30",
  },
  standards: {
    title: "Statutory Standards & SOPs",
    subtitle: "NAAC, NIRF, UGC, NBA Regulatory Criteria & Semantic Vector RAG",
    icon: BookOpen,
    color: "text-[#de8535] bg-[#de8535]/15 border-[#de8535]/30",
  },
  faculty: {
    title: "Faculty Profiles & Research Output",
    subtitle: "Faculty Directory, Scopus Citations, H-Index & Extramural Research Grants",
    icon: Users,
    color: "text-[#3d6a8a] bg-[#3d6a8a]/15 border-[#3d6a8a]/30",
  },
  students: {
    title: "Student Research & Achievements",
    subtitle: "108 Student Profiles, Honors, Hackathon Winners & Institutional Merit Leaderboard",
    icon: GraduationCap,
    color: "text-[#4b9b74] bg-[#4b9b74]/15 border-[#4b9b74]/30",
  },
  events: {
    title: "Campus Events & Extension Activities",
    subtitle: "26 Conferences, FDPs, Workshops & Sponsored Extension Initiatives",
    icon: Calendar,
    color: "text-[#de8535] bg-[#de8535]/15 border-[#de8535]/30",
  },
  bulk: {
    title: "Universal Auto-Ingestion & Smart AI Classifier",
    subtitle: "Upload ANY Document (PDF, DOCX, XLSX, CSV, TXT) — Autonomously Classified & Embedded",
    icon: UploadCloud,
    color: "text-[#de8535] bg-[#de8535]/15 border-[#de8535]/30",
  },
};

export const KnowledgeVaultModal: React.FC<KnowledgeVaultModalProps> = ({ isOpen, onClose, onLaunchAudit, initialTab = "research" }) => {
  const [activeTab, setActiveTab] = useState<"standards" | "research" | "scholarships" | "faculty" | "students" | "events" | "bulk">(initialTab);

  // Synchronize active tab whenever opened with a specific initialTab prop
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const currentMeta = TAB_METADATA[activeTab] || TAB_METADATA.research;
  const ActiveIcon = currentMeta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-6xl h-[90vh] bg-[#161817] border border-[#2e3430] rounded-3xl shadow-2xl flex flex-col overflow-hidden tactile-chamfer relative">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#2e3430] bg-[#1a1d1b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${currentMeta.color}`}>
              <ActiveIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#7d776b]">
                  KNOWLEDGE VAULT //
                </span>
                <h2 className="text-sm font-bold text-[#f5f1e8] font-sans">
                  {currentMeta.title}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4b9b74]/15 text-[#4b9b74] border border-[#4b9b74]/30 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  0.00 KB Cloud Egress
                </span>
              </div>
              <p className="text-[11px] text-[#b8b2a4]">
                {currentMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Direct Auto-Upload Quick Trigger Button */}
            {activeTab !== "bulk" && (
              <button
                onClick={() => setActiveTab("bulk")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#de8535]/15 hover:bg-[#de8535]/25 border border-[#de8535]/40 text-[#de8535] text-xs font-semibold transition cursor-pointer shadow-sm whitespace-nowrap"
                title="Upload any document (PDF, Word, Excel) and automatically classify & embed"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>+ Auto-Upload Document</span>
              </button>
            )}

            {/* Tabs Bar */}
            <div className="flex bg-[#131514] p-1 rounded-xl border border-[#2e3430] gap-1 overflow-x-auto max-w-[580px] lg:max-w-[660px]">
              <button
                onClick={() => setActiveTab("research")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "research" ? "bg-[#de8535] text-white shadow-sm" : "text-[#7d776b] hover:text-[#b8b2a4]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                Research & Scopus (30 Cols)
              </button>
              <button
                onClick={() => setActiveTab("scholarships")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "scholarships" ? "bg-[#4b9b74] text-white shadow-sm" : "text-[#7d776b] hover:text-[#b8b2a4]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-200" />
                Scholarships (XYZ Matching)
              </button>
              <button
                onClick={() => setActiveTab("standards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "standards" ? "bg-[#3d6a8a] text-white shadow-sm" : "text-[#7d776b] hover:text-[#b8b2a4]"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-200" />
                Standards & SOPs
              </button>
              <button
                onClick={() => setActiveTab("faculty")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "faculty" ? "bg-[#7a52aa] text-white shadow-sm" : "text-[#7d776b] hover:text-[#b8b2a4]"
                }`}
              >
                <Users className="w-3.5 h-3.5 text-purple-200" />
                Faculty (28)
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "students" ? "bg-[#2a7a58] text-white shadow-sm" : "text-[#7d776b] hover:text-[#b8b2a4]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-200" />
                Students (108)
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "events" ? "bg-[#c9523c] text-white shadow-sm" : "text-[#7d776b] hover:text-[#b8b2a4]"
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-rose-200" />
                Events (26)
              </button>
              <button
                onClick={() => setActiveTab("bulk")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "bulk" ? "bg-[#de8535] text-white shadow-sm ring-1 ring-[#de8535]/50" : "text-[#de8535] hover:text-white bg-[#de8535]/10 hover:bg-[#de8535]/20 font-bold"
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                ✨ Smart Auto-Ingest
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#7d776b] hover:text-[#f5f1e8] hover:bg-[#222624] rounded-xl transition cursor-pointer"
              title="Close Knowledge Vault"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Knowledge Base */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#131514] bg-drafting-grid">
          {activeTab === "research" && <ScopusResearchTab />}
          {activeTab === "scholarships" && <ScholarshipFinderTab />}
          {activeTab === "standards" && <VectorSearchRAGView />}
          {activeTab === "faculty" && <FacultyProfilesTab />}
          {activeTab === "students" && <StudentProfilesTab />}
          {activeTab === "events" && <CampusEventsTab />}
          {activeTab === "bulk" && <UniversalAutoIngestionTab onSwitchTab={(tab) => setActiveTab(tab)} />}
        </div>
      </div>
    </div>
  );
};
