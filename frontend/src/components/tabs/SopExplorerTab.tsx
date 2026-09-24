"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Search, Upload, FileText, CheckCircle2, ShieldAlert } from "lucide-react";

export const SopExplorerTab: React.FC = () => {
  const [query, setQuery] = useState("faculty guidelines code of conduct");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/sops/search?query=${encodeURIComponent(query)}&n_results=4`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("standard_name", file.name.replace(".pdf", ""));

    setUploadStatus("Indexing PDF into on-premise vector store...");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/sops/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(`Indexed ${data.chunks_indexed} chunks successfully with zero cloud egress!`);
      handleSearch();
    } catch (err) {
      setUploadStatus("Failed to upload manual.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-sky-400" />
            Compliance Knowledge Vault
          </h2>
          <p className="text-xs text-slate-400">
            Semantic vector search over UGC guidelines, AICTE manuals, and university ordinances.
          </p>
        </div>

        <div>
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl cursor-pointer transition border border-slate-700">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            Upload New PDF Document
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          </label>
          {uploadStatus && <span className="text-[10px] text-emerald-400 block mt-1 font-mono">{uploadStatus}</span>}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search internal knowledge base (e.g., policies, faculty guidelines, approvals)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
        >
          {loading ? "Searching..." : "Vector Search"}
        </button>
      </div>

      {/* Retrieved Standards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((item, idx) => (
          <div
            key={idx}
            className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-400 font-mono flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  {item.standard}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                  {item.section}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {item.content}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
              <span>Sovereignty: <strong className="text-emerald-400">100% On-Premise Vector DB</strong></span>
              {item.relevance_score && (
                <span>Relevance: <strong className="text-sky-400">{(item.relevance_score * 100).toFixed(1)}%</strong></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
