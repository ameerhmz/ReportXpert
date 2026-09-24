import sqlite3
import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional
from .config import settings

DB_PATH = settings.DATA_DIR / "workbench.db"

def get_db_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes persistent SQLite database for tasks and deliverables history."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Tasks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            task_id TEXT PRIMARY KEY,
            prompt TEXT NOT NULL,
            task_type TEXT,
            status TEXT,
            active_node TEXT,
            model_used TEXT,
            deliverables_json TEXT,
            logs_json TEXT,
            created_at REAL,
            completed_at REAL,
            response_text TEXT
        )
    """)
    try:
        cursor.execute("ALTER TABLE tasks ADD COLUMN response_text TEXT")
        conn.commit()
    except Exception:
        pass

    # Incidents table (Scenario 2)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            incident_id TEXT PRIMARY KEY,
            location TEXT,
            description TEXT,
            is_sif_precursor INTEGER,
            risk_classification TEXT,
            violated_standard TEXT,
            deliverable_docx TEXT,
            created_at REAL
        )
    """)

    # Engineering Calculations table (Scenario 3)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS calculations (
            calc_id TEXT PRIMARY KEY,
            line_id TEXT,
            circuit_tag TEXT,
            nominal_thk REAL,
            actual_thk REAL,
            min_req_thk REAL,
            corrosion_rate REAL,
            remaining_life_years REAL,
            is_safe INTEGER,
            chart_image_path TEXT,
            deliverable_xlsx TEXT,
            created_at REAL
        )
    """)

    # Research Papers table (Sample research.xlsx 30-column alignment)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS research_papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sl_no INTEGER,
            campus TEXT,
            department TEXT,
            faculty_name TEXT,
            emp_id TEXT,
            authors TEXT,
            author_role TEXT,
            title TEXT NOT NULL,
            journal TEXT,
            impact_factor TEXT,
            pub_date TEXT,
            pub_year INTEGER,
            paper_type TEXT,
            national_international TEXT,
            pubmed_ici_ugc TEXT,
            wos TEXT,
            peer_reviewed TEXT,
            volume_edition TEXT,
            page_from_to TEXT,
            scopus TEXT,
            quartile TEXT,
            issn_isbn TEXT,
            publisher TEXT,
            affiliation TEXT,
            corresponding_author TEXT,
            citations INTEGER DEFAULT 0,
            ugc_link TEXT,
            evidence_link TEXT,
            other_info TEXT,
            ref_no TEXT,
            raw_citation TEXT,
            created_at REAL
        )
    """)

    # Scholarships table for student XYZ matching
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scholarships (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT,
            min_cgpa REAL DEFAULT 0.0,
            max_income_lakhs REAL DEFAULT 100.0,
            target_gender TEXT DEFAULT 'ALL',
            target_departments TEXT DEFAULT 'ALL',
            financial_benefit TEXT,
            documents_required TEXT,
            sponsoring_agency TEXT,
            description TEXT,
            created_at REAL
        )
    """)

    conn.commit()
    conn.close()

# Initialize tables immediately
init_db()

def save_task(task_data: Dict[str, Any]):
    """Saves completed task details to SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO tasks (
            task_id, prompt, task_type, status, active_node, model_used, deliverables_json, logs_json, created_at, completed_at, response_text
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        task_data.get("task_id"),
        task_data.get("user_prompt", ""),
        task_data.get("task_type", "DOCUMENT_AUDIT"),
        task_data.get("status", "COMPLETED"),
        task_data.get("active_node", "done"),
        task_data.get("model_routing", {}).get("selected_model", "Auto-Routed"),
        json.dumps(task_data.get("deliverables", {})),
        json.dumps(task_data.get("logs", [])),
        task_data.get("created_at", time.time()),
        time.time(),
        task_data.get("response", "")
    ))
    conn.commit()
    conn.close()

def get_all_tasks(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    tasks = []
    for r in rows:
        tasks.append({
            "task_id": r["task_id"],
            "prompt": r["prompt"],
            "response": r["response_text"] if "response_text" in r.keys() and r["response_text"] else "",
            "task_type": r["task_type"],
            "status": r["status"],
            "active_node": r["active_node"],
            "model_used": r["model_used"],
            "deliverables": json.loads(r["deliverables_json"] or "{}"),
            "logs": json.loads(r["logs_json"] or "[]"),
            "created_at": r["created_at"],
            "completed_at": r["completed_at"]
        })
    conn.close()
    return tasks

def delete_task(task_id: str) -> bool:
    """Deletes a specific task from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
    deleted = cursor.rowcount > 0
    if not deleted and "-" in task_id:
        # Match by suffix or substring in case ID format differed between frontend and backend
        suffix = task_id.split("-", 1)[-1]
        cursor.execute("DELETE FROM tasks WHERE task_id LIKE ?", (f"%{suffix}%",))
        deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def delete_all_tasks() -> int:
    """Deletes all tasks from SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tasks")
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted_count


def save_incident(inc_data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO incidents (
            incident_id, location, description, is_sif_precursor, risk_classification, violated_standard, deliverable_docx, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        inc_data.get("incident_id"),
        inc_data.get("location"),
        inc_data.get("description"),
        1 if inc_data.get("is_sif_precursor") else 0,
        inc_data.get("risk_classification"),
        inc_data.get("violated_standard"),
        inc_data.get("deliverable_docx"),
        time.time()
    ))
    conn.commit()
    conn.close()

def get_all_incidents(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    incidents = []
    for r in rows:
        incidents.append({
            "incident_id": r["incident_id"],
            "location": r["location"],
            "description": r["description"],
            "is_sif_precursor": bool(r["is_sif_precursor"]),
            "risk_classification": r["risk_classification"],
            "violated_standard": r["violated_standard"],
            "deliverable_docx": r["deliverable_docx"],
            "created_at": r["created_at"]
        })
    conn.close()
    return incidents

def save_calculation(calc_data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO calculations (
            calc_id, line_id, circuit_tag, nominal_thk, actual_thk, min_req_thk, corrosion_rate, remaining_life_years, is_safe, chart_image_path, deliverable_xlsx, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        calc_data.get("calc_id"),
        calc_data.get("line_id"),
        calc_data.get("circuit_tag"),
        calc_data.get("nominal_thk"),
        calc_data.get("actual_thk"),
        calc_data.get("min_req_thk"),
        calc_data.get("corrosion_rate"),
        calc_data.get("remaining_life_years"),
        1 if calc_data.get("is_safe") else 0,
        calc_data.get("chart_image_path"),
        calc_data.get("deliverable_xlsx"),
        time.time()
    ))
    conn.commit()
    conn.close()

def get_all_calculations(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM calculations ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    calcs = []
    for r in rows:
        calcs.append({
            "calc_id": r["calc_id"],
            "line_id": r["line_id"],
            "circuit_tag": r["circuit_tag"],
            "nominal_thk": r["nominal_thk"],
            "actual_thk": r["actual_thk"],
            "min_req_thk": r["min_req_thk"],
            "corrosion_rate": r["corrosion_rate"],
            "remaining_life_years": r["remaining_life_years"],
            "is_safe": bool(r["is_safe"]),
            "chart_image_path": r["chart_image_path"],
            "deliverable_xlsx": r["deliverable_xlsx"],
            "created_at": r["created_at"]
        })
    conn.close()
    return calcs

# -----------------------------------------------------------------------------
# Research Papers CRUD (Sample research.xlsx alignment)
# -----------------------------------------------------------------------------
def save_research_paper(paper_data: Dict[str, Any]) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO research_papers (
            sl_no, campus, department, faculty_name, emp_id, authors, author_role,
            title, journal, impact_factor, pub_date, pub_year, paper_type,
            national_international, pubmed_ici_ugc, wos, peer_reviewed,
            volume_edition, page_from_to, scopus, quartile, issn_isbn,
            publisher, affiliation, corresponding_author, citations,
            ugc_link, evidence_link, other_info, ref_no, raw_citation, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        paper_data.get("sl_no"),
        paper_data.get("campus", "AUUP, Lucknow"),
        paper_data.get("department", "AIIT"),
        paper_data.get("faculty_name", "Dr. Meenakshi Srivastava"),
        paper_data.get("emp_id", "3019"),
        paper_data.get("authors", ""),
        paper_data.get("author_role", "Corresponding Author"),
        paper_data.get("title", ""),
        paper_data.get("journal", ""),
        paper_data.get("impact_factor", ""),
        paper_data.get("pub_date", ""),
        paper_data.get("pub_year", 2026),
        paper_data.get("paper_type", "Research Paper"),
        paper_data.get("national_international", "International"),
        paper_data.get("pubmed_ici_ugc", "UGC & Others"),
        paper_data.get("wos", "Yes"),
        paper_data.get("peer_reviewed", "Yes"),
        paper_data.get("volume_edition", ""),
        paper_data.get("page_from_to", ""),
        paper_data.get("scopus", "Yes"),
        paper_data.get("quartile", "Q1"),
        paper_data.get("issn_isbn", ""),
        paper_data.get("publisher", ""),
        paper_data.get("affiliation", "AUUP Lucknow"),
        paper_data.get("corresponding_author", ""),
        paper_data.get("citations", 0),
        paper_data.get("ugc_link", ""),
        paper_data.get("evidence_link", ""),
        paper_data.get("other_info", ""),
        paper_data.get("ref_no", ""),
        paper_data.get("raw_citation", ""),
        paper_data.get("created_at", time.time())
    ))
    paper_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return paper_id

def get_all_research_papers(limit: int = 500, faculty: Optional[str] = None, department: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM research_papers WHERE 1=1"
    params = []
    if faculty:
        query += " AND faculty_name LIKE ?"
        params.append(f"%{faculty}%")
    if department:
        query += " AND department LIKE ?"
        params.append(f"%{department}%")
    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, tuple(params))
    rows = cursor.fetchall()
    papers = [dict(r) for r in rows]
    conn.close()
    return papers

def delete_research_paper(paper_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM research_papers WHERE id = ?", (paper_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# -----------------------------------------------------------------------------
# Scholarships CRUD (Student XYZ matching)
# -----------------------------------------------------------------------------
def save_scholarship(sch_data: Dict[str, Any]):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO scholarships (
            id, name, category, min_cgpa, max_income_lakhs, target_gender,
            target_departments, financial_benefit, documents_required,
            sponsoring_agency, description, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sch_data.get("id"),
        sch_data.get("name"),
        sch_data.get("category", "General"),
        sch_data.get("min_cgpa", 0.0),
        sch_data.get("max_income_lakhs", 100.0),
        sch_data.get("target_gender", "ALL"),
        json.dumps(sch_data.get("target_departments")) if isinstance(sch_data.get("target_departments"), list) else str(sch_data.get("target_departments", "ALL")),
        sch_data.get("financial_benefit", ""),
        json.dumps(sch_data.get("documents_required")) if isinstance(sch_data.get("documents_required"), list) else str(sch_data.get("documents_required", "")),
        sch_data.get("sponsoring_agency", "University / Govt"),
        sch_data.get("description", ""),
        sch_data.get("created_at", time.time())
    ))
    conn.commit()
    conn.close()

def get_all_scholarships() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scholarships ORDER BY min_cgpa DESC")
    rows = cursor.fetchall()
    schs = [dict(r) for r in rows]
    conn.close()
    return schs
