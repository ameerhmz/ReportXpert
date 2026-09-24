from langgraph.graph import StateGraph, START, END
from .state import AgentWorkflowState
from .nodes.supervisor import supervisor_node
from .nodes.vision import vision_node
from .nodes.rag import rag_node
from .nodes.chat import chat_node
from .nodes.sandbox import sandbox_node
from .nodes.compiler import compiler_node

def route_from_supervisor(state: AgentWorkflowState) -> str:
    """Branches execution dynamically based on user intent and asset type."""
    branch = state.get("route_branch", "direct_chat")
    if branch in ("vision_direct", "audit_pipeline"):
        return "vision"
    elif branch in ("compile_pipeline", "standards_rag"):
        return "rag"
    elif branch == "sandbox_calc":
        return "chat"
    return "chat"

def route_from_vision(state: AgentWorkflowState) -> str:
    """Branches vision output: direct fast-path exits; audit pipeline moves to Knowledge Vault."""
    branch = state.get("route_branch", "vision_direct")
    if branch == "vision_direct":
        return END
    return "rag"

def route_from_rag(state: AgentWorkflowState) -> str:
    """Branches RAG output: official dossier compilation proceeds to compiler; questions proceed to chat."""
    branch = state.get("route_branch", "direct_chat")
    if branch in ("audit_pipeline", "compile_pipeline"):
        return "compiler"
    return "chat"

def route_from_chat(state: AgentWorkflowState) -> str:
    """Branches chat output: calculations proceed to sandbox runner; normal chat exits."""
    branch = state.get("route_branch", "direct_chat")
    if branch == "sandbox_calc":
        return "sandbox"
    return END

def route_from_compiler(state: AgentWorkflowState) -> str:
    """Branches compiler output: exits after dossier generation."""
    return END

def build_workbench_graph():
    """
    Constructs the official conditional LangGraph state machine for ReportXpert.
    Supports dynamic branch routing across specialist agents:
    - Vision Direct (Qwen2.5-VL)
    - Full Engineering Compiler Pipeline (Vision ➔ RAG ➔ Compiler)
    - Verified Sandbox Math (Chat ➔ Sandbox ➔ Compiler)
    - Standards Q&A (RAG ➔ Chat)
    - Dossier Compilation (RAG ➔ Compiler)
    - Direct Conversational (Chat)
    """
    workflow = StateGraph(AgentWorkflowState)

    # 1. Register Specialist Agent Nodes
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("vision", vision_node)
    workflow.add_node("rag", rag_node)
    workflow.add_node("chat", chat_node)
    workflow.add_node("sandbox", sandbox_node)
    workflow.add_node("compiler", compiler_node)

    # 2. Entrypoint
    workflow.add_edge(START, "supervisor")

    # 3. Dynamic Conditional Routing from Supervisor
    workflow.add_conditional_edges(
        "supervisor",
        route_from_supervisor,
        {
            "vision": "vision",
            "chat": "chat",
            "rag": "rag"
        }
    )

    # 4. Conditional Edge from Vision
    workflow.add_conditional_edges(
        "vision",
        route_from_vision,
        {
            END: END,
            "rag": "rag"
        }
    )

    # 5. Conditional Edge from RAG ➔ Compiler (for reports) or Chat (for Q&A)
    workflow.add_conditional_edges(
        "rag",
        route_from_rag,
        {
            "compiler": "compiler",
            "chat": "chat"
        }
    )

    # 6. Edge from Compiler
    workflow.add_edge("compiler", END)

    # 7. Conditional Edge from Chat
    workflow.add_conditional_edges(
        "chat",
        route_from_chat,
        {
            "sandbox": "sandbox",
            END: END
        }
    )

    # 8. Edge from Sandbox
    workflow.add_edge("sandbox", "compiler")

    return workflow.compile()

# Pre-compiled executable sovereign workbench graph
workbench_graph = build_workbench_graph()
