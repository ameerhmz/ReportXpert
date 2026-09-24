"use client";

import React, { useState, useEffect } from "react";
import { Users, Plus, RefreshCw, Server, Send } from "lucide-react";

export const FacultyProfilesTab: React.FC = () => {
  const [facultyId, setFacultyId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [publications, setPublications] = useState("");
  const [grants, setGrants] = useState("");
  const [status, setStatus] = useState("");
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/knowledge/documents?doc_type=faculty_profile");
      const data = await res.json();
      setProfiles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleIngest = async () => {
    setStatus("Ingesting to Vector DB...");
    try {
      const content = `Faculty Name: ${name}\nID: ${facultyId}\nDepartment: ${department}\nPublications & Impact: ${publications}\nGrants & Projects: ${grants}`;

      const res = await fetch("http://127.0.0.1:8000/api/knowledge/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_id: `faculty_${facultyId}`,
          doc_type: "faculty_profile",
          standard: `Faculty: ${name}`,
          section: department,
          content: content,
        }),
      });

      if (res.ok) {
        setStatus("Successfully embedded and stored in SovereignRAGEngine!");
        setFacultyId("");
        setName("");
        setPublications("");
        setGrants("");
        fetchProfiles();
      } else {
        setStatus("Failed to ingest.");
      }
    } catch (e) {
      console.error(e);
      setStatus("Error connecting to server.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl shadow-xl tactile-chamfer flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-[#f5f1e8] flex items-center gap-2 mb-1 font-sans">
            <Users className="w-5 h-5 text-[#de8535]" />
            Faculty Profiles & Research Vector DB
          </h2>
          <p className="text-xs text-[#b8b2a4]">
            Ingest faculty achievements as dense embeddings for RAG querying and custom NAAC/NIRF reporting.
          </p>
        </div>
        <Server className="text-[#3b433e] w-8 h-8" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingestion Form */}
        <div className="p-5 bg-[#131514] border border-[#2e3430] rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b2a4] flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Profile
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Faculty ID</label>
              <input type="text" value={facultyId} onChange={e => setFacultyId(e.target.value)} className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535]" placeholder="E.g. FAC001" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535]" placeholder="E.g. Dr. A. Smith" />
            </div>
          </div>
          
          <div>
            <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Department</label>
            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535]" />
          </div>
          
          <div>
            <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Publications & Citations (Rich Text)</label>
            <textarea value={publications} onChange={e => setPublications(e.target.value)} rows={3} className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535]" placeholder="Published 5 papers in IEEE, 200 citations..." />
          </div>
          
          <div>
            <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Grants & Patents</label>
            <textarea value={grants} onChange={e => setGrants(e.target.value)} rows={2} className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#de8535]" placeholder="DST Grant for 50 Lakhs..." />
          </div>

          <button onClick={handleIngest} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#de8535] hover:bg-[#c9752b] text-[#131514] font-bold rounded-xl text-xs transition-colors">
            <Send className="w-4 h-4" /> Vectorize & Ingest
          </button>
          
          {status && <div className="text-xs text-[#4b9b74] font-mono mt-2">{status}</div>}
        </div>

        {/* Existing Database */}
        <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b2a4]">Embedded Profiles</h3>
            <button onClick={fetchProfiles} className="text-[#8c877a] hover:text-[#f5f1e8]">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {profiles.length === 0 && !loading && (
              <p className="text-xs text-[#8c877a] text-center mt-10">No faculty profiles found in the vector DB.</p>
            )}
            {profiles.map((p, idx) => (
              <div key={`${p.id}-${idx}`} className="p-3 bg-[#131514] border border-[#2e3430] rounded-xl">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-bold text-[#f5f1e8]">{p.standard}</span>
                  <span className="text-[10px] text-[#de8535] px-2 py-0.5 bg-[#2a1a10] rounded-full border border-[#4a2e1c]">
                    {p.id}
                  </span>
                </div>
                <div className="text-[10px] text-[#8c877a] mb-2">{p.section}</div>
                <p className="text-xs font-mono text-[#b8b2a4] line-clamp-3">{p.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
