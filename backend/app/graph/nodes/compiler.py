import re
from typing import Dict, Any
from ..state import AgentWorkflowState
from ...core.model_registry import model_registry

def compiler_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Dossier Compiler Node (DeepSeek-R1-8B / Hot-Swapped Model).
    Aggregates and formats internal University data against
    retrieved templates/standards to build compliance dossiers.
    """
    prompt = state.get("user_prompt", "")
    vision_output = state.get("vision_output", "")
    rag_context = state.get("rag_context", [])
    route_branch = state.get("route_branch", "audit_pipeline")
    framework = state.get("framework", "NAAC")
    active_model = state.get("active_model")
    if not active_model or active_model in ["auto", "default"]:
        active_model = model_registry.get_best_reasoning_model()

    # Format standards string
    standards_str = ""
    if rag_context:
        standards_str = "\n\n".join([
            f"--- KNOWLEDGE STANDARD: {c.get('standard', 'Company Standard')} // {c.get('section', 'General')} ---\n{c.get('content', '')}"
            for c in rag_context
        ])

    framework_rubrics = {
        "NAAC": "Criterion 1 (Curricular Aspects), Criterion 2 (Teaching-Learning & Evaluation), Criterion 3 (Research, Innovations & Extension), Criterion 4 (Infrastructure), Criterion 5 (Student Support), Criterion 6 (Governance), Criterion 7 (Institutional Values).",
        "UGC": "Category I (Teaching, Learning & Evaluation), Category II (Professional Development, Co-curricular Activities), Category III (Research & Academic Contributions - API Scores, Indexed Publications, Sponsored Projects).",
        "WASC": "CFR 1 (Defining Institutional Purposes & Educational Objectives), CFR 2 (Achieving Educational Objectives Through Core Functions), CFR 3 (Developing and Applying Resources and Organizational Structures), CFR 4 (Creating an Organization Committed to Quality Assurance).",
        "NIRF": "Teaching, Learning & Resources (TLR - 30%), Research and Professional Practice (RPC - 30%), Graduation Outcomes (GO - 20%), Outreach and Inclusivity (OI - 10%), Perception (PR - 10%).",
        "QAA": "Part A (Setting and Maintaining Academic Standards), Part B (Assuring and Enhancing Academic Quality), Part C (Information About Higher Education Provision).",
        "MDRA": "Objective & Perceptual Ranking Matrix: Academic Excellence, Infrastructure & Campus Living, Personality & Leadership Development, Career Progression & Placements.",
        "Hansa-Outlook": "Outlook-ICARE Parameters: Academic & Research Excellence, Industry Interface & Placement, Governance & Administration, Infrastructure & Facilities, Diversity & Outreach."
    }
    rubric_guideline = framework_rubrics.get(framework, "Official Statutory & Institutional Submission Standards.")

    system_prompt = (
        "You are an expert University Administrative Dossier Compiler. "
        "Your role is to format and compile internal university achievements, faculty profiles, and student records "
        f"into official submission dossiers required by external accreditation bodies ({framework}).\n"
        f"Target Framework Rubric: {rubric_guideline}\n"
        "You MUST answer the user's query based on the provided retrieved context. Extract matching data, structure it strictly under the framework's official rubric, and identify any documentation gaps."
    )

    if route_branch == "audit_pipeline":
        audit_prompt = (
            f"[AGENT 2: MULTIMODAL VISION EXTRACTION RESULTS]:\n{vision_output}\n\n"
        )
        if standards_str:
            audit_prompt += f"[AGENT 3: RETRIEVED STATUTORY KNOWLEDGE & PROFILES]:\n{standards_str}\n\n"

        audit_prompt += (
            f"[USER INSTRUCTION / OBJECTIVE]:\n{prompt or f'Compile {framework} academic compliance dossier on this document'}\n\n"
            f"Perform a meticulous {framework} dossier compilation:\n"
            f"1. Executive Summary: Overview of institution compliance under {framework}.\n"
            "2. Data Synthesis: Tabulate all relevant internal data points (faculty research, student achievements, campus events).\n"
            f"3. Rubric Alignment: Cross-reference and format the submission directly under the {framework} standard categories.\n"
            "4. Missing Data Flags: Clearly highlight any missing verification fields required for submission.\n"
            "5. Formal Submission Text: Generate a clean, structured output formatted for export to official Word (.docx) dossier."
        )
    else:
        audit_prompt = (
            f"[RETRIEVED ORGANIZATIONAL KNOWLEDGE & SOPS]:\n{standards_str}\n\n"
            f"[USER QUESTION / INQUIRY]:\n{prompt}\n\n"
            "Evaluate the user's inquiry strictly against the retrieved knowledge and SOPs. Provide a helpful, direct answer."
        )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": audit_prompt}
    ]

    statuses = dict(state.get("node_statuses", {}))
    steps = list(state.get("steps", []))
    logs = list(state.get("logs", []))

    statuses["compiler"] = "RUNNING"
    steps.append(f"Dossier Compiler aggregating data via {active_model}")
    trace = model_registry.query_llm_with_trace(
        model_name=active_model,
        messages=messages,
        temperature=0.2,
        max_tokens=1500,
        task_id=state.get("task_id")
    )
    raw_response = trace.get("content", "")

    thinking_content = ""
    clean_text = raw_response
    think_match = re.search(r"<think>([\s\S]*?)</think>", raw_response)
    if think_match:
        thinking_content = think_match.group(1).strip()
        clean_text = re.sub(r"<think>[\s\S]*?</think>", "", raw_response).strip()

    statuses["compiler"] = "COMPLETED"
    steps.append(f"Generated compliance dossier via {trace.get('model')} ({trace.get('latency_ms')} ms, {trace.get('tokens_per_sec')} tok/s)")
    logs.append(f"⚖️ [COMPILER - {active_model}] Completed dossier formatting in {trace.get('latency_ms')} ms.")

    import uuid
    import os
    from docx import Document
    from ...tools.office_styler import (
        add_executive_cover_page,
        configure_document_headers_footers,
        convert_markdown_to_rich_docx,
        add_official_sign_off_matrix
    )
    
    # Generate beautifully styled executive .docx file from the clean_text
    docx_filename = f"dossier_{framework}_{uuid.uuid4().hex[:6]}.docx"
    deliv_dir = os.path.join(os.getcwd(), "backend", "app", "assets", "deliverables")
    os.makedirs(deliv_dir, exist_ok=True)
    docx_path = os.path.join(deliv_dir, docx_filename)
    
    try:
        doc = Document()
        
        # 1. Executive Cover Page
        add_executive_cover_page(
            doc=doc,
            title=f"{framework} Academic Compliance Dossier",
            subtitle="Official Statutory Pre-Submission Evaluation & Documentation Gap Audit",
            framework=framework,
            department="University-Wide Academic Directorate"
        )
        
        # 2. Running Headers & Footers
        configure_document_headers_footers(doc, framework=framework)
        
        # 3. Rich Markdown & Table Converter
        convert_markdown_to_rich_docx(doc, markdown_content=clean_text, framework=framework)
        
        # 4. Official Sign-Off Block
        add_official_sign_off_matrix(doc)
                
        doc.save(docx_path)
        deliverable_url = f"/api/assets/deliverables/{docx_filename}"
    except Exception as e:
        deliverable_url = None
        logs.append(f"⚠️ Failed to generate .docx: {str(e)}")

    return {
        "active_node": "compiler",
        "response_text": clean_text,
        "thinking_content": thinking_content,
        "deliverable_docx": deliverable_url,
        "trace": trace,
        "node_statuses": statuses,
        "steps": steps,
        "logs": logs
    }
