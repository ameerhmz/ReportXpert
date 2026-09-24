"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Square,
  Paperclip, 
  FileText, 
  FileSpreadsheet, 
  Presentation, 
  Sparkles, 
  Download,
  X,
  Loader2,
  ArrowRight,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileSearch,
  Calculator,
  Database,
  Cpu,
  Clock,
  Zap,
  Terminal,
  ShieldCheck,
  Brain,
  Eye,
  BookOpen,
  Play,
  FileCheck,
  Image as ImageIcon
} from "lucide-react";
import { ChatMessage, Artifact } from "../../types/workbench";
import { ClaudeIcon } from "../ClaudeIcon";
import { SovereignInsignia } from "../SovereignInsignia";

interface AgentWorkbenchChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, file: File | null) => Promise<void>;
  onStopGeneration?: () => void;
  isProcessing: boolean;
  onOpenArtifact: (artifact: Artifact) => void;
  selectedModel?: string;
  onSelectModel?: (modelId: string) => void;
}

export const AgentWorkbenchChat: React.FC<AgentWorkbenchChatProps> = ({
  messages,
  onSendMessage,
  onStopGeneration,
  isProcessing,
  onOpenArtifact,
  selectedModel = "auto",
  onSelectModel,
}) => {
  const [inputPrompt, setInputPrompt] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [expandedThinking, setExpandedThinking] = useState<Record<string, boolean>>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [exportingState, setExportingState] = useState<Record<string, boolean>>({});
  const [activeRoute, setActiveRoute] = useState<{
    title: string;
    type: "vision_direct" | "audit" | "calc" | "standards" | "direct";
    steps: Array<{ id: string; name: string; subtitle: string; icon: string }>;
  } | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live stopwatch timer during processing
  useEffect(() => {
    if (!isProcessing) {
      setElapsedSeconds(0);
      setActiveRoute(null);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Number(((Date.now() - start) / 1000).toFixed(1)));
    }, 100);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const resolveRoute = (prompt: string, file: File | null, model: string = "auto") => {
    const p = prompt.toLowerCase();
    const hasImage = file && [".png", ".jpg", ".jpeg", ".bmp", ".webp"].some(ext => file.name.toLowerCase().endsWith(ext));
    
    const auditKeywords = [
      "compliance dossier", "naac ssr", "wasc report", "dossier compiler", "document check"
    ];
    const isImageAudit = hasImage && auditKeywords.some(k => p.includes(k));
    
    const calcKeywords = ["calculate", "calc", "formula", "compute", "sizing", "thickness", "math", "run script", "simulation", "python code"];
    const isCalc = calcKeywords.some(k => p.includes(k));

    // Only route to Knowledge Vault if user explicitly requests vault SOP/manual/guidelines search
    const vaultLookupKeywords = [
      "search vault", "knowledge vault", "search the vault", "retrieve sop", "find sop",
      "sop manual", "statutory clauses", "clauses in vault", "search standards", "vault query"
    ];
    const isStandards = vaultLookupKeywords.some(k => p.includes(k));

    if (hasImage && !isImageAudit) {
      return {
        title: "Direct Multimodal Vision Route",
        type: "vision_direct" as const,
        steps: [
          { id: "vision", name: "Vision Inspector", subtitle: "Qwen2.5-VL (Metal GPU)", icon: "vision" },
          { id: "response", name: "Direct Response", subtitle: "Natural Multimodal Output", icon: "chat" }
        ]
      };
    }

    if (isImageAudit) {
      return {
        title: "Compliance Dossier Pipeline",
        type: "audit" as const,
        steps: [
          { id: "vision", name: "Document OCR", subtitle: "Qwen2.5-VL Vision", icon: "vision" },
          { id: "vault", name: "Knowledge Vault", subtitle: "BGE-M3 (NAAC / UGC / SOPs)", icon: "vault" },
          { id: "compiler", name: "Dossier Compiler", subtitle: "DeepSeek-R1 Engine", icon: "brain" },
          { id: "docs", name: "Deliverables", subtitle: "Compliance Dossier (.docx)", icon: "docs" }
        ]
      };
    }

    if (isCalc) {
      return {
        title: "Verified Python Sandbox",
        type: "calc" as const,
        steps: [
          { id: "planner", name: "Formula Planner", subtitle: model !== "auto" ? model : "Llama-3 Orchestrator", icon: "brain" },
          { id: "sandbox", name: "Python Sandbox", subtitle: "Python 3.12 Subprocess", icon: "sandbox" },
          { id: "compiler", name: "Workbook Compiler", subtitle: "Excel Trace (.xlsx)", icon: "docs" }
        ]
      };
    }

    if (isStandards) {
      return {
        title: "Knowledge Vault Standards",
        type: "standards" as const,
        steps: [
          { id: "vault", name: "Knowledge Vault", subtitle: "BGE-M3 SOP Search", icon: "vault" },
          { id: "auditor", name: "Reasoning Engine", subtitle: model !== "auto" ? model : "DeepSeek-R1 Engine", icon: "brain" }
        ]
      };
    }

    const modelLabel = model !== "auto" ? model : "Llama-3.2 (Metal GPU)";
    return {
      title: "Direct Sovereign Neural Inference",
      type: "direct" as const,
      steps: [
        { id: "direct", name: "Conversational Engine", subtitle: `${modelLabel}`, icon: "brain" },
        { id: "response", name: "Assistant Response", subtitle: "Streaming Output", icon: "chat" }
      ]
    };
  };

  const renderActiveRouteBanner = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    const currentRoute = activeRoute || resolveRoute(lastUserMsg?.content || "", null, selectedModel);

    let activeStepIndex = 0;
    if (currentRoute.type === "vision_direct") {
      activeStepIndex = elapsedSeconds < 3.5 ? 0 : 1;
    } else if (currentRoute.type === "audit") {
      activeStepIndex = elapsedSeconds < 4.0 ? 0 : elapsedSeconds < 8.0 ? 1 : elapsedSeconds < 25.0 ? 2 : 3;
    } else if (currentRoute.type === "calc") {
      activeStepIndex = elapsedSeconds < 2.0 ? 0 : elapsedSeconds < 4.0 ? 1 : 2;
    } else if (currentRoute.type === "standards") {
      activeStepIndex = elapsedSeconds < 2.5 ? 0 : 1;
    } else {
      activeStepIndex = elapsedSeconds < 1.0 ? 0 : 1;
    }

    return (
      <div className="w-full px-3 py-1.5 rounded-xl bg-[#141715] border border-[#2b312d] shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs font-mono tactile-chamfer animate-in fade-in duration-150">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none min-w-0">
          <div className="flex items-center gap-1.5 font-semibold text-[#de8535] bg-[#de8535]/10 px-2 py-0.5 rounded-md border border-[#de8535]/20 shrink-0 text-[11px]">
            <Loader2 className="w-3 h-3 animate-spin text-[#de8535]" />
            <span>{currentRoute.title}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0 text-[10px]">
            {currentRoute.steps.map((step, sIdx) => {
              const isActive = activeStepIndex === sIdx;
              const isDone = activeStepIndex > sIdx;
              return (
                <React.Fragment key={step.id}>
                  {sIdx > 0 && <span className="text-[#3a3f3c]">→</span>}
                  <span className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                    isActive
                      ? "bg-[#25201a] text-[#f5aa67] border border-[#de8535]/40 font-semibold ring-1 ring-[#de8535]/20 shadow-[0_0_8px_rgba(222,133,53,0.15)]"
                      : isDone
                      ? "bg-[#142017] text-[#4b9b74] border border-[#4b9b74]/30"
                      : "bg-[#101211] text-[#6b665c] border border-[#1e2220]"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#4b9b74] shrink-0" />
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#de8535] animate-ping shrink-0" />
                    ) : null}
                    <span>{step.name}</span>
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] shrink-0 ml-auto">
          {onStopGeneration && (
            <button
              type="button"
              onClick={onStopGeneration}
              className="flex items-center gap-1 font-bold text-red-400 hover:text-white bg-red-500/15 hover:bg-red-600 px-2 py-0.5 rounded border border-red-500/30 transition shadow-sm cursor-pointer active:scale-95 animate-pulse"
              title="Stop generation immediately (Esc)"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>Stop</span>
            </button>
          )}
          <span className="flex items-center gap-1 text-[#f5aa67] px-1.5 py-0.5 rounded bg-[#201b16] border border-[#382b20]">
            <Clock className="w-2.5 h-2.5 text-[#f5aa67]" />
            <span>{elapsedSeconds.toFixed(1)}s</span>
          </span>
          <span className="text-[#4b9b74] bg-[#4b9b74]/10 px-1.5 py-0.5 rounded border border-[#4b9b74]/20 font-semibold flex items-center gap-1 hidden sm:flex">
            <ShieldCheck className="w-2.5 h-2.5 text-[#4b9b74]" />
            0.00 KB Egress
          </span>
        </div>
      </div>
    );
  };

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (attachedFile && (attachedFile.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(attachedFile.name))) {
      const url = URL.createObjectURL(attachedFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [attachedFile]);

  const processClipboardData = (data: DataTransfer | null): boolean => {
    if (!data) return false;

    // 1. Files copied directly from Finder / File Manager (Cmd+C on image files)
    if (data.files && data.files.length > 0) {
      for (let i = 0; i < data.files.length; i++) {
        const file = data.files[i];
        if (file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|pdf)$/i.test(file.name)) {
          setAttachedFile(file);
          return true;
        }
      }
    }

    // 2. Direct clipboard image blobs (Cmd+Ctrl+Shift+4 screenshots, browser image copy, snips)
    if (data.items && data.items.length > 0) {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i];
        if (item.type.startsWith("image/") || item.kind === "file") {
          const file = item.getAsFile();
          if (file && (file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name))) {
            const namedFile = new File([file], `image_clip_${Date.now()}.png`, { type: file.type || "image/png" });
            setAttachedFile(namedFile);
            return true;
          }
        }
      }
    }

    return false;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (processClipboardData(e.clipboardData)) {
      e.preventDefault();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setAttachedFile(file);
    }
  };

  const toggleThinking = (id: string) => {
    setExpandedThinking(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = async (msgId: string, format: "docx" | "xlsx" | "pptx", content: string) => {
    const key = `${msgId}-${format}`;
    setExportingState(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch("http://127.0.0.1:8000/api/deliverables/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: msgId,
          format,
          content
        })
      });
      const data = await res.json();
      if (data.download_url) {
        window.open(`http://127.0.0.1:8000${data.download_url}`, "_blank");
      }
    } catch (e) {
      console.error("Export error", e);
    } finally {
      setExportingState(prev => ({ ...prev, [key]: false }));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const welcomeTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Adjust textarea height dynamically up to 220px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(Math.max(textareaRef.current.scrollHeight, 44), 220)}px`;
    }
    if (welcomeTextareaRef.current) {
      welcomeTextareaRef.current.style.height = "auto";
      welcomeTextareaRef.current.style.height = `${Math.min(Math.max(welcomeTextareaRef.current.scrollHeight, 60), 220)}px`;
    }
  }, [inputPrompt]);

  // Global window paste listener: catches Cmd+V anywhere on the page
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (processClipboardData(e.clipboardData)) {
        e.preventDefault();
        if (messages.length > 0 && textareaRef.current) {
          textareaRef.current.focus();
        } else if (welcomeTextareaRef.current) {
          welcomeTextareaRef.current.focus();
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [messages.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
    // Reset input so re-selecting the exact same file fires onChange again
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" && isProcessing && onStopGeneration) {
      e.preventDefault();
      onStopGeneration();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!inputPrompt.trim() && !attachedFile) return;
    const promptToSend = inputPrompt;
    const fileToSend = attachedFile;
    setActiveRoute(resolveRoute(promptToSend, fileToSend, selectedModel));
    onSendMessage(promptToSend, fileToSend);
    setInputPrompt("");
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const toggleSteps = (id: string) => {
    setExpandedSteps(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Rich Inline Markdown Renderer
  const renderInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return null;

    // Matches: `code`, **bold**, __bold__, *italic*, _italic_, [label](url)
    const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|_[^_\s][^_]*_|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, pIdx) => {
      if (!part) return null;

      // Inline code: `code`
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return (
          <code
            key={pIdx}
            className="px-1.5 py-0.5 rounded bg-[#1e2220] border border-[#2e3430] text-[#4b9b74] font-mono text-[11px] mx-0.5"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold: **text** or __text__
      if ((part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
          (part.startsWith("__") && part.endsWith("__") && part.length >= 4)) {
        return (
          <strong key={pIdx} className="font-semibold text-[#f5f1e8]">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic: *text* or _text_
      if ((part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
          (part.startsWith("_") && part.endsWith("_") && part.length >= 2)) {
        return (
          <em key={pIdx} className="italic text-[#d0cbc2]">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Markdown Link: [label](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={pIdx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#de8535] underline hover:text-[#f5aa67] transition-colors inline-flex items-center gap-0.5 font-medium"
          >
            <span>{linkMatch[1]}</span>
            <span className="text-[10px] no-underline">↗</span>
          </a>
        );
      }

      // Normal text segment
      return <React.Fragment key={pIdx}>{part}</React.Fragment>;
    });
  };

  // Helper to split table rows into trimmed cells
  const parseTableRow = (rowStr: string): string[] => {
    const trimmed = rowStr.trim();
    const withoutEdges = trimmed.replace(/^\|/, "").replace(/\|$/, "");
    return withoutEdges.split("|").map(cell => cell.trim());
  };

  // Advanced Markdown formatter
  const renderFormattedContent = (text: string, msg: ChatMessage) => {
    const segments = text.split(/(```[\s\S]*?```)/g);

    return segments.map((seg, sIdx) => {
      if (seg.startsWith("```")) {
        const lines = seg.slice(3, -3).trim().split("\n");
        const hasKnownLang = ["python", "bash", "sh", "json", "sql", "typescript", "javascript", "html", "css"].includes(lines[0].trim().toLowerCase());
        const lang = hasKnownLang ? lines[0].trim().toLowerCase() : "python";
        const codeContent = hasKnownLang ? lines.slice(1).join("\n") : lines.join("\n");

        return (
          <div key={sIdx} className="my-3 rounded-xl overflow-hidden border border-[#33333a] bg-[#121215] shadow-md">
            <div className="px-4 py-2 bg-[#1b1b20] border-b border-[#2b2b32] flex items-center justify-between text-xs text-[#9c9aa2] font-mono">
              <span className="font-semibold text-zinc-300">{lang.toUpperCase()}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopyCode(codeContent, sIdx)}
                  className="flex items-center gap-1 text-[#9c9aa2] hover:text-white transition cursor-pointer"
                >
                  {copiedIdx === sIdx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIdx === sIdx ? "Copied" : "Copy"}</span>
                </button>
                {msg.artifact && (
                  <button
                    onClick={() => onOpenArtifact(msg.artifact!)}
                    className="text-[#da7756] hover:text-[#e58a6c] font-medium cursor-pointer"
                  >
                    Open in Workspace ↗
                  </button>
                )}
              </div>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      }

      // Parse non-code blocks: headings, bold banners, numbered items, tables, bullets, quotes
      const lines = seg.split("\n");
      const renderedElements: React.ReactNode[] = [];
      let i = 0;

      while (i < lines.length) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        // 1. Table Detection: line starts with | and next line is table separator |--|
        if (trimmed.startsWith("|") && i + 1 < lines.length && /^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(lines[i + 1])) {
          const headerCells = parseTableRow(lines[i]);
          i += 2; // skip header & separator line
          const dataRows: string[][] = [];
          while (i < lines.length && lines[i].trim().startsWith("|")) {
            dataRows.push(parseTableRow(lines[i]));
            i++;
          }

          renderedElements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-3 rounded-xl border border-[#2e3430] bg-[#161817] shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#1c1f1d] border-b border-[#2e3430]">
                  <tr>
                    {headerCells.map((h, hIdx) => (
                      <th key={hIdx} className="px-3.5 py-2.5 font-semibold text-[#de8535] whitespace-nowrap font-mono text-[11px] tracking-wide uppercase">
                        {renderInlineMarkdown(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242826] text-[#e4e4e7]">
                  {dataRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#1f2321] transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2 font-mono text-[11px] leading-relaxed">
                          {renderInlineMarkdown(cell) || <span className="text-[#555]">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }

        // 2. Horizontal divider: ---, ***, ___
        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          renderedElements.push(<hr key={`hr-${i}`} className="border-[#2e3430] my-3.5" />);
          i++;
          continue;
        }

        // 3. Empty line spacer
        if (!trimmed) {
          renderedElements.push(<div key={`sp-${i}`} className="h-1.5" />);
          i++;
          continue;
        }

        // 4. Bold numbered section heading: **1. Title** or 1. **Title**
        const boldNumMatch = trimmed.match(/^\*\*(\d+)\.\s*(.*?)\*\*$/) || trimmed.match(/^(\d+)\.\s*\*\*(.*?)\*\*$/);
        if (boldNumMatch) {
          renderedElements.push(
            <div key={`bnum-${i}`} className="flex items-center gap-2.5 mt-4 mb-2 pt-2 border-t border-[#262a28]/60 first:border-0 first:pt-0">
              <span className="w-6 h-6 rounded-md bg-[#de8535]/15 border border-[#de8535]/35 text-[#de8535] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                {boldNumMatch[1]}
              </span>
              <h4 className="text-sm font-bold text-[#f5f1e8] tracking-tight font-sans">
                {renderInlineMarkdown(boldNumMatch[2])}
              </h4>
            </div>
          );
          i++;
          continue;
        }

        // 5. Standalone bold title / banner: **ReportXpert at Your Service** or **Overview**
        const boldHeadMatch = trimmed.match(/^\*\*(.*?)\*\*$/);
        if (boldHeadMatch) {
          renderedElements.push(
            <div key={`bhead-${i}`} className="flex items-center gap-2 text-base font-bold text-[#f5f1e8] mt-3.5 mb-2 font-sans first:mt-0">
              <span className="w-1.5 h-4.5 rounded-full bg-[#de8535] shrink-0" />
              <span>{renderInlineMarkdown(boldHeadMatch[1])}</span>
            </div>
          );
          i++;
          continue;
        }

        // 6. Headings (#, ##, ###, ####)
        if (trimmed.startsWith("# ")) {
          renderedElements.push(
            <h1 key={`h1-${i}`} className="text-xl font-bold text-[#f5f1e8] mt-4 mb-2 tracking-tight flex items-center gap-2 first:mt-0">
              <span className="w-2 h-5 rounded-full bg-[#de8535] shrink-0" />
              <span>{renderInlineMarkdown(trimmed.slice(2))}</span>
            </h1>
          );
          i++;
          continue;
        }
        if (trimmed.startsWith("## ")) {
          renderedElements.push(
            <h2 key={`h2-${i}`} className="text-lg font-bold text-[#f5f1e8] mt-3.5 mb-1.5 pb-1 border-b border-[#2e3430] tracking-tight first:mt-0">
              {renderInlineMarkdown(trimmed.slice(3))}
            </h2>
          );
          i++;
          continue;
        }
        if (trimmed.startsWith("### ")) {
          renderedElements.push(
            <h3 key={`h3-${i}`} className="text-base font-semibold text-[#f5f1e8] mt-3 mb-1 first:mt-0">
              {renderInlineMarkdown(trimmed.slice(4))}
            </h3>
          );
          i++;
          continue;
        }
        if (trimmed.startsWith("#### ")) {
          renderedElements.push(
            <h4 key={`h4-${i}`} className="text-sm font-semibold text-[#de8535] mt-2 mb-0.5 first:mt-0">
              {renderInlineMarkdown(trimmed.slice(5))}
            </h4>
          );
          i++;
          continue;
        }

        // 7. Blockquote: > text
        if (trimmed.startsWith("> ")) {
          renderedElements.push(
            <blockquote key={`quote-${i}`} className="border-l-2 border-[#de8535] pl-3 py-1.5 my-2 text-sm text-[#b8b2a4] bg-[#1e2220]/40 rounded-r italic">
              {renderInlineMarkdown(trimmed.slice(2))}
            </blockquote>
          );
          i++;
          continue;
        }

        // 8. Bullet item: - text, * text, • text
        const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
        if (bulletMatch) {
          renderedElements.push(
            <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#de8535] shrink-0 mt-2" />
              <div className="text-sm text-[#d4d4d8] leading-relaxed flex-1">
                {renderInlineMarkdown(bulletMatch[1])}
              </div>
            </div>
          );
          i++;
          continue;
        }

        // 9. Standard numbered list item: 1. text
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          renderedElements.push(
            <div key={`num-${i}`} className="flex items-start gap-2.5 my-1.5 pl-0.5">
              <span className="w-5 h-5 rounded-md bg-[#222624] border border-[#2e3430] text-[#de8535] text-[11px] font-mono font-medium flex items-center justify-center shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <div className="text-sm text-[#e4e4e7] leading-relaxed flex-1">
                {renderInlineMarkdown(numMatch[2])}
              </div>
            </div>
          );
          i++;
          continue;
        }

        // 10. Standard paragraph (supports inline bold, code, italic, links)
        renderedElements.push(
          <p key={`p-${i}`} className="text-sm text-[#e4e4e7] leading-relaxed">
            {renderInlineMarkdown(rawLine)}
          </p>
        );
        i++;
      }

      return (
        <div key={sIdx} className="space-y-1.5">
          {renderedElements}
        </div>
      );
    });
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden bg-[#131514] bg-drafting-grid relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Visual Feedback Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#131514]/90 backdrop-blur-sm border-2 border-dashed border-[#de8535] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-[#1e2220] border border-[#de8535]/40 shadow-2xl flex flex-col items-center text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#de8535]/15 text-[#de8535] flex items-center justify-center mb-3">
              <Paperclip className="w-7 h-7 animate-bounce" />
            </div>
            <div className="text-base font-semibold text-[#f5f1e8] mb-1 font-sans">Drop Image Clip or File</div>
            <div className="text-xs text-[#8e897e] font-mono">Academic certificates, circulars, research papers, or compliance evidence</div>
          </div>
        </div>
      )}

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          /* Bespoke Sovereign Engineering Console Welcome Screen */
          <div className="min-h-full flex flex-col items-center justify-center max-w-3xl mx-auto w-full py-8 text-center">
            {/* University Sovereign Insignia & Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#de8535]/10 border border-[#de8535]/30 text-[#de8535] text-[10px] font-mono font-bold tracking-widest uppercase mb-3 shadow-sm">
              <SovereignInsignia size={14} glow={true} />
              <span>UNIVERSITY // COMPLIANCE & ACCREDITATION COPILOT</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-[#f5f1e8] tracking-tight mb-2 font-sans">
              ReportXpert
            </h1>
            <p className="text-xs sm:text-sm text-[#b8b2a4] max-w-lg mb-6 leading-relaxed">
              Air-gapped administrative copilot and accreditation engine grounded strictly in your on-premise Knowledge Library. Automates NAAC, UGC, NIRF, and WASC dossier compilation, faculty metrics, and institutional reporting with 0.00 KB cloud egress.
            </p>

            {/* Central Industrial Input Deck */}
            <div 
              className="w-full rounded-2xl p-4 bg-[#1a1d1b] border border-[#2f3431] focus-within:border-[#de8535]/70 transition-all text-left mb-6 shadow-xl tactile-chamfer"
            >
              {attachedFile && (
                <div className="mb-3 p-2 rounded-xl bg-[#222624] border border-[#383f3b] flex items-center justify-between text-xs text-[#f5f1e8] shadow-sm animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {imagePreviewUrl ? (
                      <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-[#4a544f] shrink-0 bg-black/40">
                        <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#2a2f2c] flex items-center justify-center shrink-0 text-[#de8535]">
                        <Paperclip className="w-5 h-5" />
                      </div>
                    )}
                    <div className="truncate">
                      <div className="font-mono text-xs text-[#f5f1e8] font-medium truncate max-w-[200px] sm:max-w-xs">{attachedFile.name}</div>
                      <div className="text-[10px] text-[#8e897e] flex items-center gap-1.5 mt-0.5">
                        <span>{(attachedFile.size / 1024).toFixed(1)} KB</span>
                        {imagePreviewUrl && <span className="text-[#de8535] font-semibold uppercase tracking-wider text-[9px]">• Image Clip Attached</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="p-1.5 hover:text-[#e05244] hover:bg-[#2e3430] rounded-lg transition text-[#8e897e] cursor-pointer"
                    title="Remove clip"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <textarea
                ref={welcomeTextareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Ask a question, paste confidential data/images (Cmd+V), or request a report..."
                rows={2}
                className="w-full bg-transparent border-0 text-sm text-[#f5f1e8] placeholder-[#7d776b] focus:outline-none focus:ring-0 resize-none font-sans min-h-[52px]"
              />

              <div className="flex items-center justify-between pt-2 border-t border-[#262a28]">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-[#7d776b] hover:text-[#f5f1e8] rounded-lg hover:bg-[#222624] transition text-xs flex items-center gap-1.5 cursor-pointer font-sans"
                    title="Attach academic document, spreadsheet, or certificate"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-[#de8535]" />
                    <span className="text-[11px]">Attach File</span>
                  </button>

                  <span className="text-[10px] font-mono text-[#7d776b] px-2 py-0.5 rounded-md bg-[#131514] border border-[#2e3430] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4b9b74]"></span>
                    <span className="text-[#b8b2a4]">{selectedModel === "auto" || !selectedModel ? "Auto-Router" : selectedModel}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#7d776b] hidden sm:inline font-sans">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-[#222624] text-[#b8b2a4] border border-[#2e3430]">Enter ↵</kbd> to send
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={!inputPrompt.trim() && !attachedFile}
                    className="p-2 rounded-xl bg-[#de8535] hover:bg-[#eb9242] disabled:opacity-40 disabled:hover:bg-[#de8535] text-white transition shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Suggested Workflows (University Administration & Accreditation) */}
            <div className="w-full text-left space-y-1.5">
              <div className="text-[11px] font-semibold text-[#7d776b] uppercase tracking-wider px-1">
                Suggested Organizational Tasks
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {/* Task 1: NAAC / UGC Accreditation Dossier (.docx) */}
                <div
                  onClick={() => {
                    setInputPrompt("Compile an executive NAAC Criterion 3 research dossier (.docx) including faculty publication counts, extramural research grants, patent filings, and UGC guidelines compliance with sign-off blocks.");
                    textareaRef.current?.focus();
                  }}
                  className="p-3.5 rounded-xl bg-[#1a1d1b] hover:bg-[#202321] border border-[#2e3430] hover:border-[#de8535]/50 transition cursor-pointer flex flex-col justify-between group shadow-sm tactile-chamfer relative"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#de8535]/15 border border-[#de8535]/30 text-[#de8535] shrink-0 group-hover:scale-105 transition">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#f5f1e8] group-hover:text-white">
                        NAAC / UGC Accreditation Dossier (.docx)
                      </div>
                      <div className="text-[11px] text-[#b8b2a4] leading-snug mt-1">
                        Compile Criterion 3 research metrics, citations, and funding into sign-ready Word (.docx) dossier
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#262a28] flex items-center justify-between">
                    <span className="text-[10px] text-[#7d776b]">Deliverables Agent</span>
                    <span className="text-[10px] text-[#de8535] group-hover:underline font-medium">Use prompt →</span>
                  </div>
                </div>

                {/* Task 2: Academic Certificate & Document OCR */}
                <div
                  onClick={() => {
                    setInputPrompt("Extract academic certificates, student achievement awards, and department circulars using local Vision AI, parse key metrics, and format for NAAC records.");
                    textareaRef.current?.focus();
                  }}
                  className="p-3.5 rounded-xl bg-[#1a1d1b] hover:bg-[#202321] border border-[#2e3430] hover:border-[#3d6a8a]/60 transition cursor-pointer flex flex-col justify-between group shadow-sm tactile-chamfer relative"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#3d6a8a]/15 border border-[#3d6a8a]/30 text-[#3d6a8a] shrink-0 group-hover:scale-105 transition">
                      <FileSearch className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#f5f1e8] group-hover:text-white">
                        Academic Document & Certificate OCR
                      </div>
                      <div className="text-[11px] text-[#b8b2a4] leading-snug mt-1">
                        Read scanned certificates, award letters, and circulars via local Vision model into structured data
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#262a28] flex items-center justify-between">
                    <span className="text-[10px] text-[#7d776b]">Vision Agent (Doc-OCR)</span>
                    <span className="text-[10px] text-[#3d6a8a] group-hover:underline font-medium">Use prompt →</span>
                  </div>
                </div>

                {/* Task 3: NIRF & FSR Metric Calculator (.xlsx) */}
                <div
                  onClick={() => {
                    setInputPrompt("Calculate institutional Faculty-Student Ratio (FSR), citations per paper, and NIRF composite RPC research score in Python sandbox and generate an Excel (.xlsx) sheet.");
                    textareaRef.current?.focus();
                  }}
                  className="p-3.5 rounded-xl bg-[#1a1d1b] hover:bg-[#202321] border border-[#2e3430] hover:border-[#4b9b74]/60 transition cursor-pointer flex flex-col justify-between group shadow-sm tactile-chamfer relative"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#4b9b74]/15 border border-[#4b9b74]/30 text-[#4b9b74] shrink-0 group-hover:scale-105 transition">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#f5f1e8] group-hover:text-white">
                        NIRF & FSR Metric Calculator (.xlsx)
                      </div>
                      <div className="text-[11px] text-[#b8b2a4] leading-snug mt-1">
                        Compute FSR, h-index distributions, and NIRF composite scores with verified Python sandbox math
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#262a28] flex items-center justify-between">
                    <span className="text-[10px] text-[#7d776b]">Python Sandbox Agent</span>
                    <span className="text-[10px] text-[#4b9b74] group-hover:underline font-medium">Use prompt →</span>
                  </div>
                </div>

                {/* Task 4: Faculty & Student Research Audit */}
                <div
                  onClick={() => {
                    setInputPrompt("Audit faculty publication indexing across Scopus and Web of Science, review student hackathon achievements, and draft a Syndicate board briefing.");
                    textareaRef.current?.focus();
                  }}
                  className="p-3.5 rounded-xl bg-[#1a1d1b] hover:bg-[#202321] border border-[#2e3430] hover:border-[#c9523c]/60 transition cursor-pointer flex flex-col justify-between group shadow-sm tactile-chamfer relative"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#c9523c]/15 border border-[#c9523c]/30 text-[#c9523c] shrink-0 group-hover:scale-105 transition">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#f5f1e8] group-hover:text-white">
                        Faculty & Student Research Audit
                      </div>
                      <div className="text-[11px] text-[#b8b2a4] leading-snug mt-1">
                        Audit Scopus/WoS indexed papers, seed grants, student achievements, and draft executive briefing
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#262a28] flex items-center justify-between">
                    <span className="text-[10px] text-[#7d776b]">Reasoning Agent (DeepSeek)</span>
                    <span className="text-[10px] text-[#c9523c] group-hover:underline font-medium">Use prompt →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Stream */
          <div className="max-w-3xl mx-auto w-full space-y-6 pb-6">
            {messages.map((msg, idx) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {msg.role === "user" ? (
                  <div className="max-w-2xl rounded-2xl px-4 py-3 bg-[#1e2220] text-[#f5f1e8] text-sm leading-relaxed shadow-sm border border-[#333935] tactile-chamfer">
                    {msg.fileAttached && (
                      <div className="mb-2.5">
                        {msg.fileAttached.url ? (
                          <div 
                            className="rounded-xl overflow-hidden border border-[#3a413d] bg-black/40 max-w-xs cursor-pointer group shadow-sm hover:border-[#de8535]/60 transition"
                            onClick={() => onOpenArtifact({
                              id: `img-${msg.id}`,
                              title: msg.fileAttached?.name || "Attached Image Clip",
                              type: "blueprint",
                              content: "Pasted / Attached Image Clip",
                              imageSrc: msg.fileAttached?.url
                            })}
                            title="Click to inspect image in workspace"
                          >
                            <img
                              src={msg.fileAttached.url}
                              alt={msg.fileAttached.name}
                              className="w-full max-h-48 object-cover group-hover:scale-[1.02] transition"
                            />
                            <div className="px-2.5 py-1.5 bg-[#161817] flex items-center justify-between text-[11px] font-mono text-[#b8b2a4] border-t border-[#2a2f2c]">
                              <span className="truncate max-w-[180px]">{msg.fileAttached.name}</span>
                              <span className="text-[10px] text-[#7d776b]">{msg.fileAttached.size}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="px-2.5 py-1 bg-[#131514] border border-[#2a2f2c] rounded-lg flex items-center gap-1.5 text-xs text-[#b8b2a4] font-mono w-fit">
                            <Paperclip className="w-3.5 h-3.5 text-[#de8535]" />
                            <span>{msg.fileAttached.name}</span>
                            {msg.fileAttached.size && <span className="text-[10px] text-[#7d776b]">({msg.fileAttached.size})</span>}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.content.split("\n").map((line, lIdx) => (
                        <React.Fragment key={lIdx}>
                          {lIdx > 0 && <br />}
                          {renderInlineMarkdown(line)}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex gap-3.5">
                    <div className="mt-1 shrink-0">
                      <SovereignInsignia size={26} glow={true} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Active Route Pipeline Progress (On Top of Streaming Text) */}
                      {isProcessing && idx === messages.length - 1 && !msg.trace && (
                        renderActiveRouteBanner()
                      )}

                      {/* Transparent Model Execution & Hardware Routing Trace */}
                      {msg.trace && (
                        <div className="p-2.5 rounded-xl bg-[#1a1d1b] border border-[#2e3430] flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm tactile-chamfer">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-mono font-semibold text-[#de8535] bg-[#de8535]/10 px-2 py-0.5 rounded-md border border-[#de8535]/20">
                              <Cpu className="w-3 h-3 text-[#de8535]" />
                              {msg.trace.model}
                            </span>
                            <span className="text-[#b8b2a4] font-mono text-[11px] hidden sm:inline">
                              on {msg.trace.device}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 font-mono text-[11px] text-[#b8b2a4]">
                            <span className="flex items-center gap-1 text-[#4b9b74]">
                              <Clock className="w-3 h-3 text-[#4b9b74]" />
                              {msg.trace.latency_ms} ms
                            </span>
                            {msg.trace.tokens_per_sec ? (
                              <span className="flex items-center gap-1 text-[#3d6a8a]">
                                <Zap className="w-3 h-3 text-[#3d6a8a]" />
                                {msg.trace.tokens_per_sec} tok/s
                              </span>
                            ) : null}
                            {msg.trace.rag_sources_count ? (
                              <span className="flex items-center gap-1 text-[#de8535]">
                                <Database className="w-3 h-3 text-[#de8535]" />
                                {msg.trace.rag_sources_count} RAG clauses
                              </span>
                            ) : null}
                            {msg.trace.sandbox_ms ? (
                              <span className="flex items-center gap-1 text-[#f5aa67]">
                                <Terminal className="w-3 h-3 text-[#f5aa67]" />
                                Sandbox: {msg.trace.sandbox_ms} ms
                              </span>
                            ) : null}
                            <span className="flex items-center gap-1 text-[#4b9b74] border-l border-[#2e3430] pl-2 font-semibold">
                              <ShieldCheck className="w-3 h-3 text-[#4b9b74]" />
                              0.00 KB Egress
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Real Artifact Card */}
                      {msg.artifact && (
                        <div
                          onClick={() => onOpenArtifact(msg.artifact!)}
                          className="p-3.5 rounded-xl bg-[#1a1d1b] hover:bg-[#202321] border border-[#2e3430] hover:border-[#383e3a] transition cursor-pointer flex items-center justify-between group shadow-sm tactile-chamfer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 rounded-lg bg-[#131514] border border-[#262a28] text-[#de8535]">
                              {msg.artifact.type === "code" ? (
                                <Code2 className="w-4 h-4 text-[#4b9b74]" />
                              ) : msg.artifact.type === "blueprint" ? (
                                <FileSearch className="w-4 h-4 text-[#3d6a8a]" />
                              ) : (
                                <FileText className="w-4 h-4 text-[#de8535]" />
                              )}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-semibold text-[#f5f1e8] flex items-center gap-2">
                                <span className="truncate">{msg.artifact.title}</span>
                                <span className="text-[10px] text-[#7d776b] font-mono px-1.5 py-0.2 rounded bg-[#131514] border border-[#242826]">
                                  {msg.artifact.type}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#b8b2a4]">Click to inspect in engineering workspace</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#de8535] group-hover:text-[#eb9242] font-medium shrink-0 ml-2">
                            <span>Open</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}

                      {/* DeepSeek-R1 / Claude 3.7 Reasoning Process Drawer */}
                      {msg.thinkingContent && (
                        <div className="rounded-xl border border-[#2a302c] bg-[#141715] overflow-hidden tactile-chamfer shadow-sm">
                          <button
                            type="button"
                            onClick={() => toggleThinking(msg.id)}
                            className="w-full py-2 px-3.5 flex items-center justify-between text-xs text-[#b8b2a4] hover:text-[#f5f1e8] hover:bg-[#1a1d1b] transition cursor-pointer font-mono"
                          >
                            <div className="flex items-center gap-2">
                              <Brain className="w-3.5 h-3.5 text-[#de8535]" />
                              <span className="font-semibold text-zinc-300">
                                {(expandedThinking[msg.id] ?? (isProcessing && idx === messages.length - 1 && !msg.content))
                                  ? "Thinking Process"
                                  : "Thought for reasoning"}
                              </span>
                              {isProcessing && idx === messages.length - 1 && !msg.content ? (
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#de8535] animate-ping" />
                              ) : msg.trace?.latency_ms ? (
                                <span className="text-[10px] text-[#7d776b]">({(msg.trace.latency_ms / 1000).toFixed(1)}s)</span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#7d776b]">
                              <span>{(expandedThinking[msg.id] ?? (isProcessing && idx === messages.length - 1 && !msg.content)) ? "Collapse" : "Expand"}</span>
                              {(expandedThinking[msg.id] ?? (isProcessing && idx === messages.length - 1 && !msg.content)) ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </button>

                          {(expandedThinking[msg.id] ?? (isProcessing && idx === messages.length - 1 && !msg.content)) && (
                            <div className="p-3.5 border-t border-[#232825] bg-[#101211] text-xs font-mono text-[#9c9688] leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto pl-4 border-l-2 border-l-[#de8535]/80">
                              {msg.thinkingContent}
                              {isProcessing && idx === messages.length - 1 && !msg.content && (
                                <span className="inline-block w-1.5 h-3.5 bg-[#de8535] animate-pulse ml-1 align-middle rounded-sm" />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Text Content with Real-Time Streaming Cursor */}
                      <div className="text-sm leading-relaxed text-[#f5f1e8]">
                        {msg.content ? (
                          <>
                            {renderFormattedContent(msg.content, msg)}
                            {isProcessing && idx === messages.length - 1 && (
                              <span className="inline-block w-1.5 h-4 bg-[#de8535] animate-pulse ml-1 align-middle rounded-sm shadow-sm" />
                            )}
                          </>
                        ) : isProcessing && idx === messages.length - 1 ? (
                          <div className="flex items-center gap-2 py-1 text-xs text-[#b8b2a4] font-mono">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#de8535] animate-ping" />
                            <span>Synthesizing response...</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Execution Steps */}
                      {msg.steps && msg.steps.length > 0 && (
                        <div className="pt-2">
                          <button
                            onClick={() => toggleSteps(msg.id)}
                            className="flex items-center gap-1.5 text-xs text-[#7d776b] hover:text-[#b8b2a4] transition cursor-pointer font-medium font-mono"
                          >
                            {expandedSteps[msg.id] ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                            <span>{msg.steps.length} execution trace steps</span>
                          </button>

                          {expandedSteps[msg.id] && (
                            <div className="mt-2 pl-3 border-l border-[#2e3430] space-y-1 text-xs text-[#b8b2a4] font-mono">
                              {msg.steps.map((st, sidx) => (
                                <div key={sidx} className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-[#4b9b74] shrink-0" />
                                  <span>{st}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Deliverables Download */}
                      {msg.deliverables && Object.keys(msg.deliverables).length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-2">
                          {msg.deliverables.docx && (
                            <a
                              href={`http://127.0.0.1:8000/api/deliverables/${msg.deliverables.docx.split("/").pop()}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d1b] hover:bg-[#222624] border border-[#2e3430] hover:border-[#3d6a8a] text-xs text-[#f5f1e8] transition shadow-sm"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#3d6a8a]" />
                              <span>Approval Note (.docx)</span>
                              <Download className="w-3 h-3 text-[#7d776b] ml-1" />
                            </a>
                          )}
                          {msg.deliverables.xlsx && (
                            <a
                              href={`http://127.0.0.1:8000/api/deliverables/${msg.deliverables.xlsx.split("/").pop()}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d1b] hover:bg-[#222624] border border-[#2e3430] hover:border-[#4b9b74] text-xs text-[#f5f1e8] transition shadow-sm"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 text-[#4b9b74]" />
                              <span>Calculations (.xlsx)</span>
                              <Download className="w-3 h-3 text-[#7d776b] ml-1" />
                            </a>
                          )}
                          {msg.deliverables.pptx && (
                            <a
                              href={`http://127.0.0.1:8000/api/deliverables/${msg.deliverables.pptx.split("/").pop()}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1d1b] hover:bg-[#222624] border border-[#2e3430] hover:border-[#de8535] text-xs text-[#f5f1e8] transition shadow-sm"
                            >
                              <Presentation className="w-3.5 h-3.5 text-[#de8535]" />
                              <span>Slide Deck (.pptx)</span>
                              <Download className="w-3 h-3 text-[#7d776b] ml-1" />
                            </a>
                          )}
                        </div>
                      )}

                      {/* Optional Deliverables Export Strip */}
                      <div className="pt-2.5 border-t border-[#242826] flex items-center justify-between text-[11px] text-[#7d776b]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] uppercase text-[#615c54]">Export:</span>
                          <button
                            onClick={() => handleExport(msg.id, "docx", msg.content)}
                            disabled={exportingState[`${msg.id}-docx`]}
                            className="hover:text-[#f5f1e8] transition cursor-pointer flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md hover:bg-[#222624] text-[#b8b2a4]"
                            title="Export as PSU Word Approval Note (.docx)"
                          >
                            {exportingState[`${msg.id}-docx`] ? (
                              <Loader2 className="w-3 h-3 animate-spin text-[#de8535]" />
                            ) : (
                              <FileText className="w-3 h-3 text-[#3d6a8a]" />
                            )}
                            <span>.docx</span>
                          </button>

                          <button
                            onClick={() => handleExport(msg.id, "xlsx", msg.content)}
                            disabled={exportingState[`${msg.id}-xlsx`]}
                            className="hover:text-[#f5f1e8] transition cursor-pointer flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md hover:bg-[#222624] text-[#b8b2a4]"
                            title="Export as Verified Calculations Workbook (.xlsx)"
                          >
                            {exportingState[`${msg.id}-xlsx`] ? (
                              <Loader2 className="w-3 h-3 animate-spin text-[#de8535]" />
                            ) : (
                              <FileSpreadsheet className="w-3 h-3 text-[#4b9b74]" />
                            )}
                            <span>.xlsx</span>
                          </button>

                          <button
                            onClick={() => handleExport(msg.id, "pptx", msg.content)}
                            disabled={exportingState[`${msg.id}-pptx`]}
                            className="hover:text-[#f5f1e8] transition cursor-pointer flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md hover:bg-[#222624] text-[#b8b2a4]"
                            title="Export as Briefing Presentation (.pptx)"
                          >
                            {exportingState[`${msg.id}-pptx`] ? (
                              <Loader2 className="w-3 h-3 animate-spin text-[#de8535]" />
                            ) : (
                              <Presentation className="w-3 h-3 text-[#de8535]" />
                            )}
                            <span>.pptx</span>
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-[#4b9b74]/80 hidden sm:inline">100% On-Premise Air-Gapped</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isProcessing && messages.length > 0 && messages[messages.length - 1].role !== "assistant" && (
              <div className="w-full flex gap-3.5">
                <div className="mt-1 shrink-0">
                  <SovereignInsignia size={26} glow={true} />
                </div>
                <div className="flex-1 min-w-0">
                  {renderActiveRouteBanner()}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Docked Input Box when conversation is active */}
      {messages.length > 0 && (
        <div className="p-3.5 bg-[#161817] border-t border-[#2a2f2c] shrink-0">
          <div className="max-w-3xl mx-auto w-full">
            {attachedFile && (
              <div className="mb-2.5 p-2 rounded-xl bg-[#222624] border border-[#383f3b] flex items-center justify-between text-xs text-[#f5f1e8] shadow-sm animate-in fade-in duration-150 w-fit max-w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  {imagePreviewUrl ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[#4a544f] shrink-0 bg-black/40">
                      <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-[#2a2f2c] flex items-center justify-center shrink-0 text-[#de8535]">
                      <Paperclip className="w-4 h-4" />
                    </div>
                  )}
                  <div className="truncate">
                    <div className="font-mono text-xs text-[#f5f1e8] font-medium truncate max-w-[180px] sm:max-w-xs">{attachedFile.name}</div>
                    <div className="text-[10px] text-[#8e897e] flex items-center gap-1.5 mt-0.5">
                      <span>{(attachedFile.size / 1024).toFixed(1)} KB</span>
                      {imagePreviewUrl && <span className="text-[#de8535] font-semibold uppercase tracking-wider text-[9px]">• Image Clip</span>}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="p-1.5 ml-2 hover:text-[#e05244] hover:bg-[#2e3430] rounded-lg transition text-[#8e897e] cursor-pointer"
                  title="Remove clip"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="bg-[#1a1d1b] border border-[#2e3430] focus-within:border-[#de8535]/60 rounded-2xl p-3 shadow-md transition flex flex-col tactile-chamfer">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Enter engineering instructions or paste clipboard image (Cmd+V)..."
                className="w-full bg-transparent text-sm text-[#f5f1e8] placeholder-[#7d776b] focus:outline-none resize-none min-h-[44px] px-1 leading-relaxed font-sans"
                rows={1}
                disabled={isProcessing}
              />

              <div className="flex items-center justify-between pt-2 border-t border-[#242826] mt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-[#b8b2a4] hover:text-[#f5f1e8] rounded-lg hover:bg-[#222624] transition cursor-pointer"
                    title="Attach file"
                  >
                    <Paperclip className="w-4 h-4 text-[#de8535]" />
                  </button>

                  <span className="text-[10px] font-mono text-[#7d776b] px-2 py-0.5 rounded-md bg-[#131514] border border-[#2e3430] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4b9b74]"></span>
                    <span className="text-[#b8b2a4]">{selectedModel === "auto" || !selectedModel ? "Auto-Router" : selectedModel}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isProcessing ? (
                    <button
                      type="button"
                      onClick={onStopGeneration}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer animate-pulse"
                      title="Stop generation immediately (Esc)"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!inputPrompt.trim() && !attachedFile}
                      className="px-3 py-1.5 rounded-xl bg-[#de8535] hover:bg-[#eb9242] active:scale-95 disabled:opacity-25 text-white font-medium text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                    >
                      <span>Dispatch</span>
                      <Send className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.bmp,.webp,.docx,.xlsx,.csv,.txt"
      />
    </div>
  );
};
