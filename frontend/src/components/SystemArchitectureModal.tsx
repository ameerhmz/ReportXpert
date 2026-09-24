"use client";

import React from "react";
import { 
  X, 
  ShieldCheck, 
  Cpu, 
  Database, 
  FileText, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  Zap,
  Lock
} from "lucide-react";

import { SovereignInsignia } from "./SovereignInsignia";

interface SystemArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry?: any;
}

export const SystemArchitectureModal: React.FC<SystemArchitectureModalProps> = ({
  isOpen,
  onClose,
  telemetry
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl border border-[#2e3430] bg-[#161817] shadow-2xl flex flex-col overflow-hidden text-[#f5f1e8] font-sans tactile-chamfer"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#242826] flex items-center justify-between bg-[#1a1d1b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#de8535]/15 border border-[#de8535]/30 flex items-center justify-center text-[#de8535] shadow-md">
              <SovereignInsignia size={22} glow={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#f5f1e8] tracking-tight font-sans">System Architecture & Capabilities Dossier</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#4b9b74]/15 text-[#4b9b74] border border-[#4b9b74]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4b9b74] animate-pulse"></span>
                  Air-Gapped Sovereign
                </span>
              </div>
              <p className="text-xs text-[#b8b2a4]">
                ReportXpert • Sovereign On-Premise University Administration AI Platform
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-[#7d776b] hover:text-[#f5f1e8] rounded-lg hover:bg-[#222624] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed">
          {/* Executive Overview Card */}
          <div className="p-4 rounded-xl bg-[#262422] border border-[#35332f] space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#da7756] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              The Core Problem & Organizational Mandate
            </h3>
            <p className="text-xs text-[#d4d4d8] leading-relaxed">
              Organizations handle classified intellectual property, private internal plans, and statutory compliance logs. 
              Internal IT cybersecurity policies strictly prohibit public cloud AI tools (ChatGPT, Claude, Copilot) for sensitive data. 
              Professionals do not just need a conversational chatbot—they require signed Word (.docx) approval notes, 
              verified Excel (.xlsx) calculations, and automated safety compliance audits against organizational policies.
            </p>
          </div>

          {/* 5-Agent Architecture Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#9e988f] mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              5-Agent Deterministic State Machine Architecture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#242220] border border-[#33302b]">
                <div className="flex items-center gap-2 text-[#da7756] font-semibold text-xs mb-1">
                  <span>🧠 1. Supervisor Agent</span>
                </div>
                <div className="text-[11px] font-mono text-[#8a8479] mb-1.5">Model: Meta-Llama-3.1-8B</div>
                <p className="text-[11px] text-[#b5afa6]">
                  Decomposes administrative and accreditation prompts into a multi-agent state graph and coordinates specialist agent invocation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#242220] border border-[#33302b]">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1">
                  <span>👁️ 2. Vision Specialist</span>
                </div>
                <div className="text-[11px] font-mono text-[#8a8479] mb-1.5">Model: Qwen2.5-VL-7B (Apple Silicon Metal / CUDA)</div>
                <p className="text-[11px] text-[#b5afa6]">
                  Neural multimodal document OCR: extracts academic certificates, sanction letters, circulars, and structured tabular data.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#242220] border border-[#33302b]">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1">
                  <span>📚 3. Standards RAG</span>
                </div>
                <div className="text-[11px] font-mono text-[#8a8479] mb-1.5">Model: BGE-M3 Dense Vectors</div>
                <p className="text-[11px] text-[#b5afa6]">
                  Semantic clause retrieval across accreditation manuals (NAAC, UGC, NIRF, WASC) and institutional records.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#242220] border border-[#33302b]">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
                  <span>⚙️ 4. Math Auditor</span>
                </div>
                <div className="text-[11px] font-mono text-[#8a8479] mb-1.5">Engine: Isolated Python 3.12 Sandbox</div>
                <p className="text-[11px] text-[#b5afa6]">
                  Zero hallucination: executes deterministic code for Faculty-Student Ratios (FSR), citations per paper, h-index distributions, and NIRF composite scores.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#242220] border border-[#33302b]">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
                  <span>📄 5. Deliverables Compiler</span>
                </div>
                <div className="text-[11px] font-mono text-[#8a8479] mb-1.5">Format: .docx, .xlsx, .pptx</div>
                <p className="text-[11px] text-[#b5afa6]">
                  Programmatically formats Official Dossiers with university letterheads, verified calculation spreadsheets, and briefing decks.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#242220] border border-[#33302b]">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-1">
                  <span>🛡️ Sovereign Air-Gap Monitor</span>
                </div>
                <div className="text-[11px] font-mono text-[#8a8479] mb-1.5">Telemetry: Live Socket Audit</div>
                <p className="text-[11px] text-[#b5afa6]">
                  Actively monitors network interfaces to mathematically verify 0.00 KB external outbound cloud egress.
                </p>
              </div>
            </div>
          </div>

          {/* Model Deployment Modes */}
          <div className="p-4 rounded-xl bg-[#262422] border border-[#35332f] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Dynamic Hardware Topology & Deployment Modes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#1f1e1d] border border-[#383531]">
                <div className="font-semibold text-white mb-1">Mode 1: Autonomous Single-Machine (Current Demo)</div>
                <p className="text-[#9e988f] text-[11px] leading-relaxed">
                  Runs 100% self-contained on Apple Silicon (M-series Metal GPU) using unified memory architecture. 
                  Zero network cables or router setup required.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#1f1e1d] border border-[#383531]">
                <div className="font-semibold text-white mb-1">Mode 2: Distributed Air-Gapped GPU Cluster</div>
                <p className="text-[#9e988f] text-[11px] leading-relaxed">
                  Offloads AWQ-quantized weights (Qwen2.5-VL-7B & DeepSeek-R1-8B) to dedicated worker nodes 
                  (NVIDIA RTX 4060 8GB on port 8001 via vLLM) over local offline Ethernet/Wi-Fi.
                </p>
              </div>
            </div>
          </div>

          {/* Live Jury Proof Points */}
          <div className="p-4 rounded-xl bg-[#262422] border border-[#35332f]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Live Capabilities Verification Checklist
            </h3>
            <ul className="space-y-2 text-xs text-[#d4d4d8]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>No Cloud API Calls</strong>: Open Network Monitor / Wireshark — 0 bytes outbound cloud egress verified.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Deterministic Math</strong>: Every formula is executed in a real Python 3.12 sandbox, not guessed by LLM text.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Real Organization Deliverables</strong>: Click any export button to receive genuine .docx, .xlsx, and .pptx documents formatted for the organization.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2e2c28] bg-[#181716] flex items-center justify-between text-xs text-[#9e988f]">
          <span>ReportXpert • Sovereign On-Premise University Administration AI</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#da7756] hover:bg-[#e48364] text-white font-medium transition cursor-pointer"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
