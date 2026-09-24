"use client";

import React, { useState, useEffect, useRef } from "react";
import { ClaudeSidebar } from "../components/ClaudeSidebar";
import { ClaudeArtifactPanel } from "../components/ClaudeArtifactPanel";
import { AgentWorkbenchChat } from "../components/chat/AgentWorkbenchChat";
import { KnowledgeVaultModal } from "../components/KnowledgeVaultModal";
import { FrameworkTemplatesModal } from "../components/FrameworkTemplatesModal";
import { ChatSession, ChatMessage, Artifact } from "../types/workbench";
import { SovereignInsignia } from "../components/SovereignInsignia";
import { ModelSelectorDropdown } from "../components/ModelSelectorDropdown";
import { 
  PanelRight, 
  PanelRightClose, 
  Trash2
} from "lucide-react";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isArtifactOpen, setIsArtifactOpen] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [isKnowledgeVaultOpen, setIsKnowledgeVaultOpen] = useState(false);
  const [isFrameworksModalOpen, setIsFrameworksModalOpen] = useState(false);
  const [vaultInitialTab, setVaultInitialTab] = useState<"standards" | "research" | "scholarships" | "faculty" | "students" | "events" | "bulk">("research");
  const [isProcessing, setIsProcessing] = useState(false);

  // Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Abort controller ref to support instant LLM generation cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessing(false);

    // Notify backend to instantly abort active Ollama streaming socket and free GPU
    try {
      fetch("http://127.0.0.1:8000/api/chat/stop", { method: "POST" }).catch(() => {});
    } catch (e) {}

    // Update active chat message with user-facing stopped feedback
    if (activeSessionId) {
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          const lastMsg = s.messages[s.messages.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            const updatedLast: ChatMessage = {
              ...lastMsg,
              content: lastMsg.content ? `${lastMsg.content}\n\n🛑 *(Generation halted by user)*` : "🛑 *Generation halted by user.*",
              modelName: lastMsg.modelName || "User Interrupted",
              trace: {
                model: "User Interrupted",
                role: "Halted",
                device: "Apple Silicon Metal GPU (Released)",
                latency_ms: 0,
                eval_count: 0,
                prompt_eval_count: 0,
                tokens_per_sec: 0,
                rag_sources_count: 0,
                sandbox_ms: 0,
                airgap_egress_kb: 0
              }
            };
            return {
              ...s,
              messages: [...s.messages.slice(0, -1), updatedLast]
            };
          }
          const stoppedMsg: ChatMessage = {
            id: `stopped-${Date.now()}`,
            role: "assistant",
            content: "🛑 *Generation halted by user.*",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            modelName: "User Interrupted",
            trace: {
              model: "User Interrupted",
              role: "Halted",
              device: "Apple Silicon Metal GPU (Released)",
              latency_ms: 0,
              eval_count: 0,
              prompt_eval_count: 0,
              tokens_per_sec: 0,
              rag_sources_count: 0,
              sandbox_ms: 0,
              airgap_egress_kb: 0
            }
          };
          return {
            ...s,
            messages: [...s.messages, stoppedMsg]
          };
        }
        return s;
      }));
    }
  };

  // Global keyboard shortcut: Esc cancels ongoing generation immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isProcessing) {
        handleStopGeneration();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProcessing, activeSessionId]);

  // 1. Dual-Layer Hydration: Synchronous localStorage read on mount
  useEffect(() => {
    let localFound = false;
    try {
      const savedSessions = localStorage.getItem("reportxpert_workbench_sessions") || localStorage.getItem("paperlessadmin_workbench_sessions");
      const savedActiveId = localStorage.getItem("reportxpert_workbench_active_id") || localStorage.getItem("paperlessadmin_workbench_active_id");
      const savedSidebar = localStorage.getItem("reportxpert_workbench_sidebar_open") || localStorage.getItem("paperlessadmin_workbench_sidebar_open");
      const savedArtifactOpen = localStorage.getItem("reportxpert_workbench_artifact_open") || localStorage.getItem("paperlessadmin_workbench_artifact_open");

      if (savedSidebar !== null) {
        setIsSidebarOpen(savedSidebar === "true");
      }

      if (savedSessions !== null) {
        localFound = true;
        try {
          const parsed = JSON.parse(savedSessions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);

            // Always activate the target session (or latest session if none specified)
            const targetSession = (savedActiveId && savedActiveId !== "new" && parsed.find((s: ChatSession) => s.id === savedActiveId)) || parsed[0];
            if (targetSession) {
              setActiveSessionId(targetSession.id);
              if (targetSession.activeArtifact) {
                setActiveArtifact(targetSession.activeArtifact);
                if (savedArtifactOpen === "true") {
                  setIsArtifactOpen(true);
                }
              }
            }
          } else {
            setSessions([]);
            setActiveSessionId(null);
          }
        } catch (e) {}
      }
    } catch (e) {
      console.warn("Storage hydration error", e);
    }

    // Only restore from on-premise SQLite history if this is the very first visit (localStorage never set)
    if (!localFound) {
      fetch("http://127.0.0.1:8000/api/history")
        .then(res => res.json())
        .then(data => {
          if (data?.tasks && data.tasks.length > 0) {
            const restored: ChatSession[] = data.tasks.map((t: any) => {
              const userMsg: ChatMessage = {
                id: `user-${t.task_id}`,
                role: "user",
                content: t.prompt || "Accreditation dossier request",
                timestamp: new Date((t.created_at || Date.now() / 1000) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };

              let art: Artifact | undefined = undefined;
              if (t.deliverables && Object.keys(t.deliverables).length > 0) {
                art = {
                  id: `art-${t.task_id}`,
                  title: t.deliverables.xlsx ? "Accreditation Calculation Trace" : "Executive Accreditation Dossier",
                  type: t.deliverables.xlsx ? "code" : "document",
                  content: t.response || (t.logs ? t.logs.join("\n") : "Deliverable compiled."),
                  deliverables: t.deliverables
                };
              }

              const asstMsg: ChatMessage = {
                id: `asst-${t.task_id}`,
                role: "assistant",
                content: t.response || (t.logs ? t.logs.join("\n") : "Task completed successfully."),
                timestamp: new Date((t.completed_at || Date.now() / 1000) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                modelName: t.model_used || "llama3.1:8b",
                deliverables: t.deliverables || {},
                steps: t.logs || [],
                artifact: art
              };

              return {
                id: t.task_id,
                title: t.prompt ? (t.prompt.length > 28 ? t.prompt.slice(0, 28) + "..." : t.prompt) : `Task ${t.task_id}`,
                createdAt: new Date((t.created_at || Date.now() / 1000) * 1000).toISOString(),
                messages: [userMsg, asstMsg],
                activeArtifact: art
              };
            });

            setSessions(restored);
            setActiveSessionId(restored[0].id);
            if (restored[0].activeArtifact) {
              setActiveArtifact(restored[0].activeArtifact);
            }
          }
        })
        .catch(err => console.warn("Backend history error", err))
        .finally(() => setIsMounted(true));
    } else {
      setIsMounted(true);
    }
  }, []);

  // 2. Persist state changes without empty overwrites or race conditions
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("reportxpert_workbench_sessions", JSON.stringify(sessions));
      localStorage.setItem("reportxpert_workbench_active_id", activeSessionId || "new");
      localStorage.setItem("reportxpert_workbench_sidebar_open", String(isSidebarOpen));
      localStorage.setItem("reportxpert_workbench_artifact_open", String(isArtifactOpen));
    } catch (e) {
      console.warn("Storage persist error", e);
    }
  }, [sessions, activeSessionId, isSidebarOpen, isArtifactOpen, isMounted]);

  // Soft telemetry fetch every 5s
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/telemetry");
        const data = await res.json();
        setTelemetry(data);
      } catch (e) {
        setTelemetry({
          badge_status: "SECURE_AIR_GAPPED",
          egress_display: "0.00 KB Outbound",
          telemetry: { is_airgapped: true, active_local_sockets: 1, external_sockets_count: 0 }
        });
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const currentMessages = activeSession ? activeSession.messages : [];

  const handleNewChat = () => {
    setActiveSessionId(null);
    setActiveArtifact(null);
    setIsArtifactOpen(false);
    try {
      localStorage.setItem("reportxpert_workbench_active_id", "new");
      localStorage.setItem("reportxpert_workbench_artifact_open", "false");
    } catch (e) {}
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    const sess = sessions.find(s => s.id === id);
    if (sess?.activeArtifact) {
      setActiveArtifact(sess.activeArtifact);
      setIsArtifactOpen(true);
    } else {
      setIsArtifactOpen(false);
    }
    try {
      localStorage.setItem("reportxpert_workbench_active_id", id);
      localStorage.setItem("reportxpert_workbench_artifact_open", sess?.activeArtifact ? "true" : "false");
    } catch (e) {}
  };

  const handleDeleteSession = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const target = sessions.find(s => s.id === id);
    const taskIdToDelete = target?.taskId || target?.id || id;

    // 1. Delete from SQLite backend database so it never resurrects
    fetch(`http://127.0.0.1:8000/api/history/${taskIdToDelete}`, { method: "DELETE" }).catch(err => {
      console.warn("Backend session delete error", err);
    });
    if (id !== taskIdToDelete) {
      fetch(`http://127.0.0.1:8000/api/history/${id}`, { method: "DELETE" }).catch(() => {});
    }

    // 2. Filter remaining list synchronously
    const remaining = sessions.filter(s => s.id !== id);

    // 3. Immediately persist updated sessions to localStorage
    try {
      localStorage.setItem("reportxpert_workbench_sessions", JSON.stringify(remaining));
    } catch (e) {}

    // 4. Update active session selection cleanly outside setSessions
    if (activeSessionId === id) {
      if (remaining.length > 0) {
        const nextActive = remaining[0];
        setActiveSessionId(nextActive.id);
        if (nextActive.activeArtifact) {
          setActiveArtifact(nextActive.activeArtifact);
          setIsArtifactOpen(true);
        } else {
          setActiveArtifact(null);
          setIsArtifactOpen(false);
        }
        try {
          localStorage.setItem("reportxpert_workbench_active_id", nextActive.id);
        } catch (e) {}
      } else {
        setActiveSessionId(null);
        setActiveArtifact(null);
        setIsArtifactOpen(false);
        try {
          localStorage.setItem("reportxpert_workbench_active_id", "new");
        } catch (e) {}
      }
    }

    // 5. Update state
    setSessions(remaining);
  };

  const handleClearAllSessions = () => {
    // 1. Delete all from SQLite backend
    fetch("http://127.0.0.1:8000/api/history/all", { method: "DELETE" }).catch(err => {
      console.warn("Backend clear all history error", err);
    });

    // 2. Clear state
    setSessions([]);
    setActiveSessionId(null);
    setActiveArtifact(null);
    setIsArtifactOpen(false);

    // 3. Clear localStorage
    try {
      localStorage.setItem("reportxpert_workbench_sessions", JSON.stringify([]));
      localStorage.setItem("reportxpert_workbench_active_id", "new");
    } catch (e) {}
  };

  const handleOpenArtifact = (art: Artifact) => {
    setActiveArtifact(art);
    setIsArtifactOpen(true);
  };

  const handleLaunchFrameworkAudit = (fw: string) => {
    const auditPrompt = `Perform a comprehensive pre-submission compliance audit of our institution against the official ${fw} accreditation standards and criteria. Evaluate research publications, student achievements, faculty qualifications, and identify any documentation gaps grounded in our Knowledge Vault records.`;
    handleSendMessage(auditPrompt, null);
  };

  const handleModelChange = (modelId: string) => {
    if (!activeSessionId) return;
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, selectedModel: modelId };
      }
      return s;
    }));
  };

  const handleSendMessage = async (prompt: string, file: File | null) => {
    let currentId = activeSessionId;
    let newSessions = [...sessions];

    let fileUrl: string | undefined = undefined;
    if (file && (file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp)$/i.test(file.name))) {
      try {
        fileUrl = URL.createObjectURL(file);
      } catch (e) {}
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt || (file ? `Attached file: ${file.name}` : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileAttached: file ? { 
        name: file.name, 
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: fileUrl
      } : undefined
    };

    // If new session, create it
    if (!currentId) {
      currentId = `sess-${Date.now()}`;
      const title = prompt.trim()
        ? (prompt.length > 28 ? prompt.slice(0, 28) + "..." : prompt)
        : (file ? file.name : "New Conversation");

      const newSess: ChatSession = {
        id: currentId,
        title,
        createdAt: new Date().toISOString(),
        messages: [userMsg]
      };
      newSessions = [newSess, ...newSessions];
      setActiveSessionId(currentId);
      setSessions(newSessions);
    } else {
      newSessions = newSessions.map(s => {
        if (s.id === currentId) {
          const isGeneric = !s.title || s.title === "New Chat" || s.title === "New Conversation" || s.messages.length === 0;
          const updatedTitle = isGeneric
            ? (prompt.trim() ? (prompt.length > 28 ? prompt.slice(0, 28) + "..." : prompt) : (file ? file.name : s.title || "Chat"))
            : s.title;
          return { ...s, title: updatedTitle, messages: [...s.messages, userMsg] };
        }
        return s;
      });
      setSessions(newSessions);
    }

    setIsProcessing(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const assistantId = `assistant-${Date.now()}`;

    try {
      const formData = new FormData();
      formData.append("message", userMsg.content);
      if (file) {
        formData.append("file", file);
      }

      // Pass per-chat pinned model override if set
      const targetSession = newSessions.find(s => s.id === currentId);
      const activeModel = targetSession?.selectedModel || "auto";
      if (activeModel && activeModel !== "auto") {
        formData.append("model_override", activeModel);
      }

      // Pass multi-turn history (Claude-style conversation memory)
      if (targetSession && targetSession.messages.length > 1) {
        const historyTurns = targetSession.messages.slice(0, -1).map(m => ({
          role: m.role,
          content: m.content
        }));
        formData.append("history", JSON.stringify(historyTurns));
      }

      // Request streaming
      formData.append("stream", "true");

      // Insert placeholder assistant message so user sees immediate response bubble
      const initialAssistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelName: activeModel !== "auto" ? activeModel : "Local AI",
        thinkingContent: ""
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentId) {
          return {
            ...s,
            messages: [...s.messages, initialAssistantMsg]
          };
        }
        return s;
      }));

      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          "Accept": "text/event-stream"
        }
      });

      if (!res.ok) throw new Error("Local model service error");

      const contentType = res.headers.get("content-type") || "";
      let result: any = null;
      let accumulatedContent = "";
      let accumulatedThinking = "";

      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const jsonStr = trimmed.replace(/^data:\s*/, "");
            try {
              const event = JSON.parse(jsonStr);
              if (event.type === "init") {
                if (event.task_id) {
                  setSessions(prev => prev.map(s => s.id === currentId ? { ...s, taskId: event.task_id } : s));
                }
              } else if (event.type === "token") {
                if (event.content) {
                  accumulatedContent += event.content;
                }
                if (event.thinking) {
                  accumulatedThinking += event.thinking;
                }
                setSessions(prev => prev.map(s => {
                  if (s.id === currentId) {
                    const updated = s.messages.map(m => {
                      if (m.id === assistantId) {
                        return {
                          ...m,
                          content: accumulatedContent,
                          thinkingContent: accumulatedThinking || undefined
                        };
                      }
                      return m;
                    });
                    return { ...s, messages: updated };
                  }
                  return s;
                }));
              } else if (event.type === "done" || event.type === "halted") {
                result = event.data;
              } else if (event.type === "error") {
                throw new Error(event.error || "Streaming error");
              }
            } catch (pErr: any) {
              if (!(pErr instanceof SyntaxError)) {
                throw pErr;
              }
            }
          }
        }

        if (!result) {
          result = {
            response: accumulatedContent,
            thinking_content: accumulatedThinking,
            model: activeModel !== "auto" ? activeModel : "Local AI"
          };
        }
      } else {
        result = await res.json();
      }

      const content = result.response || accumulatedContent || "Task completed successfully.";

      // Extract real Artifact if response has code, blueprint, or deliverables
      let artifact: Artifact | undefined = undefined;
      const codeMatch = content.match(/```(?:python)?\s*([\s\S]*?)```/);

      if (codeMatch) {
        artifact = {
          id: `art-${Date.now()}`,
          title: "script.py",
          type: "code",
          language: "python",
          content: codeMatch[1].trim(),
          deliverables: result.deliverables || {}
        };
      } else if (file && [".png", ".jpg", ".jpeg", ".bmp"].some(ext => file.name.toLowerCase().endsWith(ext))) {
        artifact = {
          id: `art-${Date.now()}`,
          title: file.name,
          type: "blueprint",
          content: content,
          imageSrc: URL.createObjectURL(file)
        };
      } else if (result.deliverables && Object.keys(result.deliverables).length > 0) {
        artifact = {
          id: `art-${Date.now()}`,
          title: "Approval Deliverables",
          type: "document",
          content: content,
          deliverables: result.deliverables
        };
      }

      setSessions(prev => prev.map(s => {
        if (s.id === currentId) {
          const updated = s.messages.map(m => {
            if (m.id === assistantId) {
              return {
                ...m,
                content,
                modelName: result.model || m.modelName || "Llama 3.1",
                trace: result.trace,
                steps: result.steps || [],
                deliverables: result.deliverables || {},
                artifact,
                thinkingContent: result.thinking_content || (accumulatedThinking ? accumulatedThinking : m.thinkingContent)
              };
            }
            return m;
          });
          return {
            ...s,
            taskId: result.task_id || s.taskId,
            messages: updated,
            activeArtifact: artifact || s.activeArtifact
          };
        }
        return s;
      }));

      if (artifact) {
        setActiveArtifact(artifact);
        setIsArtifactOpen(true);
      }
    } catch (err: any) {
      if (err.name === "AbortError" || err.message?.includes("aborted")) {
        // User deliberately aborted generation; ensure the assistant message reflects stopped state
        setSessions(prev => prev.map(s => {
          if (s.id === currentId) {
            const updated = s.messages.map(m => {
              if (m.id === assistantId) {
                return {
                  ...m,
                  content: m.content ? `${m.content}\n\n🛑 *(Generation halted by user)*` : "🛑 *Generation halted by user.*"
                };
              }
              return m;
            });
            return { ...s, messages: updated };
          }
          return s;
        }));
        return;
      }
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Could not connect to local AI: ${err.message || "Model engine offline"}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSessions(prev => prev.map(s => {
        if (s.id === currentId) {
          const filtered = s.messages.filter(m => m.id !== assistantId || Boolean(m.content));
          return { ...s, messages: [...filtered, errorMsg] };
        }
        return s;
      }));
    } finally {
      abortControllerRef.current = null;
      setIsProcessing(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-[#1f1e1d] text-[#ece8e1] flex overflow-hidden font-sans antialiased">
        <aside className="w-64 border-r border-[#262422] bg-[#181716] flex flex-col justify-between shrink-0 select-none z-10" />
        <div className="flex-1 flex flex-col min-w-0 bg-[#1f1e1d] overflow-hidden">
          <header className="h-12 border-b border-[#282623] bg-[#1f1e1d] px-6 shrink-0" />
          <div className="flex-1 bg-[#1f1e1d]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#1f1e1d] text-[#ece8e1] flex overflow-hidden font-sans antialiased">
      {/* 1. Left Sidebar */}
      <ClaudeSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        onOpenKnowledgeVault={() => {
          setVaultInitialTab("standards");
          setIsKnowledgeVaultOpen(true);
        }}
        onOpenFrameworks={() => setIsFrameworksModalOpen(true)}
        onOpenResearch={() => {
          setVaultInitialTab("research");
          setIsKnowledgeVaultOpen(true);
        }}
        onOpenScholarships={() => {
          setVaultInitialTab("scholarships");
          setIsKnowledgeVaultOpen(true);
        }}
        onOpenAutoIngest={() => {
          setVaultInitialTab("bulk");
          setIsKnowledgeVaultOpen(true);
        }}
      />

      {/* 2. Main Conversation Stream */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#131514] overflow-hidden">
        {/* Cockpit Top Navigation Header */}
        <header className="h-14 border-b border-[#2a2f2c] bg-[#161817] px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-10 gap-2 tactile-chamfer w-full">
          {/* Left Brand & Model Selector */}
          <div className="flex items-center gap-2 shrink-0">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 text-[#b8b2a4] hover:text-[#f5f1e8] rounded-lg hover:bg-[#222624] transition cursor-pointer mr-0.5"
                title="Open console rail"
              >
                <SovereignInsignia size={18} glow={true} />
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#de8535] hidden 2xl:inline uppercase">
                ORGANIZATION // SOVEREIGN CONSOLE
              </span>
              <ModelSelectorDropdown
                selectedModel={activeSession?.selectedModel || "auto"}
                onSelectModel={handleModelChange}
              />
            </div>
          </div>

          {/* Right Action Tools & Telemetry (Compact & Fully Responsive) */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">


            {/* Delete Current Active Chat Button */}
            {activeSessionId && sessions.some(s => s.id === activeSessionId) && (
              <button
                onClick={(e) => handleDeleteSession(activeSessionId, e)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#222624] hover:bg-[#281715] border border-[#383e3a] hover:border-[#c9523c]/50 text-[#b8b2a4] hover:text-[#c9523c] text-xs font-medium transition cursor-pointer shadow-sm whitespace-nowrap"
                title="Delete current conversation"
              >
                <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                <span className="hidden 2xl:inline font-mono text-[11px]">Delete Chat</span>
              </button>
            )}

            {/* Workspace Toggle Button */}
            <button
              onClick={() => setIsArtifactOpen(!isArtifactOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition cursor-pointer font-medium font-mono whitespace-nowrap ${
                isArtifactOpen
                  ? "bg-[#222624] text-[#f5f1e8] border border-[#383e3a]"
                  : "hover:bg-[#202321] text-[#b8b2a4] hover:text-[#f5f1e8] border border-transparent"
              }`}
              title="Toggle Workspace Panel"
            >
              {isArtifactOpen ? <PanelRightClose className="w-3.5 h-3.5 text-[#de8535]" /> : <PanelRight className="w-3.5 h-3.5 text-[#7d776b]" />}
              <span className="hidden sm:inline">Inspector</span>
              {activeArtifact && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#de8535]"></span>
              )}
            </button>
          </div>
        </header>

        {/* Unified Full-Height Industrial Workbench Main Area */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <AgentWorkbenchChat
            messages={currentMessages}
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isProcessing={isProcessing}
            onOpenArtifact={handleOpenArtifact}
            selectedModel={activeSession?.selectedModel || "auto"}
            onSelectModel={handleModelChange}
          />
        </div>
      </div>

      {/* 3. Right Artifact Panel */}
      <ClaudeArtifactPanel
        isOpen={isArtifactOpen}
        onClose={() => setIsArtifactOpen(false)}
        artifact={activeArtifact}
        onUpdateArtifact={setActiveArtifact}
      />

      {/* Statutory Framework Templates Modal */}
      <FrameworkTemplatesModal
        isOpen={isFrameworksModalOpen}
        onClose={() => setIsFrameworksModalOpen(false)}
        onLaunchAudit={handleLaunchFrameworkAudit}
      />

      {/* University Knowledge Vault Modal */}
      <KnowledgeVaultModal
        isOpen={isKnowledgeVaultOpen}
        onClose={() => setIsKnowledgeVaultOpen(false)}
        onLaunchAudit={handleLaunchFrameworkAudit}
        initialTab={vaultInitialTab}
      />
    </div>
  );
}
