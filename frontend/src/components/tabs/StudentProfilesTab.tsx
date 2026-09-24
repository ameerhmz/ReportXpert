"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Plus, RefreshCw, Trophy, Award, Search, Trash2 } from "lucide-react";

export const StudentProfilesTab: React.FC = () => {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("Computer Science");
  const [batchYear, setBatchYear] = useState("2024");
  const [achievements, setAchievements] = useState("");
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/knowledge/documents?doc_type=student_profile");
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
    if (!name || !studentId) {
      setStatus("Please provide student ID and Name.");
      return;
    }

    setStatus("Embedding student profile into Vector DB...");
    try {
      const content = `Student Name: ${name}\nStudent ID: ${studentId}\nDepartment: ${department}\nBatch Year: ${batchYear}\nAchievements & Awards: ${achievements}`;

      const res = await fetch("http://127.0.0.1:8000/api/knowledge/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc_id: `student_${studentId}`,
          doc_type: "student_profile",
          standard: `Student: ${name}`,
          section: department,
          content: content,
        }),
      });

      if (res.ok) {
        setStatus("✓ Successfully embedded and indexed in Sovereign RAG!");
        setStudentId("");
        setName("");
        setAchievements("");
        fetchProfiles();
      } else {
        setStatus("Failed to embed student record.");
      }
    } catch (e) {
      console.error(e);
      setStatus("Error connecting to server.");
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/knowledge/documents/${docId}`, { method: "DELETE" });
      fetchProfiles();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadLeaderboard = () => {
    window.open("http://127.0.0.1:8000/api/reports/student-leaderboard?format=xlsx", "_blank");
  };

  const filtered = profiles.filter(p => {
    const s = `${p.standard} ${p.section} ${p.content}`.toLowerCase();
    return s.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-[#1a1d1b] border border-[#2e3430] rounded-2xl shadow-xl tactile-chamfer flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-[#f5f1e8] flex items-center gap-2 mb-1 font-sans">
            <GraduationCap className="w-5 h-5 text-[#3d6a8a]" />
            Student Research & Achievements Vector Repository
          </h2>
          <p className="text-xs text-[#b8b2a4]">
            Tracks student awards, research publications, patents, and hackathons with dense BGE-M3 semantic retrieval.
          </p>
        </div>
        <button
          onClick={handleDownloadLeaderboard}
          className="px-3.5 py-2 bg-[#3d6a8a] hover:bg-[#325873] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-yellow-300" />
          Export Leaderboard (.xlsx)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ingestion Form */}
        <div className="p-5 bg-[#131514] border border-[#2e3430] rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b2a4] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#3d6a8a]" /> Add Student Profile
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Student Enrollment ID</label>
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#3d6a8a]"
                placeholder="E.g. STU202401"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#3d6a8a]"
                placeholder="E.g. Priya Sharma"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#3d6a8a]"
                placeholder="Computer Science"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">Batch Year</label>
              <input
                type="text"
                value={batchYear}
                onChange={e => setBatchYear(e.target.value)}
                className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#3d6a8a]"
                placeholder="2024"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#8c877a] block mb-1">
              Verified Achievements, Publications & Awards (One per line)
            </label>
            <textarea
              rows={4}
              value={achievements}
              onChange={e => setAchievements(e.target.value)}
              className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-lg p-2 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#3d6a8a]"
              placeholder="- 1st Place Smart India Hackathon 2024&#10;- Co-authored IEEE Conference Paper on Computer Vision&#10;- Published Patent on Autonomous Navigation"
            />
          </div>

          <button
            onClick={handleIngest}
            className="w-full py-2.5 bg-[#3d6a8a] hover:bg-[#325873] text-white text-xs font-bold rounded-xl transition shadow cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Embed & Store in Vector DB
          </button>

          {status && (
            <div className={`p-2.5 rounded-lg text-xs font-mono text-center ${status.includes("✓") ? "bg-[#4b9b74]/15 text-[#4b9b74] border border-[#4b9b74]/30" : "bg-[#de8535]/15 text-[#de8535] border border-[#de8535]/30"}`}>
              {status}
            </div>
          )}
        </div>

        {/* Right: Ingested Students List */}
        <div className="p-5 bg-[#131514] border border-[#2e3430] rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b8b2a4] flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" /> Embedded Student Profiles ({profiles.length})
            </h3>
            <button
              onClick={fetchProfiles}
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
              placeholder="Search by student name, ID, or award..."
              className="w-full bg-[#1a1d1b] border border-[#2e3430] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#f5f1e8] focus:outline-none focus:border-[#3d6a8a]"
            />
          </div>

          <div className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#7d776b] border border-dashed border-[#2e3430] rounded-xl">
                No student profiles found. Add candidate achievements using the form or Bulk Ingestion.
              </div>
            ) : (
              filtered.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="p-3.5 bg-[#1a1d1b] border border-[#2e3430] rounded-xl hover:border-[#3d6a8a]/40 transition space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#f5f1e8] block">{item.standard}</span>
                      <span className="text-[10px] text-[#3d6a8a] font-mono">{item.section} • ID: {item.id.replace("student_", "")}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-[#2e3430] rounded text-[#7d776b] hover:text-red-400 transition cursor-pointer"
                      title="Delete Student"
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
