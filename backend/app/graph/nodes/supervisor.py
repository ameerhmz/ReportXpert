from typing import Dict, Any
from pathlib import Path
from ..state import AgentWorkflowState
from ...core.model_registry import model_registry
from ...core.org_config import org_config

def supervisor_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Supervisor / Orchestrator Node (Meta-Llama-3.1-8B).
    Acts as the intelligent LangGraph entrypoint: analyzes user intent,
    inspects attached files, determines the dynamic branch route, and sets the execution plan.
    """
    prompt = state.get("user_prompt", "").strip()
    file_path = state.get("file_path")
    file_type = state.get("file_type", "")
    model_override = state.get("model_override")

    import re
    p_lower = prompt.lower()
    has_image = False
    has_doc = False
    clean_filename = ""
    if file_path:
        p_obj = Path(file_path)
        ext = p_obj.suffix.lower()
        has_image = ext in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]
        has_doc = ext in [".xlsx", ".xls", ".xscl", ".xlsm", ".csv", ".docx", ".pdf", ".txt", ".json"]
        clean_filename = re.sub(r"^TASK-[A-Za-z0-9]+_", "", p_obj.name)

    # 1. Detect dynamic LangGraph execution branch
    audit_keywords = org_config.audit_keywords
    is_audit = has_image and any(k in p_lower for k in audit_keywords)

    calc_keywords = org_config.calc_keywords
    is_calc = any(k in p_lower for k in calc_keywords)

    compile_keywords = [
        "compile", "dossier", "export docx", "generate report", "compliance report",
        "official dossier", "submission report", "accreditation report", "generate document"
    ]
    is_compile = any(k in p_lower for k in compile_keywords)

    standards_keywords = org_config.standards_keywords
    is_standards = any(k in p_lower for k in standards_keywords)

    if has_image and not is_audit:
        branch = "vision_direct"
        plan = ["Inspect attached image directly via Qwen2.5-VL 7B on Metal GPU", "Synthesize conversational response"]
    elif is_audit:
        branch = "audit_pipeline"
        plan = [
            "Extract visual structure & components (Vision AI)",
            "Query Knowledge Vault for compliance standards (BGE-M3 RAG)",
            "Perform compliance & anomaly reasoning (DeepSeek-R1)",
            "Compile formal statutory deliverables (.docx / .xlsx)"
        ]
    elif is_compile:
        branch = "compile_pipeline"
        plan = [
            f"Query Knowledge Vault & inspect {clean_filename or 'dossier data'}",
            "Compile formal statutory deliverables (.docx / .xlsx)"
        ]
    elif is_calc:
        branch = "sandbox_calc"
        plan = [
            f"Inspect dataset ({clean_filename}) & derive calculation script",
            "Execute calculation in verified Python 3.12 sandbox",
            "Compile verified calculation workbook (.xlsx)"
        ]
    elif has_doc:
        # Document inspection, explanation, or data Q&A
        branch = "direct_chat"
        plan = [
            f"Inspect & parse attached file: {clean_filename}",
            "Analyze sheets, metrics, and parameters",
            "Synthesize verified conversational breakdown"
        ]
    elif is_standards:
        branch = "standards_rag"
        plan = [
            "Search Knowledge Vault records & statutory codes (BGE-M3 RAG)",
            "Synthesize conversational response with on-premise citations"
        ]
    else:
        branch = "direct_chat"
        plan = ["Direct sovereign neural inference on Apple Silicon Metal GPU"]

    # 2. Dynamic Model Routing
    route = model_registry.route_task(prompt, has_image=has_image, file_extension=file_type)
    active_model = model_override if (model_override and model_override.lower() not in ["auto", "default", ""]) else route["selected_model"]

    statuses = dict(state.get("node_statuses", {}))
    statuses["supervisor"] = "COMPLETED"

    steps = list(state.get("steps", []))
    steps.append(f"LangGraph Supervisor routed task to branch: [{branch.upper()}] via {active_model}")

    logs = list(state.get("logs", []))
    logs.append(f"🎯 [SUPERVISOR] Task {state.get('task_id')} dynamically branched to '{branch}'.")

    return {
        "active_node": "supervisor",
        "route_branch": branch,
        "active_model": active_model,
        "plan": plan,
        "current_step_index": 1,
        "model_routing": route,
        "node_statuses": statuses,
        "steps": steps,
        "logs": logs
    }
