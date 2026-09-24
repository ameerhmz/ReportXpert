from pathlib import Path
from typing import Dict, Any
from ..state import AgentWorkflowState
from ...core.model_registry import model_registry

def vision_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Multimodal Vision Node (Qwen2.5-VL-7B).
    Executes in two modes based on LangGraph route_branch:
    1. 'vision_direct': Natural, conversational image explanation (5s fast-path).
    2. 'audit_pipeline': Rigorous document OCR & anomaly extraction.
    """
    file_path = state.get("file_path")
    prompt = state.get("user_prompt", "")
    route_branch = state.get("route_branch", "vision_direct")
    vision_model = state.get("active_model")
    if not vision_model or vision_model in ["auto", "default"]:
        vision_model = model_registry.get_best_vision_model()

    statuses = dict(state.get("node_statuses", {}))
    steps = list(state.get("steps", []))
    logs = list(state.get("logs", []))

    if not file_path or not Path(file_path).exists():
        statuses["vision"] = "FAILED"
        logs.append("⚠️ [VISION] No valid image file found for inspection.")
        return {
            "node_statuses": statuses,
            "error": "Image file not found.",
            "is_completed": True
        }

    if route_branch == "vision_direct":
        # Fast, direct conversational vision
        clean_query = prompt.strip() if prompt.strip() else "Please describe this image in detail and answer any visible questions."
        instruction = (
            f"User Request: {clean_query}\n\n"
            "Instructions: Carefully examine the attached image and answer the user's request directly, accurately, and conversationally. "
            "Describe text, visual interfaces, diagrams, UI elements, or objects clearly using clean markdown. "
            "Do not hallucinate unrelated physical standards or rules unless the image or user explicitly asks for them."
        )

        trace = model_registry.query_llm_multimodal_with_trace(
            model_name=vision_model,
            prompt=instruction,
            image_path=str(file_path),
            temperature=0.2,
            task_id=state.get("task_id")
        )
        content = trace.get("content", "")

        statuses["vision"] = "COMPLETED"
        steps.append(f"Direct multimodal visual analysis via {vision_model} ({trace.get('latency_ms')} ms, {trace.get('tokens_per_sec')} tok/s)")
        logs.append(f"👁️ [VISION] Direct multimodal inference finished in {trace.get('latency_ms')} ms.")

        return {
            "active_node": "vision",
            "vision_output": content,
            "response_text": content,
            "trace": trace,
            "node_statuses": statuses,
            "steps": steps,
            "logs": logs,
            "is_completed": True
        }

    else:
        # Full Academic & Institutional Document OCR Extraction
        instruction = (
            "You are an expert document analysis and visual inspection AI assistant for university administration and accreditation.\n"
            "Analyze the attached institutional document, certificate, or academic evidence in structured, rigorous detail:\n"
            "1. Overview: Identify the document type (e.g., Degree Certificate, Event Banner, Research Paper, Accreditation Circular).\n"
            "2. Detailed Breakdown: Extract all visible text, dates, participant counts, faculty names, signatures, reference numbers, and metrics.\n"
            "3. Compliance Evaluation: Assess whether this document satisfies accreditation evidentiary standards (e.g. NAAC Criterion, UGC guidelines).\n\n"
            f"User Query: {prompt}"
        )

        trace = model_registry.query_llm_multimodal_with_trace(
            model_name=vision_model,
            prompt=instruction,
            image_path=str(file_path),
            temperature=0.1,
            task_id=state.get("task_id")
        )
        extracted = trace.get("content", "")

        statuses["vision"] = "COMPLETED"
        steps.append(f"Executed technical document visual extraction via {vision_model} ({trace.get('latency_ms')} ms)")
        logs.append(f"👁️ [VISION - DOC OCR] Document extraction concluded in {trace.get('latency_ms')} ms.")

        return {
            "active_node": "vision",
            "vision_output": extracted,
            "trace": trace,
            "node_statuses": statuses,
            "steps": steps,
            "logs": logs,
            "is_completed": False
        }
