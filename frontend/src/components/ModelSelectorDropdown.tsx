"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ChevronDown, 
  Cpu, 
  Check, 
  Sparkles, 
  Eye, 
  Brain, 
  Layers, 
  ShieldCheck,
  RefreshCw
} from "lucide-react";

export interface AvailableModel {
  id: string;
  name: string;
  tag?: string;
  size?: string;
  device?: string;
  role?: string;
  is_vision?: boolean;
  is_reasoning?: boolean;
}

interface ModelSelectorDropdownProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

const DEFAULT_MODELS: AvailableModel[] = [
  {
    id: "auto",
    name: "⚡ Auto-Router (Council)",
    role: "Autonomous Task & File Routing",
    device: "Dynamic Hybrid",
    tag: "auto",
    is_vision: true,
    is_reasoning: true
  },
  {
    id: "llama3.1:8b",
    name: "🦙 Llama-3.1 8B (4.9 GB)",
    role: "Fast Orchestrator & Administrative Dossiers",
    device: "Apple Silicon (Metal GPU)",
    tag: "llama3.1:8b"
  },
  {
    id: "deepseek-r1:8b",
    name: "🧠 DeepSeek-R1 8B (4.9 GB)",
    role: "Reasoning & Accreditation Audit",
    device: "Apple Silicon (Metal GPU)",
    tag: "deepseek-r1:8b",
    is_reasoning: true
  },
  {
    id: "qwen2.5vl:7b",
    name: "👁️ Qwen2.5-VL 7B (6.0 GB)",
    role: "Vision OCR & Academic Document Analysis",
    device: "Apple Silicon (Metal GPU)",
    tag: "qwen2.5vl:7b",
    is_vision: true
  }
];

export const ModelSelectorDropdown: React.FC<ModelSelectorDropdownProps> = ({
  selectedModel,
  onSelectModel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<AvailableModel[]>(DEFAULT_MODELS);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch real-time available models from backend
  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/models");
      if (res.ok) {
        const data = await res.json();
        if (data.available_models && Array.isArray(data.available_models) && data.available_models.length > 0) {
          setModels(data.available_models);
        }
      }
    } catch (e) {
      console.warn("Could not fetch models dynamically", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Current selected item
  const currentModel = models.find(m => m.id === selectedModel) || 
                       models.find(m => m.tag === selectedModel) || 
                       models[0];

  const isAuto = currentModel.id === "auto";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a1d1b] hover:bg-[#222624] border border-[#2e3430] hover:border-[#de8535]/60 transition-all cursor-pointer shadow-sm text-xs font-medium text-[#f5f1e8] group"
        title="Hot-swap active open-weight model for this chat session"
      >
        <span className="w-2 h-2 rounded-full bg-[#4b9b74] animate-pulse"></span>
        
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-[#de8535] font-semibold text-[11px] truncate max-w-[120px] sm:max-w-[150px]">
            {isAuto ? "Auto-Router" : currentModel.name.replace(/^[^\w\s]+/, "").trim()}
          </span>
          {!isAuto && (
            <span className="text-[10px] text-[#7d776b] hidden xl:inline">
              (Metal GPU)
            </span>
          )}
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-[#7d776b] group-hover:text-[#f5f1e8] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-72 sm:w-80 rounded-2xl bg-[#161817]/95 backdrop-blur-xl border border-[#2e3430] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 tactile-chamfer">
          {/* Header */}
          <div className="px-3 py-2 border-b border-[#242826] flex items-center justify-between text-xs">
            <div>
              <span className="font-mono font-bold uppercase tracking-wider text-[10px] text-[#7d776b] block">
                Session Model Router
              </span>
              <span className="text-[11px] text-[#b8b2a4]">
                Hot-swap model for this chat
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchModels();
              }}
              className="p-1 text-[#7d776b] hover:text-[#f5f1e8] hover:bg-[#222624] rounded-lg transition"
              title="Refresh installed models"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#de8535]" : ""}`} />
            </button>
          </div>

          {/* Model Options List */}
          <div className="py-1 space-y-1 max-h-72 overflow-y-auto">
            {models.map((m) => {
              const isSelected = m.id === selectedModel || (selectedModel === "" && m.id === "auto");
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id);
                    setIsOpen(false);
                  }}
                  className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? "bg-[#222624] border border-[#383e3a] text-[#f5f1e8]"
                      : "hover:bg-[#1c201e] text-[#b8b2a4] hover:text-[#f5f1e8]"
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs font-mono text-[#f5f1e8] truncate">
                        {m.name}
                      </span>
                      {m.id === "auto" && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#de8535]/15 text-[#de8535] border border-[#de8535]/30 font-mono font-bold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#7d776b] mt-0.5 truncate">
                      {m.role || m.device}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-[#4b9b74] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-1 pt-2 border-t border-[#242826] px-3 py-1 bg-[#121413]/60 rounded-xl text-[10px] text-[#7d776b] flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#3d6a8a] shrink-0" />
            <span>Image uploads automatically delegate to <strong>Qwen2.5-VL</strong>.</span>
          </div>
        </div>
      )}
    </div>
  );
};
