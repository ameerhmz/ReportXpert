"use client";

import React from "react";
import { FileText, Presentation, FileSpreadsheet, Download, CheckCircle2, ExternalLink } from "lucide-react";

interface DeliverableCardProps {
  deliverables: Record<string, string>;
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({ deliverables }) => {
  if (!deliverables || Object.keys(deliverables).length === 0) {
    return (
      <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center bg-slate-950/40">
        <p className="text-xs text-slate-400">No deliverables generated yet. Run the audit workflow to compile official documents.</p>
      </div>
    );
  }

  const items = [
    {
      key: "docx",
      title: "Official Executive Approval Note",
      type: "Microsoft Word Document (.docx)",
      icon: FileText,
      color: "from-blue-600 to-indigo-700",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      description: "Statutory PSU safety audit note with equipment tables & GM sign-off block."
    },
    {
      key: "pptx",
      title: "Board Briefing Slide Deck",
      type: "PowerPoint Presentation (.pptx)",
      icon: Presentation,
      color: "from-amber-600 to-orange-700",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      description: "16:9 widescreen executive summary presentation for technical directorate."
    },
    {
      key: "xlsx",
      title: "Accreditation Metric Worksheet",
      type: "Excel Workbook (.xlsx)",
      icon: FileSpreadsheet,
      color: "from-emerald-600 to-teal-700",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      description: "Institutional compliance and quantitative metrics matrix with live verification formulas."
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Compiled Institutional & Accreditation Deliverables
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Ready for Statutory Sign-Off
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((item) => {
          const filePath = deliverables[item.key];
          if (!filePath) return null;
          const fileName = filePath.split("/").pop() || `${item.key}_deliverable`;
          const downloadUrl = `http://127.0.0.1:8000/api/deliverables/${fileName}`;

          const IconComp = item.icon;

          return (
            <div
              key={item.key}
              className={`p-4 bg-slate-900/90 border ${item.borderColor} rounded-2xl flex flex-col justify-between hover:border-slate-700 transition shadow-lg group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {item.key.toUpperCase()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  {item.title}
                </h4>
                <span className={`text-[11px] font-semibold ${item.textColor} block mb-2`}>
                  {item.type}
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <a
                href={downloadUrl}
                download
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition duration-200 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Download Deliverable
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
