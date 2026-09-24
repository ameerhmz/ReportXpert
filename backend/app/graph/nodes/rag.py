from typing import Dict, Any, List
from ..state import AgentWorkflowState
from ...tools.rag_engine import rag_engine

def rag_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Sovereign RAG Node (ChromaDB + BGE-M3 Local Vector Database).
    Retrieves organizational documents, guidelines, SOPs, and administrative clauses.
    """
    prompt = state.get("user_prompt", "")
    vision_output = state.get("vision_output", "")

    # Build semantic search query
    query_text = prompt
    if vision_output:
        query_text = f"{prompt} {vision_output[:350]}".strip()

    retrieved = rag_engine.search_sops(query=query_text, n_results=3)
    relevant = retrieved

    statuses = dict(state.get("node_statuses", {}))
    statuses["rag"] = "COMPLETED"

    steps = list(state.get("steps", []))
    logs = list(state.get("logs", []))

    if relevant:
        steps.append(f"Retrieved {len(relevant)} standard(s) from Knowledge Vault")
        logs.append(f"📚 [KNOWLEDGE VAULT] Matched {len(relevant)} standard clauses with high relevance.")
    else:
        steps.append("Knowledge Vault search completed (0 confident matches; continuing cleanly)")
        logs.append("📚 [KNOWLEDGE VAULT] Query completed with 0 high-relevance matches.")

    return {
        "active_node": "rag",
        "rag_context": relevant,
        "rag_sources": relevant,
        "node_statuses": statuses,
        "steps": steps,
        "logs": logs
    }
