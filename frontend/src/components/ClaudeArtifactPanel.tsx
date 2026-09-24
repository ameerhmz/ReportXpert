"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  Code2, 
  FileText, 
  Terminal, 
  Play, 
  RotateCcw, 
  Loader2, 
  Download, 
  FileSpreadsheet, 
  Presentation,
  Copy, 
  Check, 
  PanelRight,
  Sparkles,
  FileSearch,
  ExternalLink,
  Square
} from "lucide-react";
import { Artifact } from "../types/workbench";

interface ClaudeArtifactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  artifact: Artifact | null;
  onUpdateArtifact?: (artifact: Artifact) => void;
}

export const ClaudeArtifactPanel: React.FC<ClaudeArtifactPanelProps> = ({
  isOpen,
  onClose,
  artifact,
  onUpdateArtifact
}) => {
  const [activeTab, setActiveTab] = useState<"code" | "console">("code");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStopCode = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
    onUpdateArtifact?.({
      ...artifact!,
      stderr: "🛑 Execution cancelled by user."
    });
  };

  const handleRunCode = async () => {
    if (!artifact) return;
    setIsRunning(true);
    setActiveTab("console");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/sandbox/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: artifact.content }),
        signal: controller.signal
      });
      const data = await res.json();

      const updated: Artifact = {
        ...artifact,
        stdout: data.stdout || "",
        stderr: data.stderr || "",
        execTimeMs: data.execution_time_ms || 0
      };

      onUpdateArtifact?.(updated);
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        return;
      }
      onUpdateArtifact?.({
        ...artifact,
        stderr: err.message || "Failed to execute in sandbox."
      });
    } finally {
      abortControllerRef.current = null;
      setIsRunning(false);
    }
  };

  return (
    <aside className="w-[520px] xl:w-[580px] border-l border-[#2a2f2c] bg-[#161817] flex flex-col shrink-0 animate-in slide-in-from-right duration-200 select-none z-20 tactile-chamfer">
      {/* Header */}
      <div className="h-13 px-4 border-b border-[#2a2f2c] bg-[#1a1d1b] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-[#222624] border border-[#2e3430] text-[#f5f1e8]">
            {artifact?.type === "code" ? (
              <Code2 className="w-4 h-4 text-[#4b9b74]" />
            ) : artifact?.type === "blueprint" ? (
              <FileSearch className="w-4 h-4 text-[#3d6a8a]" />
            ) : (
              <FileText className="w-4 h-4 text-[#de8535]" />
            )}
          </div>
          <div className="truncate">
            <h3 className="text-xs font-semibold text-[#f5f1e8] truncate font-sans">
              {artifact?.title || "Administrative Dossier Inspector"}
            </h3>
            <span className="text-[9px] text-[#7d776b] font-mono tracking-wider uppercase block">
              {artifact?.language ? `${artifact.language} Script` : "Organizational Document"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {artifact?.type === "code" && (
            <>
              {/* Tab Switcher */}
              <div className="flex items-center p-0.5 rounded-lg bg-[#131514] border border-[#2e3430] text-xs font-mono">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    activeTab === "code"
                      ? "bg-[#222624] text-[#f5f1e8] font-semibold border border-[#383e3a]"
                      : "text-[#7d776b] hover:text-[#f5f1e8]"
                  }`}
                >
                  Script
                </button>
                <button
                  onClick={() => setActiveTab("console")}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                    activeTab === "console"
                      ? "bg-[#222624] text-[#f5f1e8] font-semibold border border-[#383e3a]"
                      : "text-[#7d776b] hover:text-[#f5f1e8]"
                  }`}
                >
                  <span>Output</span>
                  {artifact.execTimeMs !== undefined && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4b9b74]"></span>
                  )}
                </button>
              </div>

              {/* Copy */}
              <button
                onClick={() => handleCopy(artifact.content)}
                className="p-1.5 text-[#7d776b] hover:text-[#f5f1e8] rounded-lg hover:bg-[#222624] transition cursor-pointer"
                title="Copy script"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#4b9b74]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Run / Stop */}
              {isRunning ? (
                <button
                  onClick={handleStopCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition cursor-pointer shadow-sm active:scale-95 animate-pulse"
                  title="Stop execution immediately"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>STOP</span>
                </button>
              ) : (
                <button
                  onClick={handleRunCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4b9b74] hover:bg-[#59af85] text-white font-mono font-bold text-xs transition cursor-pointer shadow-sm active:scale-95"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>EXECUTE</span>
                </button>
              )}
            </>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-[#7d776b] hover:text-[#f5f1e8] rounded-lg hover:bg-[#222624] transition cursor-pointer ml-1"
            title="Close inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-[#131514]">
        {!artifact ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#7d776b]">
            <div className="w-11 h-11 rounded-2xl bg-[#1a1d1b] border border-[#2e3430] flex items-center justify-center text-[#de8535] mb-3.5">
              <PanelRight className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium text-[#f5f1e8] mb-1 font-sans">Workspace Ready</div>
            <div className="text-xs text-[#7d776b] max-w-xs leading-relaxed font-sans">
              When the assistant compiles academic dossiers (.docx), research sheets (.xlsx), or statistical scripts, they open here for review.
            </div>
          </div>
        ) : artifact.type === "code" ? (
          activeTab === "code" ? (
            <div className="flex-1 flex flex-col">
              <textarea
                value={artifact.content}
                onChange={(e) => {
                  if (onUpdateArtifact) {
                    onUpdateArtifact({ ...artifact, content: e.target.value });
                  }
                }}
                className="flex-1 p-5 bg-transparent text-[#4b9b74] font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-[#4b9b74]/20"
                spellCheck={false}
              />
            </div>
          ) : (
            <div className="flex-1 p-5 flex flex-col space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#f5f1e8] flex items-center gap-1.5 font-mono">
                  <Terminal className="w-3.5 h-3.5 text-[#3d6a8a]" />
                  Subprocess Sandbox Output (Python 3.12)
                </span>
                {artifact.execTimeMs !== undefined && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1d1b] text-[#4b9b74] border border-[#2e3430]">
                    ⚡ {artifact.execTimeMs} ms
                  </span>
                )}
              </div>

              <div className="flex-1 p-4 rounded-xl bg-[#0e100f] border border-[#242826] font-mono text-xs whitespace-pre-wrap leading-relaxed min-h-[160px] overflow-y-auto text-[#f5f1e8]">
                {artifact.stdout ? (
                  artifact.stdout
                ) : artifact.stderr ? (
                  <span className="text-[#c9523c]">{artifact.stderr}</span>
                ) : (
                  <span className="text-[#7d776b]">Click &quot;EXECUTE&quot; to run this verification script in an isolated subprocess.</span>
                )}
              </div>

              {/* Deliverable Downloads */}
              {artifact.deliverables && (artifact.deliverables.xlsx || artifact.deliverables.docx || artifact.deliverables.pptx) && (
                <div className="pt-3 border-t border-[#242826] space-y-2">
                  <span className="text-xs font-mono font-semibold text-[#b8b2a4] block uppercase">Compiled Deliverables:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {artifact.deliverables.xlsx && (
                      <a
                        href={`http://127.0.0.1:8000/api/deliverables/${artifact.deliverables.xlsx.split("/").pop()}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-[#1a1d1b] hover:bg-[#222624] border border-[#2e3430] hover:border-[#4b9b74] text-xs text-[#f5f1e8] transition"
                      >
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-[#4b9b74]" />
                          <span className="font-medium">Calculation (.xlsx)</span>
                        </div>
                        <Download className="w-3.5 h-3.5 text-[#7d776b]" />
                      </a>
                    )}
                    {artifact.deliverables.docx && (
                      <a
                        href={`http://127.0.0.1:8000/api/deliverables/${artifact.deliverables.docx.split("/").pop()}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-[#1a1d1b] hover:bg-[#222624] border border-[#2e3430] hover:border-[#3d6a8a] text-xs text-[#f5f1e8] transition"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#3d6a8a]" />
                          <span className="font-medium">Sign-off (.docx)</span>
                        </div>
                        <Download className="w-3.5 h-3.5 text-[#7d776b]" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        ) : artifact.type === "blueprint" ? (
          <div className="flex-1 p-5 flex flex-col space-y-4">
            {artifact.imageSrc && (
              <div className="rounded-xl overflow-hidden border border-[#2e3430] bg-black/60 p-2 flex items-center justify-center">
                <img
                  src={artifact.imageSrc}
                  alt="Academic Document / Certificate"
                  className="w-full h-auto max-h-[350px] object-contain rounded"
                />
              </div>
            )}
            <div className="p-4 rounded-xl bg-[#1a1d1b] border border-[#2e3430] text-xs text-[#f5f1e8] leading-relaxed whitespace-pre-wrap">
              {artifact.content}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-5 space-y-4">
            <div className="p-4 rounded-xl bg-[#1a1d1b] border border-[#2e3430] text-xs text-[#f5f1e8] whitespace-pre-wrap leading-relaxed">
              {artifact.content}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
