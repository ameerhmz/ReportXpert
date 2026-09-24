"use client";

import React, { useState } from "react";
import { 
  Plus, 
  MessageSquare, 
  PanelLeftClose, 
  PanelLeft, 
  ShieldCheck, 
  Trash2,
  Cpu,
  Activity,
  ChevronDown,
  Database,
  Award,
  Sparkles,
  GraduationCap,
  UploadCloud
} from "lucide-react";
import { ChatSession } from "../types/workbench";
import { SovereignInsignia } from "./SovereignInsignia";

interface ClaudeSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onClearAllSessions?: () => void;
  onOpenKnowledgeVault?: () => void;
  onOpenFrameworks?: () => void;
  onOpenResearch?: () => void;
  onOpenScholarships?: () => void;
  onOpenAutoIngest?: () => void;
}

export const ClaudeSidebar: React.FC<ClaudeSidebarProps> = ({
  isOpen,
  onToggle,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  onOpenKnowledgeVault,
  onOpenFrameworks,
  onOpenResearch,
  onOpenScholarships,
  onOpenAutoIngest,
}) => {
  if (!isOpen) {
    return (
      <div className="p-2.5 border-r border-[#2a2f2c] bg-[#161817] flex flex-col items-center select-none z-10">
        <button
          onClick={onToggle}
          className="p-2 text-[#b8b2a4] hover:text-[#f5f1e8] rounded-xl hover:bg-[#222624] transition cursor-pointer"
          title="Expand console rail"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-64 border-r border-[#242826] bg-[#161817] flex flex-col justify-between shrink-0 select-none z-20 font-sans h-full overflow-hidden">
      {/* 1. Upper Controls */}
      <div className="p-3 flex-1 flex flex-col min-h-0 space-y-3 overflow-hidden">
        {/* Top Header: Brand & Close rail button */}
        <div className="flex items-center justify-between pb-2 border-b border-[#242826]">
          <div className="flex items-center gap-2">
            <SovereignInsignia size={20} glow={true} />
            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-bold tracking-wider text-[#f5f1e8] leading-tight">
                REPORTXPERT SOVEREIGN
              </span>
              <span className="text-[9px] font-mono text-[#de8535] leading-tight">
                AIR-GAPPED AI NODE
              </span>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 text-[#7d776b] hover:text-[#f5f1e8] rounded-lg hover:bg-[#222624] transition cursor-pointer"
            title="Collapse sidebar rail"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Autonomous Routing Badge */}
        <div className="p-2.5 rounded-xl bg-[#1a1d1b] border border-[#2a2f2c] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#7d776b]">Offline Routing</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-[#4b9b74] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4b9b74] animate-pulse"></span>
              AUTOMATIC
            </span>
          </div>
          <div className="text-[11px] font-medium text-[#f5f1e8] flex items-center gap-1.5">
            <span className="text-[#de8535] font-semibold text-[10px]">Supervisor Agent</span>
            <span className="text-[10px] text-[#b8b2a4]">• Auto-Detect</span>
          </div>
          <p className="text-[10px] text-[#7d776b] leading-tight font-sans">
            Grounded dynamically in user-created on-premise Knowledge Library.
          </p>
        </div>

        {/* Start New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[#222624] hover:bg-[#282d2a] text-[#f5f1e8] border border-[#333935] hover:border-[#de8535]/60 text-xs font-medium transition cursor-pointer shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-[#de8535]" />
            <span className="tracking-wide">New Chat</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161817] text-[#7d776b] font-mono border border-[#2a2f2c]">⌘K</span>
        </button>

        {/* Master Institutional Portals */}
        <div className="space-y-1">
          {/* 1. Knowledge Vault Master Hub */}
          {onOpenKnowledgeVault && (
            <button
              onClick={onOpenKnowledgeVault}
              className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[#1a1d1b] hover:bg-[#222624] text-[#f5f1e8] border border-[#2e3430] hover:border-[#de8535]/50 text-xs font-medium transition cursor-pointer shadow-sm group"
              title="Open University Knowledge Vault (7 Institutional Data Modules)"
            >
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-[#de8535] group-hover:scale-110 transition" />
                <span className="tracking-wide text-xs">Knowledge Vault</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#de8535]/15 text-[#de8535] font-mono border border-[#de8535]/30 font-semibold">7 MODULES</span>
            </button>
          )}

          {/* Sub-Module Quick Access (Indented clearly under Knowledge Vault) */}
          <div className="pl-2.5 pr-0.5 py-0.5 space-y-1 border-l-2 border-[#2e3430] ml-3.5">
            <div className="grid grid-cols-2 gap-1">
              {onOpenResearch && (
                <button
                  onClick={onOpenResearch}
                  className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-[#141615] hover:bg-[#1f2321] text-[#8c877a] hover:text-[#f5f1e8] border border-[#282d2a] text-[10px] transition cursor-pointer"
                  title="Direct link to 30-Column Research & Scopus Repository"
                >
                  <Sparkles className="w-3 h-3 text-[#de8535] shrink-0" />
                  <span className="truncate">Research</span>
                </button>
              )}
              {onOpenScholarships && (
                <button
                  onClick={onOpenScholarships}
                  className="flex items-center gap-1.5 py-1 px-2 rounded-lg bg-[#141615] hover:bg-[#1f2321] text-[#8c877a] hover:text-[#f5f1e8] border border-[#282d2a] text-[10px] transition cursor-pointer"
                  title="Direct link to Student Scholarship Eligibility Matcher"
                >
                  <GraduationCap className="w-3 h-3 text-[#4b9b74] shrink-0" />
                  <span className="truncate">Scholarships</span>
                </button>
              )}
            </div>
            {onOpenAutoIngest && (
              <button
                onClick={onOpenAutoIngest}
                className="w-full flex items-center justify-between py-1 px-2 rounded-lg bg-gradient-to-r from-[#de8535]/10 to-[#4b9b74]/10 hover:from-[#de8535]/20 hover:to-[#4b9b74]/20 text-[#f5f1e8] border border-[#de8535]/30 hover:border-[#de8535]/60 text-[10px] font-medium transition cursor-pointer"
                title="Universal Document Ingestion: AI autonomously classifies into Student, Faculty, Research, Event, or Standard"
              >
                <div className="flex items-center gap-1.5">
                  <UploadCloud className="w-3 h-3 text-[#de8535] shrink-0" />
                  <span>✨ Smart Auto-Ingest</span>
                </div>
                <span className="text-[8px] px-1 py-0.2 rounded bg-[#4b9b74]/20 text-[#4b9b74] font-mono">AUTO-AI</span>
              </button>
            )}
          </div>

          {/* 2. Statutory Accreditation Templates */}
          {onOpenFrameworks && (
            <button
              onClick={onOpenFrameworks}
              className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-[#1a1d1b] hover:bg-[#222624] text-[#f5f1e8] border border-[#2e3430] hover:border-yellow-400/50 text-xs font-medium transition cursor-pointer shadow-sm group"
              title="Official Accreditation & Ranking Framework Templates (NAAC, NIRF, UGC, etc.)"
            >
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-yellow-400 group-hover:scale-110 transition" />
                <span className="tracking-wide text-xs">Accreditation Templates</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/15 text-yellow-400 font-mono border border-yellow-400/30 font-semibold">7 BODIES</span>
            </button>
          )}
        </div>

        {/* Real Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1 pt-1 pr-0.5">
          <div className="px-2 pb-1 text-[9px] uppercase font-mono font-bold text-[#7d776b] tracking-wider flex items-center justify-between">
            <span>Recent Chats</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-[#4b9b74] font-mono">{sessions.length} SAVED</span>
              {sessions.length > 0 && onClearAllSessions && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onClearAllSessions();
                  }}
                  className="text-[9px] text-[#7d776b] hover:text-[#c9523c] font-mono transition cursor-pointer hover:underline uppercase"
                  title="Delete all conversations"
                >
                  CLEAR ALL
                </button>
              )}
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#7d776b] font-sans">
              No previous chats
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = activeSessionId === sess.id;
              
              const checkText = `${sess.title || ""} ${sess.messages?.[0]?.content || ""}`.toLowerCase();
              const isCalc = checkText.includes("calc") || checkText.includes("math") || checkText.includes("formula") || checkText.includes("thickness");
              const isPid = checkText.includes("document") || checkText.includes("certificate") || checkText.includes("vision") || checkText.includes("scan") || checkText.includes("drawing") || checkText.includes("image") || checkText.includes(".png") || checkText.includes(".jpg");
              const isAudit = checkText.includes("audit") || checkText.includes("compliance") || checkText.includes("naac") || checkText.includes("ugc") || checkText.includes("nirf") || checkText.includes("wasc") || checkText.includes("dossier") || checkText.includes("standard");
              const isDoc = checkText.includes("note") || checkText.includes("approval") || checkText.includes("circular") || checkText.includes("memo") || checkText.includes("report");

              const badgeLabel = isCalc ? "METRIC" : isPid ? "VISION" : isAudit ? "DOSSIER" : isDoc ? "REPORT" : "TASK";
              const badgeColor = isCalc ? "text-[#4b9b74] border-[#4b9b74]/30 bg-[#4b9b74]/10" : isPid ? "text-[#3d6a8a] border-[#3d6a8a]/30 bg-[#3d6a8a]/10" : isAudit ? "text-[#de8535] border-[#de8535]/30 bg-[#de8535]/10" : isDoc ? "text-[#c9523c] border-[#c9523c]/30 bg-[#c9523c]/10" : "text-[#7d776b] border-[#7d776b]/30 bg-[#7d776b]/10";

              const displayTitle = sess.title && sess.title.trim()
                ? sess.title
                : (sess.messages && sess.messages[0]?.content
                    ? (sess.messages[0].content.length > 26 ? sess.messages[0].content.slice(0, 26) + "..." : sess.messages[0].content)
                    : `Chat ${sess.id.slice(-6)}`);

              return (
                <div
                  key={sess.id}
                  onClick={() => onSelectSession(sess.id)}
                  className={`group sidebar-chat-item flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition cursor-pointer border ${
                    isSelected
                      ? "bg-[#222624] border-[#383e3a] text-[#f5f1e8] font-medium shadow-sm active"
                      : "border-transparent text-[#b8b2a4] hover:bg-[#1c201e] hover:text-[#f5f1e8]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate min-w-0 flex-1 overflow-hidden pr-1">
                    <span className={`text-[8px] font-mono px-1 py-0.2 rounded border font-semibold shrink-0 ${badgeColor}`}>
                      {badgeLabel}
                    </span>
                    <span className="truncate text-xs font-sans text-[#dcd7cb] group-hover:text-[#f5f1e8] transition" title={displayTitle}>
                      {displayTitle}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onDeleteSession(sess.id, e);
                    }}
                    className="chat-delete-btn p-1.5 text-[#7d776b] hover:text-[#c9523c] hover:bg-[#281715] rounded-md transition shrink-0 ml-1.5 cursor-pointer z-10"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Hardware Sovereign Telemetry Plaque (Static Indicator) */}
      <div className="p-3 border-t border-[#242826] bg-[#121413]">
        <div className="w-full flex items-center justify-between p-2 rounded-xl border border-[#2a2f2c] bg-[#161817]/60 text-left select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#4b9b74]/15 border border-[#4b9b74]/30 flex items-center justify-center text-[#4b9b74] shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 truncate">
              <div className="text-[11px] font-mono font-semibold text-[#f5f1e8] truncate flex items-center gap-1.5">
                <span>SOVEREIGN M4</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4b9b74] animate-pulse"></span>
              </div>
              <div className="text-[9px] text-[#7d776b] font-mono truncate">
                0.00 KB Egress • Air-Gapped
              </div>
            </div>
          </div>
          <Activity className="w-3.5 h-3.5 text-[#4b9b74] shrink-0 ml-1" />
        </div>
      </div>
    </aside>
  );
};

