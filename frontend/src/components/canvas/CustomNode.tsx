"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { 
  Bot, 
  Eye, 
  BookOpen, 
  Scale, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  AlertCircle 
} from "lucide-react";

interface CustomNodeData {
  label: string;
  role: string;
  model: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  stepNumber: number;
}

const ICONS: Record<string, any> = {
  supervisor: Bot,
  vision: Eye,
  rag: BookOpen,
  auditor: Scale,
  compiler: FileCheck
};

export const CustomNode = ({ data, id }: { data: CustomNodeData; id: string }) => {
  const IconComponent = ICONS[id] || Bot;
  const status = data.status || "PENDING";

  let statusBorder = "border-slate-800";
  let statusBadgeBg = "bg-slate-800/80 text-slate-400";
  let isRunning = status === "RUNNING";

  if (status === "RUNNING") {
    statusBorder = "border-amber-500 shadow-lg shadow-amber-500/20";
    statusBadgeBg = "bg-amber-500/20 text-amber-300 border border-amber-500/40";
  } else if (status === "COMPLETED") {
    statusBorder = "border-emerald-500/80 shadow-md shadow-emerald-500/10";
    statusBadgeBg = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
  } else if (status === "FAILED") {
    statusBorder = "border-rose-500";
    statusBadgeBg = "bg-rose-500/20 text-rose-300";
  }

  return (
    <div
      className={`w-64 rounded-2xl bg-slate-900/90 backdrop-blur-md border ${statusBorder} p-4 transition-all duration-300 select-none ${
        isRunning ? "node-running" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-sky-400 border-2 border-slate-900" />
      
      {/* Node Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${
            isRunning ? "bg-amber-500/20 text-amber-400" :
            status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400" :
            "bg-slate-800 text-slate-400"
          }`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Step 0{data.stepNumber}
            </span>
            <h4 className="text-sm font-bold text-white leading-none">{data.label}</h4>
          </div>
        </div>

        {/* Status Indicator */}
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${statusBadgeBg}`}>
          {isRunning && <Loader2 className="w-3 h-3 animate-spin" />}
          {status === "COMPLETED" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          {status === "PENDING" && <Clock className="w-3 h-3 text-slate-500" />}
          {status === "FAILED" && <AlertCircle className="w-3 h-3 text-rose-400" />}
          <span>{status}</span>
        </div>
      </div>

      {/* Role & Model Tags */}
      <div className="space-y-1 mt-2 pt-2 border-t border-slate-800/80 text-xs">
        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{data.role}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400">Target Model:</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800">
            {data.model}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-sky-400 border-2 border-slate-900" />
    </div>
  );
};
