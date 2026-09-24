"use client";

import React, { useRef, useEffect } from "react";
import { Terminal, Shield, Copy, Check } from "lucide-react";

interface TerminalLogsProps {
  logs: string[];
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs }) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLogLine = (line: string, index: number) => {
    let textColor = "text-slate-300";
    if (line.includes("[SUPERVISOR")) textColor = "text-sky-400";
    else if (line.includes("[VISION")) textColor = "text-purple-400";
    else if (line.includes("[SOVEREIGN RAG")) textColor = "text-amber-400";
    else if (line.includes("[AUDITOR")) textColor = "text-rose-400";
    else if (line.includes("[DELIVERABLE COMPILER")) textColor = "text-emerald-400 font-semibold";

    return (
      <div key={index} className="flex items-start gap-2 py-0.5 leading-relaxed font-mono text-xs">
        <span className="text-slate-600 select-none">{String(index + 1).padStart(2, "0")}</span>
        <span className={textColor}>{line}</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-64">
      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-xs font-bold text-slate-300">Live Sovereign Agent Execution Trace</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            0 External Calls
          </span>
          <button
            onClick={copyLogs}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
            title="Copy Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-[#050811]">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 text-xs font-mono">
            Waiting for workflow trigger... Local inference engine standing by.
          </div>
        ) : (
          logs.map((log, idx) => formatLogLine(log, idx))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
