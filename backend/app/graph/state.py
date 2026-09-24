from typing import TypedDict, List, Dict, Any, Optional

class AgentWorkflowState(TypedDict, total=False):
    """
    Typed LangGraph state shared across all autonomous agent nodes in the workbench.
    Supports both conversational interactions and full engineering compliance workflows.
    """
    task_id: str
    user_prompt: str
    file_path: Optional[str]
    file_type: Optional[str]
    history: List[Dict[str, str]]
    model_override: Optional[str]
    framework: Optional[str]
    
    # Dynamic LangGraph Route Branch
    # "vision_direct" | "audit_pipeline" | "sandbox_calc" | "standards_rag" | "direct_chat"
    route_branch: str
    active_model: str

    # Task planning & decomposition
    plan: List[str]
    current_step_index: int
    active_node: str
    node_statuses: Dict[str, str]

    # Dynamic model routing info
    model_routing: Dict[str, Any]

    # Node intermediate outputs
    vision_findings: Dict[str, Any]
    vision_output: str
    rag_context: List[Dict[str, Any]]
    rag_sources: List[Dict[str, Any]]
    sandbox_output: Dict[str, Any]
    audit_findings: Dict[str, Any]

    # Final outputs & telemetry
    response_text: str
    thinking_content: str
    trace: Dict[str, Any]
    deliverables: Dict[str, str]

    # Execution logs & steps
    steps: List[str]
    logs: List[str]
    error: Optional[str]
    is_completed: bool
