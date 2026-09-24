"use client";

import React, { useMemo } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Edge, 
  Node, 
  MarkerType 
} from "@xyflow/react";
import { CustomNode } from "./CustomNode";

interface AgentCanvasProps {
  nodeStatuses: Record<string, "PENDING" | "RUNNING" | "COMPLETED" | "FAILED">;
}

const nodeTypes = {
  custom: CustomNode,
};

export const AgentCanvas: React.FC<AgentCanvasProps> = ({ nodeStatuses }) => {
  // Construct dynamic nodes
  const nodes: Node[] = useMemo(() => [
    {
      id: "supervisor",
      type: "custom",
      position: { x: 30, y: 110 },
      data: {
        label: "Supervisor Node",
        role: "Intent parsing & task decomposition",
        model: "Llama-3.1-8B",
        status: nodeStatuses.supervisor || "PENDING",
        stepNumber: 1
      },
    },
    {
      id: "vision",
      type: "custom",
      position: { x: 330, y: 20 },
      data: {
        label: "Vision Specialist",
        role: "Document OCR & Certificate Digitization",
        model: "Qwen2.5-VL-7B",
        status: nodeStatuses.vision || "PENDING",
        stepNumber: 2
      },
    },
    {
      id: "rag",
      type: "custom",
      position: { x: 330, y: 220 },
      data: {
        label: "Sovereign RAG",
        role: "NAAC / UGC / WASC Standards Retrieval",
        model: "bge-m3 (Local)",
        status: nodeStatuses.rag || "PENDING",
        stepNumber: 3
      },
    },
    {
      id: "compiler",
      type: "custom",
      position: { x: 640, y: 110 },
      data: {
        label: "Dossier Compiler",
        role: "Accreditation dossier compilation",
        model: "DeepSeek-R1-8B",
        status: nodeStatuses.compiler || "PENDING",
        stepNumber: 4
      },
    },
    {
      id: "compiler",
      type: "custom",
      position: { x: 950, y: 110 },
      data: {
        label: "Industrial Compiler",
        role: "Compiles Word, PPT & Excel deliverables",
        model: "python-docx / pptx",
        status: nodeStatuses.compiler || "PENDING",
        stepNumber: 5
      },
    },
  ], [nodeStatuses]);

  // Construct edges with animated state
  const edges: Edge[] = useMemo(() => [
    {
      id: "e-sup-vis",
      source: "supervisor",
      target: "vision",
      animated: nodeStatuses.vision === "RUNNING",
      style: { stroke: nodeStatuses.vision === "COMPLETED" ? "#10B981" : "#38BDF8", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: nodeStatuses.vision === "COMPLETED" ? "#10B981" : "#38BDF8" }
    },
    {
      id: "e-sup-rag",
      source: "supervisor",
      target: "rag",
      animated: nodeStatuses.rag === "RUNNING",
      style: { stroke: nodeStatuses.rag === "COMPLETED" ? "#10B981" : "#38BDF8", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: nodeStatuses.rag === "COMPLETED" ? "#10B981" : "#38BDF8" }
    },
    {
      id: "e-vis-aud",
      source: "vision",
      target: "auditor",
      animated: nodeStatuses.auditor === "RUNNING",
      style: { stroke: nodeStatuses.auditor === "COMPLETED" ? "#10B981" : "#38BDF8", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: nodeStatuses.auditor === "COMPLETED" ? "#10B981" : "#38BDF8" }
    },
    {
      id: "e-rag-aud",
      source: "rag",
      target: "auditor",
      animated: nodeStatuses.auditor === "RUNNING",
      style: { stroke: nodeStatuses.auditor === "COMPLETED" ? "#10B981" : "#38BDF8", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: nodeStatuses.auditor === "COMPLETED" ? "#10B981" : "#38BDF8" }
    },
    {
      id: "e-aud-comp",
      source: "auditor",
      target: "compiler",
      animated: nodeStatuses.compiler === "RUNNING",
      style: { stroke: nodeStatuses.compiler === "COMPLETED" ? "#10B981" : "#38BDF8", strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: nodeStatuses.compiler === "COMPLETED" ? "#10B981" : "#38BDF8" }
    },
  ], [nodeStatuses]);

  return (
    <div className="w-full h-[400px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E293B" gap={20} size={1} />
        <Controls className="bg-slate-900 border border-slate-800 text-white fill-white rounded-xl overflow-hidden" />
      </ReactFlow>

      {/* Floating Canvas Header */}
      <div className="absolute top-3 left-4 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
        <span className="font-mono text-slate-300 font-semibold">LangGraph State-Machine Topology</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">Dynamic Multi-Model Routing</span>
      </div>
    </div>
  );
};
