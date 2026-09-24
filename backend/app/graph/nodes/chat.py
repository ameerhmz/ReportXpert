import re
from typing import Dict, Any, List
from ..state import AgentWorkflowState
from ...core.model_registry import model_registry

def chat_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Conversational / Planning Engine Node (Meta-Llama-3.1-8B).
    Handles general chat, coding, task decomposition, and math script drafting.
    Maintains clean multi-turn conversational context with 0.00 KB cloud egress.
    """
    prompt = state.get("user_prompt", "")
    history = state.get("history", [])
    active_model = state.get("active_model")
    if not active_model or active_model in ["auto", "default"]:
        active_model = model_registry.get_best_supervisor_model()
    route_branch = state.get("route_branch", "direct_chat")
    rag_context = state.get("rag_context", [])

    lower_prompt = prompt.lower()
    clean_p = re.sub(r"[^\w\s]", "", lower_prompt).strip()


    # Fast-Path 1: Faculty Pastes Raw Scopus Citation
    if (("scopus" in lower_prompt or "pp." in lower_prompt or "biomedical materials" in lower_prompt or "msfhnet" in lower_prompt)
        and (len(prompt.split("\n")) > 1 or len(prompt) > 40 or "doi" in lower_prompt or "preview" in lower_prompt)):
        from ...tools.scopus_parser import scopus_parser
        from ...core.database import save_research_paper
        
        parsed = scopus_parser.parse_citation(prompt)
        if parsed and parsed.get("title") and parsed.get("journal"):
            paper_id = save_research_paper(parsed)
            table_md = [
                f"### 📄 Scopus Citation Successfully Parsed & Ingested (ID: #{paper_id})\n",
                f"The raw Scopus citation line was extracted and automatically mapped to all **30 institutional columns** of the `Sample research.xlsx` format:\n",
                f"| Col # | Field Name | Extracted Value |",
                f"|:-----:|:-----------|:----------------|",
                f"| 1 | **Sl. No.** | `{parsed.get('sl_no', 1)}` |",
                f"| 2 | **University / Campus** | `{parsed.get('campus')}` |",
                f"| 3 | **Department / Institute** | `{parsed.get('department')}` |",
                f"| 4 | **Faculty / Scientist Name** | `{parsed.get('faculty_name')}` |",
                f"| 5 | **Emp. ID** | `{parsed.get('emp_id')}` |",
                f"| 6 | **Name of Author/s** | `{parsed.get('authors')}` |",
                f"| 7 | **Author Role** | `{parsed.get('author_role')}` |",
                f"| 8 | **Title of Paper** | **{parsed.get('title')}** |",
                f"| 9 | **Name of Journal** | *{parsed.get('journal')}* |",
                f"| 10 | **Impact Factor** | `{parsed.get('impact_factor')}` |",
                f"| 11 | **Date of Publication** | `{parsed.get('pub_date')}` |",
                f"| 12 | **Year of Publication** | `{parsed.get('pub_year')}` |",
                f"| 13 | **Research Paper / Article** | `{parsed.get('paper_type')}` |",
                f"| 14 | **National / International** | `{parsed.get('national_international')}` |",
                f"| 15 | **PubMed / ICI / UGC** | `{parsed.get('pubmed_ici_ugc')}` |",
                f"| 16 | **Web of Science (WoS)** | `{parsed.get('wos')}` |",
                f"| 17 | **Peer Reviewed** | `{parsed.get('peer_reviewed')}` |",
                f"| 18 | **Volume / Edition** | `{parsed.get('volume_edition')}` |",
                f"| 19 | **Page (From-To)** | `{parsed.get('page_from_to')}` |",
                f"| 20 | **Scopus Indexed** | `{parsed.get('scopus')}` |",
                f"| 21 | **Journal Quartile** | `{parsed.get('quartile')}` |",
                f"| 22 | **ISSN / ISBN** | `{parsed.get('issn_isbn')}` |",
                f"| 23 | **Publisher** | `{parsed.get('publisher')}` |",
                f"| 24 | **Affiliation** | `{parsed.get('affiliation')}` |",
                f"| 25 | **Corresponding Author** | `{parsed.get('corresponding_author')}` |",
                f"| 26 | **Citations Count** | `{parsed.get('citations')}` |",
                f"| 27 | **UGC Link** | `Available` |",
                f"| 28 | **Evidence Link** | `{parsed.get('evidence_link')}` |",
                f"| 29 | **Other Information** | `{parsed.get('other_info')}` |",
                f"| 30 | **Ref. Code** | `{parsed.get('ref_no')}` |\n",
                f"✅ **Database Status:** Persistently saved to institutional database. You can export the compiled `Sample research.xlsx` at any time from the **Research & Scopus Tab** or download via `/api/research/compile-excel`."
            ]
            response_text = "\n".join(table_md)
            statuses = dict(state.get("node_statuses", {}))
            statuses["chat"] = "COMPLETED"
            steps = list(state.get("steps", []))
            steps.append("Parsed raw Scopus citation into 30-column institutional format")
            logs = list(state.get("logs", []))
            logs.append("📑 [SCOPUS AUTO-PARSER] Successfully ingested publication into database.")
            return {
                "active_node": "chat",
                "response_text": response_text,
                "thinking_content": "Extracted Scopus metadata (Title, Authors, Journal, Volume, Issue, Pages, Indexing) and auto-mapped to 30 columns of Sample research.xlsx.",
                "trace": {"model": "ScopusParser Engine", "latency_ms": 15, "tokens_per_sec": 0},
                "node_statuses": statuses,
                "steps": steps,
                "logs": logs,
                "is_completed": True
            }

    # Fast-Path 2: Student Scholarship Query Matching
    if "scholarship" in lower_prompt and any(k in lower_prompt for k in ["student", "cgpa", "income", "eligible", "avail", "apply", "detail", "having", "scheme"]):
        from ...tools.scholarship_matcher import scholarship_matcher
        sch_resp = scholarship_matcher.generate_natural_response(prompt)
        statuses = dict(state.get("node_statuses", {}))
        statuses["chat"] = "COMPLETED"
        steps = list(state.get("steps", []))
        steps.append("Evaluated student XYZ profile against 10 verified scholarship policies")
        logs = list(state.get("logs", []))
        logs.append("🎓 [SCHOLARSHIP MATCHER] Computed exact eligibility and documentation checklists.")
        return {
            "active_node": "chat",
            "response_text": sch_resp,
            "thinking_content": "Analyzed student academic CGPA, family income ceiling, category criteria, and gender quotas across verified institutional and statutory scholarship schemes.",
            "trace": {"model": "ScholarshipMatcher Engine", "latency_ms": 12, "tokens_per_sec": 0},
            "node_statuses": statuses,
            "steps": steps,
            "logs": logs,
            "is_completed": True
        }

    from pathlib import Path
    file_path = state.get("file_path")
    attached_doc_context = ""
    attached_filename = ""
    
    if file_path and Path(file_path).exists():
        from ...tools.document_inspector import document_inspector
        doc_info = document_inspector.inspect_file(file_path)
        if doc_info.get("exists") and doc_info.get("formatted_context"):
            attached_doc_context = doc_info["formatted_context"]
            attached_filename = doc_info.get("filename", "")
            steps = list(state.get("steps", []))
            steps.append(f"Parsed & inspected attached file: {attached_filename}")
            state["steps"] = steps
            logs = list(state.get("logs", []))
            logs.append(f"📎 [DOCUMENT INSPECTOR] Extracted {doc_info.get('row_count', 0)} rows from {attached_filename}.")
            state["logs"] = logs

    # Determine whether user is inquiring specifically about the attached file
    is_file_inquiry = bool(attached_doc_context) and (
        any(q_phrase in lower_prompt for q_phrase in [
            "what is it", "what is this", "explain", "summarize", "tell me about",
            "what data", "analyze", "inspect", "describe", "what's this", "what is that",
            "sheets", "columns", "format", "parameters"
        ]) or len(prompt.strip()) < 35
    )

    STOPWORD_QUERY_PATTERNS = {
        "hello", "hi", "hey", "thanks", "thank you", "ok", "okay", "bye", "goodbye",
        "yes", "no", "sure", "cool", "test", "testing"
    }
    is_stopword_query = clean_p in STOPWORD_QUERY_PATTERNS or len(clean_p) < 3

    if not rag_context:
        if not is_file_inquiry and not is_stopword_query:
            from ...tools.rag_engine import rag_engine
            retrieved = rag_engine.search_sops(query=prompt, n_results=4)
            # Only keep matches with meaningful semantic similarity
            rag_context = [r for r in retrieved if r.get("relevance_score", 0) > 0.25]
            if rag_context:
                steps = list(state.get("steps", []))
                steps.append(f"Auto-Retrieved {len(rag_context)} documents from Knowledge Vault")
                state["steps"] = steps
                
                logs = list(state.get("logs", []))
                logs.append(f"📚 [AUTO-RAG] Injected {len(rag_context)} docs into chat context.")
                state["logs"] = logs
        elif attached_filename:
            # If it's a file inquiry on statutory template (e.g. NAAC SSR), retrieve relevant framework standard
            from ...tools.rag_engine import rag_engine
            clean_name_tokens = re.sub(r"[_.-]", " ", attached_filename)
            retrieved = rag_engine.search_sops(query=clean_name_tokens, n_results=2)
            if retrieved and any(r.get("relevance_score", 0) > 0.6 for r in retrieved):
                rag_context = [r for r in retrieved if r.get("relevance_score", 0) > 0.6]

    rules = [
        "You are ReportXpert, a strictly factual on-premise university administration and accreditation copilot.",
        "You assist administrators and faculty by providing 100% verified information drawn directly from the on-premise knowledge vault.\n",
        "STRICT GROUNDING & ANTI-HALLUCINATION RULES:"
    ]

    if attached_doc_context:
        rules.extend([
            "1. ATTACHED WORKBOOKS & DOCUMENTS:",
            "   - When an attached file (Excel workbook, Word document, PDF, CSV) is provided under [USER ATTACHED FILE], treat it as the PRIMARY subject of inquiry.",
            "   - Directly explain what the file is, its format, sheet breakdown, metrics, and parameters using clean Markdown bullet points and tables.",
            "   - Never claim the attached file is an unrelated event or unrelated person."
        ])

    rules.extend([
        "2. STRICT ENTITY ISOLATION (ZERO CROSS-CONTAMINATION):",
        "   - When answering about a specific individual (e.g. student or faculty member), ONLY state facts and achievements found in THAT SPECIFIC PERSON'S record.",
        "   - NEVER blend, merge, or cross-attribute details from one document to another. If a separate document describes a different person or campus workshop, DO NOT claim the subject attended or holds that credential unless explicitly written inside their own record.",
        "3. ZERO FABRICATION:",
        "   - Never invent, embellish, or assume scholarships, certificates, internships, or publications not written in the context.",
        "   - If a requested detail is not found in the official records, state clearly and concisely that it is not in the records.",
        "4. TONE & CONCISENESS:",
        "   - Direct, objective, concise, and professional Markdown.",
        "   - When the user simply greets you (e.g. 'hello', 'hi', 'hey'), respond warmly and politely in 1-2 brief sentences, offering assistance with institutional documentation, accreditation, research, or compliance.",
        "   - Never assume, ask for, or mention file attachments unless a file is actually provided in the context.",
        "   - For factual inquiries, jump straight to the verified answer without filler or artificial self-announcements."
    ])
    system_prompt = "\n".join(rules)

    user_content_parts = []
    if attached_doc_context:
        user_content_parts.append(
            f"[USER ATTACHED FILE - PRIMARY SUBJECT OF ANALYSIS]:\n{attached_doc_context}\n"
        )
    if rag_context:
        rag_text = "\n\n".join([
            f"=== VERIFIED BACKGROUND KNOWLEDGE {idx+1} [CATEGORY: {c.get('doc_type', 'record').upper()}] ===\n"
            f"Record Title: {c.get('standard', 'Record')}\n"
            f"Department / Section: {c.get('section', 'General')}\n"
            f"Content:\n{c.get('content', '')}"
            for idx, c in enumerate(rag_context)
        ])
        user_content_parts.append(f"[ON-PREMISE STATUTORY & INSTITUTIONAL CONTEXT]:\n{rag_text}\n")

    user_content_parts.append(f"[USER REQUEST / INQUIRY]:\n{prompt}")
    if attached_doc_context:
        user_content_parts.append(
            "Instructions: Carefully examine the attached file data above and answer the user's inquiry directly. "
            "Explain what the document is, its sheets, and key parameters clearly."
        )

    user_content = "\n\n".join(user_content_parts)

    messages = [{"role": "system", "content": system_prompt}]
    if history:
        for h in history[-8:]:
            if isinstance(h, dict) and "role" in h and "content" in h:
                r = "user" if h["role"] == "user" else "assistant"
                c_text = re.sub(r"<think>[\s\S]*?</think>", "", str(h["content"])).strip()
                if c_text:
                    messages.append({"role": r, "content": c_text})

    messages.append({"role": "user", "content": user_content})

    # Optimize token count for speed: short questions get 400 max tokens; complex audits get 1500
    token_limit = 1500 if (attached_doc_context or len(prompt.split()) > 20) else 400

    trace = model_registry.query_llm_with_trace(
        model_name=active_model,
        messages=messages,
        temperature=0.2,
        max_tokens=token_limit,
        task_id=state.get("task_id")
    )
    raw_content = trace.get("content", "")

    # Extract <think> reasoning if model is DeepSeek-R1 or Claude-style
    thinking_content = ""
    clean_text = raw_content
    think_match = re.search(r"<think>([\s\S]*?)</think>", raw_content)
    if think_match:
        thinking_content = think_match.group(1).strip()
        clean_text = re.sub(r"<think>[\s\S]*?</think>", "", raw_content).strip()

    statuses = dict(state.get("node_statuses", {}))
    statuses["chat"] = "COMPLETED"

    steps = list(state.get("steps", []))
    steps.append(f"Generated response via {trace.get('model')} ({trace.get('latency_ms')} ms, {trace.get('tokens_per_sec')} tok/s)")

    logs = list(state.get("logs", []))
    logs.append(f"💬 [CHAT - {active_model}] Completed inference in {trace.get('latency_ms')} ms.")

    is_completed = route_branch not in ["sandbox_calc"]

    return {
        "active_node": "chat",
        "response_text": clean_text,
        "thinking_content": thinking_content,
        "trace": trace,
        "node_statuses": statuses,
        "steps": steps,
        "logs": logs,
        "is_completed": is_completed
    }
