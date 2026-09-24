export interface Artifact {
  id: string;
  title: string;
  type: "code" | "document" | "citations" | "blueprint";
  language?: string;
  content: string;
  stdout?: string;
  stderr?: string;
  execTimeMs?: number;
  deliverables?: {
    docx?: string;
    xlsx?: string;
    pptx?: string;
  };
  imageSrc?: string;
}

export interface ModelTrace {
  model: string;
  role?: string;
  device: string;
  latency_ms: number;
  eval_count?: number;
  prompt_eval_count?: number;
  tokens_per_sec?: number;
  rag_sources_count?: number;
  sandbox_ms?: number;
  airgap_egress_kb: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  fileAttached?: {
    name: string;
    size?: string;
    url?: string;
  };
  modelName?: string;
  trace?: ModelTrace;
  steps?: string[];
  deliverables?: {
    docx?: string;
    pptx?: string;
    xlsx?: string;
  };
  artifact?: Artifact;
  thinkingContent?: string;
}

export interface ChatSession {
  id: string;
  taskId?: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  activeArtifact?: Artifact;
  selectedModel?: string;
}
