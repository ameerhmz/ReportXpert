"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  MessageSquare, 
  Code2, 
  Database, 
  FileSearch 
} from "lucide-react";
import { AirGapModal } from "./AirGapModal";

interface HeaderProps {
  telemetry: any;
  activeTab: "blueprint" | "sandbox" | "rag" | "chat" | "profiles";
  onTabChange: (tab: "blueprint" | "sandbox" | "rag" | "chat" | "profiles") => void;
  onNewChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  telemetry, 
  activeTab, 
  onTabChange, 
  onNewChat 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-slate-800 bg-[#090D18] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Organization / App Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-sky-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-white hidden lg:inline">
              ReportXpert
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Air-Gapped (0.00 KB Egress)
            </span>
          </div>
        </div>

        {/* Center: The Core Features (Never Hidden) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner">
          <button
            onClick={() => onTabChange("blueprint")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "blueprint"
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
            title="Scenario 1: Scanned Document Audit to Word .docx"
          >
            <FileSearch className="w-3.5 h-3.5 text-sky-400" />
            <span>Document Digitization</span>
          </button>

          <button
            onClick={() => onTabChange("sandbox")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "sandbox"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
            title="Scenario 2: Sandboxed Python Code Execution & Math to Excel .xlsx"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>External Dossier Generator</span>
          </button>

          <button
            onClick={() => onTabChange("rag")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "rag"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
            title="Internal SOP Search (BGE-M3 Vector RAG)"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Compliance Knowledge Vault</span>
          </button>

          <button
            onClick={() => onTabChange("chat")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "chat"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
            title="Unified Conversational Assistant"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>Smart Approvals & Workflow</span>
          </button>

          <button
            onClick={() => onTabChange("profiles")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "profiles"
                ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
            title="Faculty & Student Profiles (Vector Ingestion)"
          >
            <Database className="w-3.5 h-3.5 text-orange-400" />
            <span>Academic Profiles</span>
          </button>
        </div>

        {/* Right: Actions & Live Air-gap Proof */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-slate-300 transition cursor-pointer"
            title="Inspect Live Air-Gap Network Telemetry"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-emerald-400/90 font-medium hidden md:inline">Socket Audit</span>
          </button>
        </div>
      </header>

      {/* Air Gap Details Modal */}
      <AirGapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        telemetry={telemetry}
      />
    </>
  );
};
