"""
ReportXpert Multi-Format Document Inspector & Content Extractor
Extracts, structures, and converts attached files (Excel, CSV, Word, PDF, Text)
into rich Markdown context for LangGraph Copilot & Specialist Agents.
"""

import io
import re
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd

logger = logging.getLogger("document_inspector")

def _df_to_markdown(df: pd.DataFrame) -> str:
    """Pure-Python markdown table converter with zero external dependencies."""
    if df.empty:
        return ""
    cols = [str(c).strip() for c in df.columns]
    header = "| " + " | ".join(cols) + " |"
    separator = "| " + " | ".join(["---"] * len(cols)) + " |"
    rows = []
    for _, row in df.iterrows():
        cells = [str(val).replace("\n", " ").strip() if pd.notna(val) else "" for val in row]
        rows.append("| " + " | ".join(cells) + " |")
    return "\n".join([header, separator] + rows)

class DocumentInspector:
    def __init__(self):
        pass

    def inspect_file(self, file_path: str) -> Dict[str, Any]:
        """
        Inspects an uploaded file from disk and returns structured metadata,
        document category, sheet/page structure, and formatted markdown content.
        """
        p = Path(file_path)
        if not p.exists():
            return {
                "exists": False,
                "error": f"File not found on disk: {file_path}",
                "formatted_context": ""
            }

        ext = p.suffix.lower()
        raw_filename = p.name
        # Strip internal task prefix like TASK-5C85CE_
        clean_filename = re.sub(r"^TASK-[A-Za-z0-9]+_", "", raw_filename)
        file_size_kb = round(p.stat().st_size / 1024, 2)

        result: Dict[str, Any] = {
            "exists": True,
            "file_path": str(p),
            "filename": clean_filename,
            "raw_filename": raw_filename,
            "extension": ext,
            "size_kb": file_size_kb,
            "sheets": [],
            "row_count": 0,
            "doc_category": "General Document",
            "formatted_context": ""
        }

        try:
            if ext in [".xlsx", ".xls", ".xscl", ".xlsm"]:
                self._inspect_excel(p, result)
            elif ext == ".csv":
                self._inspect_csv(p, result)
            elif ext == ".docx":
                self._inspect_docx(p, result)
            elif ext == ".pdf":
                self._inspect_pdf(p, result)
            else:
                self._inspect_text(p, result)
        except Exception as e:
            logger.error(f"Error inspecting document {file_path}: {e}", exc_info=True)
            result["error"] = str(e)
            result["formatted_context"] = f"Attached File: {clean_filename} (Size: {file_size_kb} KB)\nError parsing file: {e}"

        return result

    def _inspect_excel(self, p: Path, result: Dict[str, Any]):
        xl = pd.ExcelFile(p)
        sheet_names = xl.sheet_names
        result["sheets"] = sheet_names
        
        md_sections = []
        md_sections.append(f"### 📊 ATTACHED WORKBOOK: `{result['filename']}`")
        md_sections.append(f"- **Format**: Microsoft Excel Spreadsheet (`{result['extension']}`)")
        md_sections.append(f"- **File Size**: {result['size_kb']} KB")
        md_sections.append(f"- **Total Sheets ({len(sheet_names)})**: {', '.join([f'`{s}`' for s in sheet_names])}\n")

        total_rows = 0
        for s in sheet_names:
            df = pd.read_excel(xl, sheet_name=s)
            r_count = len(df)
            total_rows += r_count
            cols = [str(c).strip() for c in df.columns]
            
            md_sections.append(f"#### Sheet: `{s}` ({r_count} rows, {len(cols)} columns)")
            md_sections.append(f"**Columns**: {', '.join([f'`{c}`' for c in cols])}")
            
            # If sheet is a parameter key-value summary (like NAAC_SSR_Summary)
            if len(cols) == 2 and any(k in cols[0].lower() for k in ["parameter", "metric", "key", "property"]):
                md_sections.append("\n**Key Parameters:**")
                for _, row in df.head(15).iterrows():
                    param = str(row[cols[0]]).strip()
                    val = str(row[cols[1]]).strip()
                    if param and param.lower() != "nan":
                        md_sections.append(f"- **{param}**: {val}")
                md_sections.append("")
            else:
                # Tabular sample rows
                if not df.empty:
                    preview_df = df.head(6)
                    md_table = _df_to_markdown(preview_df)
                    md_sections.append(f"\n{md_table}\n")
                    if r_count > 6:
                        md_sections.append(f"*... and {r_count - 6} more rows in sheet `{s}`*\n")

        result["row_count"] = total_rows
        result["formatted_context"] = "\n".join(md_sections)

    def _inspect_csv(self, p: Path, result: Dict[str, Any]):
        df = pd.read_csv(p)
        cols = [str(c).strip() for c in df.columns]
        result["row_count"] = len(df)
        
        md_sections = []
        md_sections.append(f"### 📋 ATTACHED SPREADSHEET: `{result['filename']}`")
        md_sections.append(f"- **Format**: CSV Spreadsheet (`{result['extension']}`)")
        md_sections.append(f"- **Dimensions**: {len(df)} rows × {len(cols)} columns")
        md_sections.append(f"- **Columns**: {', '.join([f'`{c}`' for c in cols])}\n")
        
        if not df.empty:
            md_sections.append("**Sample Data (First 8 Rows):**")
            md_sections.append(_df_to_markdown(df.head(8)))
            if len(df) > 8:
                md_sections.append(f"\n*... and {len(df) - 8} more rows in CSV dataset*")
                
        result["formatted_context"] = "\n".join(md_sections)

    def _inspect_docx(self, p: Path, result: Dict[str, Any]):
        from docx import Document
        doc = Document(p)
        paragraphs = [p_text.text.strip() for p_text in doc.paragraphs if p_text.text.strip()]
        
        md_sections = []
        md_sections.append(f"### 📄 ATTACHED DOCUMENT: `{result['filename']}`")
        md_sections.append(f"- **Format**: Microsoft Word Document (`.docx`)")
        md_sections.append(f"- **Paragraphs**: {len(paragraphs)} | **Tables**: {len(doc.tables)}")
        
        if paragraphs:
            md_sections.append("\n**Document Headings & Excerpt:**")
            md_sections.append("\n\n".join(paragraphs[:15]))
            if len(paragraphs) > 15:
                md_sections.append(f"\n*... and {len(paragraphs) - 15} additional paragraphs in document*")
                
        if doc.tables:
            md_sections.append(f"\n**Embedded Tables ({len(doc.tables)} found):**")
            for t_idx, table in enumerate(doc.tables[:2]):
                table_rows = []
                for row in table.rows[:6]:
                    table_rows.append([cell.text.strip() for cell in row.cells])
                if table_rows:
                    header = table_rows[0]
                    t_df = pd.DataFrame(table_rows[1:], columns=header if len(header) == len(table_rows[1]) else None)
                    md_sections.append(f"\n*Table {t_idx+1}:*\n{_df_to_markdown(t_df)}")

        result["formatted_context"] = "\n".join(md_sections)

    def _inspect_pdf(self, p: Path, result: Dict[str, Any]):
        from pypdf import PdfReader
        reader = PdfReader(p)
        num_pages = len(reader.pages)
        
        md_sections = []
        md_sections.append(f"### 📑 ATTACHED PDF DOCUMENT: `{result['filename']}`")
        md_sections.append(f"- **Format**: Portable Document Format (`.pdf`)")
        md_sections.append(f"- **Total Pages**: {num_pages}")
        
        extracted_text = []
        for i in range(min(num_pages, 5)):
            txt = reader.pages[i].extract_text() or ""
            if txt.strip():
                extracted_text.append(f"--- Page {i+1} ---\n{txt.strip()[:1000]}")
                
        if extracted_text:
            md_sections.append("\n**Document Content Preview:**")
            md_sections.append("\n\n".join(extracted_text))
            if num_pages > 5:
                md_sections.append(f"\n*... and {num_pages - 5} additional pages in PDF*")

        result["formatted_context"] = "\n".join(md_sections)

    def _inspect_text(self, p: Path, result: Dict[str, Any]):
        content = p.read_text(encoding="utf-8", errors="ignore")
        lines = content.splitlines()
        
        md_sections = []
        md_sections.append(f"### 📝 ATTACHED TEXT FILE: `{result['filename']}`")
        md_sections.append(f"- **Lines**: {len(lines)} | **Characters**: {len(content)}")
        md_sections.append("\n**Content Preview:**")
        md_sections.append("\n".join(lines[:40]))
        if len(lines) > 40:
            md_sections.append(f"\n*... and {len(lines) - 40} more lines*")
            
        result["formatted_context"] = "\n".join(md_sections)

document_inspector = DocumentInspector()
