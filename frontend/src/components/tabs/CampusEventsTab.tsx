"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Plus, RefreshCw, Download, Search, Trash2, Building2 } from "lucide-react";

export const CampusEventsTab: React.FC = () => {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("International Conference");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [participants, setParticipants] = useState("250");
  const [funding, setFunding] = useState("DST-SERB (₹5.0 Lakhs)");
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/knowledge/documents?doc_type=campus_event");
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleIngest = async () => {
    if (!title) {
      setStatus("Please specify an event title.");
      return;
    }

    setStatus("Indexing campus event into Vector DB...");
    try {
      const content = `Event Title: ${title}\nType: ${eventType}\nDepartment: ${department}\nParticipants: ${participants}\nFunding Agency: ${funding}\nDescription & Outcome: ${summary}`;

      const res = await fetch("http://127.0.0.1:8000/api/knowledge/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_id: `event_${Date.now()}`,
          doc_type: "campus_event",
          standard: `Event: ${title}`,
          section: department,
          content: content,
        }),
      });

      if (res.ok) {
        setStatus("✓ Event registered and embedded in Sovereign RAG!");
        setTitle("");
        setSummary("");
        fetchEvents();
      } else {
        setStatus("Failed to register event.");
      }
    } catch (e) {
      console.error(e);
      setStatus("Error connecting to server.");
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/knowledge/documents/${docId}`, { method: "DELETE" });
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadDossier = (fmt: string) => {
    window.open(`http://127.0.0.1:8000/api/reports/campus-events?format=${fmt}`, "_blank");
  };

  const filtered = events.filter(e => {
    const s = `${e.standard} ${e.section} ${e.content}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl shadow-xl tactile-chamfer flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-[#f5f1e8] flex items-center gap-2 mb-1 font-sans">
            <Calendar className="w-5 h-5 text-[#4b9b74]" />
            Cumulative Campus Events & Conferences Repository
          </h2>
          <p className="text-xs text-[#b8b2a4]">
            Aggregates institutional workshops, international conferences, FDPs, and guest seminars for statutory compliance.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleDownloadDossier("xlsx")}
            className="px-3 py-1.5 bg-[#222624] hover:bg-[#2e3430] border border-[#2e3430] text-[#f5f1e8] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#4b9b74]" />
            Master Sheet (.xlsx)
          </button>
          <button
            onClick={() => handleDownloadDossier("docx")}
            className="px-3 py-1.5 bg-[#4b9b74] hover:bg-[#3f8362] text-[#131514] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Events Dossier (.docx)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ingest Event */}
        <div className="p-5 bg-[#131514] border border-[#2e3430] rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b2a4] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#4b9b74]" /> Record New Institutional Event
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#4b9b74]"
              placeholder="E.g. National Symposium on Quantum Computing & Cybernetics"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Event Type</label>
              <select
                value={eventType}
                onChange={e => setEventType(e.target.value)}
                className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#4b9b74]"
              >
                <option value="International Conference">International Conference</option>
                <option value="National Conference">National Conference</option>
                <option value="Faculty Development Program (FDP)">Faculty Development Program (FDP)</option>
                <option value="Workshop / Hands-on Bootcamp">Workshop / Hands-on Bootcamp</option>
                <option value="Distinguished Guest Lecture">Distinguished Guest Lecture</option>
                <option value="Symposium">Symposium</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Department / Cell</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#4b9b74]"
                placeholder="Computer Science & Engineering"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Attendees / Delegates</label>
              <input
                type="text"
                value={participants}
                onChange={e => setParticipants(e.target.value)}
                className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#4b9b74]"
                placeholder="250"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Funding Agency / Grant</label>
              <input
                type="text"
                value={funding}
                onChange={e => setFunding(e.target.value)}
                className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#4b9b74]"
                placeholder="AICTE / DST / Self-Financed"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">
              Event Abstract & Key Highlights
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#4b9b74]"
              placeholder="3-day national conference featuring 4 keynote speakers from IIT and 45 accepted papers published in Scopus-indexed proceedings."
            />
          </div>

          <button
            onClick={handleIngest}
            className="w-full py-2.5 bg-[#4b9b74] hover:bg-[#3f8362] text-[#131514] text-xs font-bold rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Embed & Index Event in Sovereign RAG
          </button>

          {status && (
            <div className={`p-2.5 rounded-lg text-xs font-mono text-center ${status.includes("✓") ? "bg-[#4b9b74]/15 text-[#4b9b74] border border-[#4b9b74]/30" : "bg-[#de8535]/15 text-[#de8535] border border-[#de8535]/30"}`}>
              {status}
            </div>
          )}
        </div>

        {/* Right: Ingested Events List */}
        <div className="p-5 bg-[#131514] border border-[#2e3430] rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b2a4] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#4b9b74]" /> Recorded Campus Events ({events.length})
            </h3>
            <button
              onClick={fetchEvents}
              className="p-1.5 hover:bg-[#1a1d1b] rounded-lg text-[#8c877a] hover:text-white transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#7d776b] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, department, or funding agency..."
              className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#4b9b74]"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7d776b] border border-dashed border-[#2e3430] rounded-xl">
                No events recorded yet. Ingest conferences and seminars to include in NAAC Criterion 3.
              </div>
            ) : (
              filtered.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="p-3.5 bg-[#1a1d1b] border border-[#2e3430] rounded-xl hover:border-[#4b9b74]/40 transition space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#f5f1e8] block">{item.standard}</span>
                      <span className="text-[10px] text-[#4b9b74] font-mono">{item.section}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-[#2e3430] rounded text-[#7d776b] hover:text-red-400 transition cursor-pointer"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#b8b2a4] whitespace-pre-line leading-relaxed font-sans line-clamp-3">
                    {item.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
