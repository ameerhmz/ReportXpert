"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  BookOpen, 
  Search, 
  Upload, 
  FileText, 
  Sparkles, 
  Loader2, 
  CheckCircle2,
  Database,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  X,
  Check,
  ShieldCheck,
  Layers,
  ArrowRight,
  Filter,
  Square
} from "lucide-react";

interface KnowledgeDoc {
  id: string;
  doc_type?: string;
  standard: string;
  section: string;
  content: string;
  char_count: number;
  word_count: number;
  has_embedding: boolean;
}

interface SearchChunk {
  standard: string;
  section: string;
  content: string;
  relevance_score: number;
}

export const VectorSearchRAGView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"inventory" | "search">("inventory");
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  
  // Vector search state
  const [searchQuery, setSearchQuery] = useState("NAAC Criterion 3 research publication guidelines");
  const [chunks, setChunks] = useState<SearchChunk[]>([]);
  const [aiAnswer, setAiAnswer] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  
  // Notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [modalStandard, setModalStandard] = useState("");
  const [modalSection, setModalSection] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Fetch all documents
  const loadDocuments = async (query?: string) => {
    setIsLoadingDocs(true);
    try {
      const url = query 
        ? `http://127.0.0.1:8000/api/knowledge/documents?search=${encodeURIComponent(query)}`
        : "http://127.0.0.1:8000/api/knowledge/documents";
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to load documents", err);
      showNotification("Could not connect to knowledge base backend", "error");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Filter documents by local search & category
  const filteredDocs = documents.filter(doc => {
    if (categoryFilter !== "ALL") {
      const dType = doc.doc_type || "standard";
      if (dType !== categoryFilter) return false;
    }
    if (!docSearchQuery.trim()) return true;
    const q = docSearchQuery.toLowerCase();
    return (
      doc.standard.toLowerCase().includes(q) ||
      doc.section.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q)
    );
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingDocId(null);
    setModalStandard("");
    setModalSection("");
    setModalContent("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (doc: KnowledgeDoc) => {
    setEditingDocId(doc.id);
    setModalStandard(doc.standard);
    setModalSection(doc.section);
    setModalContent(doc.content);
    setIsModalOpen(true);
  };

  // Save Document (Create or Update)
  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalStandard.trim() || !modalSection.trim() || !modalContent.trim()) {
      showNotification("Please fill in all fields (Standard, Section, and Content)", "error");
      return;
    }

    setIsSaving(true);
    try {
      if (editingDocId) {
        // Update (PUT)
        const res = await fetch(`http://127.0.0.1:8000/api/knowledge/documents/${editingDocId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            standard: modalStandard,
            section: modalSection,
            content: modalContent
          })
        });
        if (!res.ok) throw new Error("Failed to update document");
        showNotification(`Updated "${modalStandard} - ${modalSection}" and re-indexed vector embeddings`);
      } else {
        // Create (POST)
        const res = await fetch("http://127.0.0.1:8000/api/knowledge/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            standard: modalStandard,
            section: modalSection,
            content: modalContent
          })
        });
        if (!res.ok) throw new Error("Failed to create document");
        showNotification(`Added new document "${modalStandard}" to knowledge base`);
      }
      setIsModalOpen(false);
      loadDocuments();
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || "Failed to save document", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Document (DELETE)
  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/knowledge/documents/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete document");
      showNotification("Document deleted successfully");
      setDeletingDocId(null);
      loadDocuments();
    } catch (err: any) {
      console.error(err);
      showNotification("Failed to delete document", "error");
    }
  };

  // Reset to default foundational standards
  const handleResetDefaults = async () => {
    if (!window.confirm("Are you sure you want to reset the knowledge base to the default foundational standards? Any custom documents will be replaced.")) {
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/api/knowledge/reset", {
        method: "POST"
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      }
      showNotification("Restored 4 foundational organizational & safety standards");
    } catch (err) {
      showNotification("Failed to reset knowledge base", "error");
    }
  };

  // PDF Upload Handshake
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("standard_name", file.name.replace(/\.[^/.]+$/, ""));

    showNotification(`Uploading & indexing "${file.name}" offline with BGE-M3...`, "info");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/sops/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      showNotification(`Indexed ${data.chunks_indexed} chunks from "${file.name}" with 0 cloud egress!`, "success");
      loadDocuments();
    } catch (err) {
      showNotification("Failed to upload manual", "error");
    }
  };

  // Vector Search Test Execution
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopSearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSearching(false);
    setIsAnswering(false);
    setAiAnswer(prev => prev || "🛑 *Synthesis stopped by user.*");
    try {
      fetch("http://127.0.0.1:8000/api/chat/stop", { method: "POST" }).catch(() => {});
    } catch (e) {}
  };

  const handleVectorSearch = async (queryToUse?: string) => {
    const q = queryToUse !== undefined ? queryToUse : searchQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    setChunks([]);
    setAiAnswer("");

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // 1. Search vector similarity
      const res = await fetch(`http://127.0.0.1:8000/api/sops/search?query=${encodeURIComponent(q)}&n_results=3`, {
        signal: controller.signal
      });
      const data = await res.json();
      setChunks(data);

      // 2. Synthesize with local Llama 3.1
      setIsAnswering(true);
      const chatRes = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        body: new URLSearchParams({
          message: `Explain the statutory requirements for: "${q}" based on organizational standards.`
        }),
        signal: controller.signal
      });
      const chatData = await chatRes.json();
      setAiAnswer(chatData.response || "");
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        return;
      }
      console.error(err);
      showNotification("Search error occurred", "error");
    } finally {
      abortControllerRef.current = null;
      setIsSearching(false);
      setIsAnswering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 tactile-chamfer">
        <div>
          <h2 className="text-base font-bold text-[#f5f1e8] flex items-center gap-2 mb-1 font-sans">
            <Database className="w-5 h-5 text-[#de8535]" />
            Sovereign Knowledge Base & Compliance RAG
          </h2>
          <p className="text-xs text-[#b8b2a4] max-w-2xl leading-relaxed">
            100% on-premise vector database. Store, manage, and retrieve internal organizational SOPs, statutory safety codes, commercial contracts, and tender specs with zero cloud egress.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#de8535] hover:bg-[#eb9242] text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Document</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 bg-[#222624] hover:bg-[#282d2a] text-xs font-semibold text-[#f5f1e8] rounded-xl cursor-pointer transition border border-[#2e3430]">
            <Upload className="w-3.5 h-3.5 text-[#3d6a8a]" />
            <span>Upload PDF</span>
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-2.5 py-2 bg-[#131514] hover:bg-[#222624] text-[#b8b2a4] hover:text-[#f5f1e8] text-xs rounded-xl transition cursor-pointer border border-[#2e3430]"
            title="Reset to default foundational standards"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between transition ${
          notification.type === "success" 
            ? "bg-[#14231b] border-[#4b9b74]/40 text-[#4b9b74]" 
            : notification.type === "error"
            ? "bg-[#281715] border-[#c9523c]/40 text-[#c9523c]"
            : "bg-[#162028] border-[#3d6a8a]/40 text-[#3d6a8a]"
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Tabs: Document Inventory (CRUD) vs. Semantic Search Test */}
      <div className="flex items-center gap-2 border-b border-[#2e3430] pb-2">
        <button
          onClick={() => setActiveSubTab("inventory")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSubTab === "inventory"
              ? "bg-[#222624] text-[#f5f1e8] border border-[#383e3a] shadow-sm"
              : "text-[#7d776b] hover:text-[#f5f1e8] hover:bg-[#1a1d1b]"
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#de8535]" />
          <span>Documents & Clauses ({documents.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab("search");
            if (chunks.length === 0) handleVectorSearch();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSubTab === "search"
              ? "bg-[#222624] text-[#f5f1e8] border border-[#383e3a] shadow-sm"
              : "text-[#7d776b] hover:text-[#f5f1e8] hover:bg-[#1a1d1b]"
          }`}
        >
          <Search className="w-4 h-4 text-[#3d6a8a]" />
          <span>Test Vector Search & AI</span>
        </button>
      </div>

      {/* SUB-TAB 1: DOCUMENT INVENTORY (FULL CRUD) */}
      {activeSubTab === "inventory" && (
        <div className="space-y-4">
          {/* Filter / Search Bar */}
          <div className="p-3 bg-[#1a1d1b] border border-[#2e3430] rounded-xl flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7d776b] absolute left-3 top-2.5" />
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Filter documents by standard, clause title, or text..."
                className="w-full bg-[#131514] border border-[#2e3430] focus:border-[#de8535] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#f5f1e8] placeholder-[#7d776b] focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-[#7d776b] font-mono shrink-0">
              Showing {filteredDocs.length} of {documents.length}
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono text-[#7d776b] mr-1 shrink-0">Filter Category:</span>
            {[
              { id: "ALL", label: "All Items" },
              { id: "standard", label: "Statutory Standards" },
              { id: "faculty_profile", label: "Faculty Profiles" },
              { id: "student_profile", label: "Student Records" },
              { id: "research_publication", label: "Research & Scopus" },
              { id: "campus_event", label: "Campus Events" },
            ].map(cat => {
              const count = cat.id === "ALL" 
                ? documents.length 
                : documents.filter(d => (d.doc_type || "standard") === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    categoryFilter === cat.id
                      ? "bg-[#de8535] text-white font-bold shadow-sm"
                      : "bg-[#1a1d1b] border border-[#2e3430] text-[#7d776b] hover:text-[#f5f1e8]"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${categoryFilter === cat.id ? "bg-black/25 text-white" : "bg-[#222624] text-[#b8b2a4]"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Document Cards Grid */}
          {isLoadingDocs ? (
            <div className="py-16 text-center text-[#7d776b] flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#de8535]" />
              <span className="text-xs">Loading on-premise knowledge documents...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-8 text-center bg-[#1a1d1b] border border-[#2e3430] rounded-2xl space-y-3">
              <BookOpen className="w-8 h-8 text-[#7d776b] mx-auto opacity-50" />
              <div className="text-xs text-[#b8b2a4]">No documents found matching your filter.</div>
              <button
                onClick={handleOpenCreateModal}
                className="px-3 py-1.5 bg-[#de8535] text-white text-xs font-semibold rounded-lg"
              >
                + Add First Document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocs.map((doc, idx) => {
                // Determine badge style
                const stdLower = doc.standard.toLowerCase();
                const badgeColor = stdLower.includes("naac") 
                  ? "bg-[#4b9b74]/15 text-[#4b9b74] border-[#4b9b74]/30"
                  : stdLower.includes("ugc")
                  ? "bg-[#de8535]/15 text-[#de8535] border-[#de8535]/30"
                  : (stdLower.includes("nirf") || stdLower.includes("wasc"))
                  ? "bg-[#3d6a8a]/15 text-[#3d6a8a] border-[#3d6a8a]/30"
                  : (stdLower.includes("qaa") || stdLower.includes("mdra") || stdLower.includes("hansa"))
                  ? "bg-[#c9523c]/15 text-[#c9523c] border-[#c9523c]/30"
                  : "bg-[#7d776b]/15 text-[#b8b2a4] border-[#7d776b]/30";

                return (
                  <div
                    key={`${doc.id || "doc"}-${idx}`}
                    className="p-4 rounded-xl bg-[#1a1d1b] border border-[#2e3430] hover:border-[#383e3a] transition flex flex-col justify-between space-y-3 tactile-chamfer"
                  >
                    <div>
                      {/* Top Badges & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${badgeColor}`}>
                              {doc.standard}
                            </span>
                            {doc.doc_type && (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#222624] text-[#8e897e] border border-[#2e3430]">
                                {doc.doc_type.replace("_", " ")}
                              </span>
                            )}
                          </div>
                          <h3 className="text-xs font-bold text-[#f5f1e8] font-sans">
                            {doc.section}
                          </h3>
                        </div>

                        {/* Edit & Delete Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditModal(doc)}
                            className="p-1.5 text-[#7d776b] hover:text-[#f5f1e8] hover:bg-[#222624] rounded-lg transition"
                            title="Edit clause"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {deletingDocId === doc.id ? (
                            <div className="flex items-center gap-1 bg-[#281715] p-1 rounded-lg border border-[#c9523c]/40">
                              <span className="text-[10px] text-[#c9523c]">Delete?</span>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-1 bg-[#c9523c] text-white rounded text-[10px] font-bold"
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>
                              <button
                                onClick={() => setDeletingDocId(null)}
                                className="p-1 text-[#b8b2a4] hover:text-white"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingDocId(doc.id)}
                              className="p-1.5 text-[#7d776b] hover:text-[#c9523c] hover:bg-[#222624] rounded-lg transition"
                              title="Delete clause"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content Preview */}
                      <p className="text-xs text-[#b8b2a4] leading-relaxed font-sans line-clamp-4">
                        {doc.content}
                      </p>
                    </div>

                    {/* Footer Stats */}
                    <div className="pt-2.5 border-t border-[#262a28] flex items-center justify-between text-[10px] text-[#7d776b] font-mono">
                      <span>{doc.word_count} words • {doc.char_count} chars</span>
                      <span className="flex items-center gap-1 text-[#4b9b74]">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Indexed (BGE-M3)</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: TEST VECTOR SEARCH & AI SYNTHESIS */}
      {activeSubTab === "search" && (
        <div className="flex flex-col h-[650px] bg-[#1a1d1b] border border-[#2e3430] rounded-2xl overflow-hidden shadow-xl tactile-chamfer">
          {/* Search Input Bar */}
          <div className="p-4 border-b border-[#2e3430] bg-[#131514]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVectorSearch();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#7d776b] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter a natural language search query across stored standards..."
                  className="w-full bg-[#1a1d1b] border border-[#2e3430] focus:border-[#3d6a8a] rounded-xl pl-10 pr-4 py-2 text-xs text-[#f5f1e8] placeholder-[#7d776b] focus:outline-none transition font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#3d6a8a] hover:bg-[#4a7e9e] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Run Vector Query</span>
              </button>

              {(isSearching || isAnswering) && (
                <button
                  type="button"
                  onClick={handleStopSearch}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer animate-pulse active:scale-95"
                  title="Stop generation immediately"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              )}
            </form>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[
                "NAAC Criterion 3 research publication guidelines",
                "UGC Academic Performance Indicators (API) formula",
                "NIRF Research and Professional Practice (RPC) metrics",
                "WASC Standard 2 faculty scholarship and student research"
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchQuery(prompt);
                    handleVectorSearch(prompt);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#222624] hover:bg-[#282d2a] border border-[#2e3430] text-[11px] text-[#b8b2a4] hover:text-[#f5f1e8] transition cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Split Content: Retrieved Chunks on Left, AI Synthesized Answer on Right */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            {/* Left: Retrieved Chunks */}
            <div className="flex flex-col border-r border-[#2e3430] bg-[#161817] overflow-y-auto p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#262a28]">
                <span className="text-xs font-bold text-[#f5f1e8] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#3d6a8a]" />
                  Retrieved Relevant Clauses ({chunks.length})
                </span>
                <span className="text-[10px] text-[#7d776b] font-mono">BGE-M3 Cosine Similarity</span>
              </div>

              {chunks.length === 0 ? (
                <div className="text-center py-12 text-[#7d776b] text-xs font-sans">
                  No matching clauses retrieved. Enter a query above to test similarity.
                </div>
              ) : (
                chunks.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#1a1d1b] border border-[#2e3430] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#3d6a8a] font-mono flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#3d6a8a]" />
                        {item.standard}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131514] text-[#b8b2a4] border border-[#262a28]">
                        {item.section}
                      </span>
                    </div>
                    <p className="text-xs text-[#b8b2a4] leading-relaxed font-sans">
                      {item.content}
                    </p>
                    {item.relevance_score !== undefined && (
                      <div className="pt-1.5 border-t border-[#262a28] flex items-center justify-between text-[10px] text-[#7d776b]">
                        <span>Embedding: BGE-M3 (Offline)</span>
                        <span className="text-[#4b9b74] font-semibold font-mono">
                          Score: {(item.relevance_score * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Right: AI Synthesized Answer */}
            <div className="flex flex-col bg-[#131514] overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#262a28]">
                <span className="text-xs font-bold text-[#f5f1e8] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#de8535]" />
                  Grounded AI Answer (Local Llama 3.1)
                </span>
                <span className="text-[10px] text-[#4b9b74] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4b9b74]"></span>
                  Zero Cloud Egress
                </span>
              </div>

              <div className="flex-1 text-xs text-[#b8b2a4] leading-relaxed whitespace-pre-wrap font-sans">
                {isAnswering ? (
                  <div className="flex items-center justify-between py-6">
                    <div className="flex items-center gap-2 text-[#7d776b]">
                      <Loader2 className="w-4 h-4 text-[#de8535] animate-spin" />
                      <span>Synthesizing verified regulatory answer using retrieved clauses...</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleStopSearch}
                      className="px-2.5 py-1 text-xs font-medium text-red-400 hover:text-white bg-red-500/15 hover:bg-red-600 rounded-lg border border-red-500/30 transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                      title="Stop synthesis immediately"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Stop</span>
                    </button>
                  </div>
                ) : aiAnswer ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-[#1a1d1b] border border-[#2e3430] text-xs text-[#f5f1e8] leading-relaxed shadow-sm">
                      {aiAnswer}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#4b9b74] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Answer strictly grounded in on-premise knowledge base clauses.</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[#7d776b]">
                    Search a query to see retrieved text chunks and the grounded AI answer.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#1a1d1b] border border-[#383e3a] rounded-2xl shadow-2xl p-6 space-y-4 tactile-chamfer relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#2e3430]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#de8535]/15 text-[#de8535] border border-[#de8535]/30">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#f5f1e8] font-sans">
                  {editingDocId ? "Edit Knowledge Document / Clause" : "Add New Document to Knowledge Base"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#7d776b] hover:text-[#f5f1e8] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-[#b8b2a4] block mb-1">
                  Document / Standard Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., standard operating procedures, guidelines, internal specs"
                  value={modalStandard}
                  onChange={(e) => setModalStandard(e.target.value)}
                  className="w-full bg-[#131514] border border-[#2e3430] focus:border-[#de8535] rounded-xl px-3 py-2 text-xs text-[#f5f1e8] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#b8b2a4] block mb-1">
                  Section / Clause Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Clause 6.2 (Isolation), Section 8.4, Article 12.1 (Liquidated Damages)"
                  value={modalSection}
                  onChange={(e) => setModalSection(e.target.value)}
                  className="w-full bg-[#131514] border border-[#2e3430] focus:border-[#de8535] rounded-xl px-3 py-2 text-xs text-[#f5f1e8] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#b8b2a4] block mb-1">
                  Document Content / Clause Text *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Paste the exact statutory requirements, operating procedures, or contractual terms..."
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  className="w-full bg-[#131514] border border-[#2e3430] focus:border-[#de8535] rounded-xl p-3 text-xs text-[#f5f1e8] focus:outline-none resize-none leading-relaxed font-sans"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#131514] border border-[#262a28] text-[11px] text-[#7d776b] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4b9b74] shrink-0" />
                <span>
                  Content is embedded locally using BGE-M3 dense embeddings with zero cloud exposure.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2e3430]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#222624] hover:bg-[#282d2a] text-[#b8b2a4] text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#de8535] hover:bg-[#eb9242] disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingDocId ? "Save Changes" : "Create & Index"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
