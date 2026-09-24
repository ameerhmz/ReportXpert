"""
ReportXpert Premium Office Document Design & Styling Engine.
Provides executive-grade styling for Word (.docx), Excel (.xlsx), and PowerPoint (.pptx).
"""

from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import re
import uuid

# OpenPyXL imports
import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.utils import get_column_letter

# Python-docx imports
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

# Python-pptx imports
from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt as PptxPt
from pptx.dml.color import RGBColor as PptxRGBColor
from pptx.enum.text import PP_ALIGN

from ..core.org_config import org_config

# =============================================================================
# COLOR PALETTES & DESIGN TOKENS
# =============================================================================
class ThemeColors:
    # Primary Institutional Navy & Slate
    NAVY_DARK = "1B365D"       # Deep Institutional Navy
    NAVY_MID = "2563EB"        # Royal Blue
    NAVY_LIGHT = "EFF6FF"      # Soft Ice Blue
    
    # Secondary Gold / Amber Accent
    GOLD_DARK = "B45309"       # Deep Amber Gold
    GOLD_ACCENT = "D97706"     # Bright Gold
    GOLD_LIGHT = "FEF3C7"      # Warm Light Gold
    
    # Status / Functional Colors
    SUCCESS_DARK = "065F46"    # Forest Emerald
    SUCCESS_LIGHT = "ECFDF5"   # Mint Soft
    DANGER_DARK = "991B1B"     # Ruby Red
    DANGER_LIGHT = "FEF2F2"    # Soft Rose
    
    # Neutral Grayscale
    CHARCOAL_DARK = "0F172A"   # Slate 900
    CHARCOAL_TEXT = "334155"   # Slate 700
    GRAY_BORDER = "CBD5E1"     # Slate 300
    GRAY_ZEBRA = "F8FAFC"      # Slate 50
    WHITE = "FFFFFF"


# =============================================================================
# 1. EXCEL WORKBOOK STYLER (.xlsx)
# =============================================================================
def style_excel_worksheet(
    ws: Any,
    sheet_title: str,
    subtitle: Optional[str] = None,
    header_color: str = ThemeColors.NAVY_DARK,
    accent_color: str = ThemeColors.GOLD_ACCENT,
    freeze_header: bool = True
):
    """
    Applies an executive corporate theme to any openpyxl worksheet:
    - Merged top title block with university branding
    - Formatted column headers with high-contrast background & white bold text
    - Auto-calculated column widths with safety margins (no clipped text or '###')
    - Alternating row zebra fills (#F8FAFC / #FFFFFF)
    - Thin professional cell borders
    - Frozen panes so headers stay fixed during scroll
    """
    if ws.max_row == 0 or ws.max_column == 0:
        return

    # Check if row 1 already has user data or if we should format existing headers
    # Detect the actual data table start row
    header_row = 1
    for r in range(1, min(ws.max_row + 1, 5)):
        first_val = str(ws.cell(r, 1).value or "").lower()
        if any(k in first_val for k in ["sl", "s.no", "parameter", "criterion", "id", "name", "title", "faculty"]):
            header_row = r
            break

    # Palette styles
    font_header = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    fill_header = PatternFill(start_color=header_color, end_color=header_color, fill_type="solid")
    
    font_data = Font(name="Calibri", size=10, color="1E293B")
    fill_zebra_even = PatternFill(start_color=ThemeColors.GRAY_ZEBRA, end_color=ThemeColors.GRAY_ZEBRA, fill_type="solid")
    fill_zebra_odd = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

    thin_border = Border(
        left=Side(style="thin", color=ThemeColors.GRAY_BORDER),
        right=Side(style="thin", color=ThemeColors.GRAY_BORDER),
        top=Side(style="thin", color=ThemeColors.GRAY_BORDER),
        bottom=Side(style="thin", color=ThemeColors.GRAY_BORDER)
    )

    align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
    align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
    align_right = Alignment(horizontal="right", vertical="center")

    # Format Header Row
    ws.row_dimensions[header_row].height = 28
    for col in range(1, ws.max_column + 1):
        cell = ws.cell(row=header_row, column=col)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = thin_border

    # Format Data Rows
    for r in range(header_row + 1, ws.max_row + 1):
        ws.row_dimensions[r].height = 20
        is_even = (r - header_row) % 2 == 0
        row_fill = fill_zebra_even if is_even else fill_zebra_odd

        for c in range(1, ws.max_column + 1):
            cell = ws.cell(row=r, column=c)
            cell.font = font_data
            cell.fill = row_fill
            cell.border = thin_border

            val = cell.value
            # Number & alignment rules
            if isinstance(val, (int, float)):
                if isinstance(val, float) and val > 1000:
                    cell.number_format = '#,##0.00'
                    cell.alignment = align_right
                elif isinstance(val, int) and val > 1000:
                    cell.number_format = '#,##0'
                    cell.alignment = align_right
                else:
                    cell.alignment = align_center
            elif str(val).startswith(("http://", "https://")):
                cell.font = Font(name="Calibri", size=9, color="2563EB", underline="single")
                cell.alignment = align_left
            elif any(k in str(val).lower() for k in ["yes", "compliant", "a++", "q1", "passed"]):
                cell.font = Font(name="Calibri", size=10, bold=True, color="047857")
                cell.alignment = align_center
            elif any(k in str(val).lower() for k in ["no", "non-compliant", "gap", "failed"]):
                cell.font = Font(name="Calibri", size=10, bold=True, color="B91C1C")
                cell.alignment = align_center
            else:
                cell.alignment = align_left

    # Auto-Fit Column Widths (Prevent '###' or clipped columns)
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            val_str = str(cell.value or "")
            if cell.number_format and "#" in cell.number_format:
                val_str += "    "
            # Limit single cell measure to prevent multi-paragraph blowing up width
            line_lens = [len(line) for line in val_str.split("\n")]
            cell_len = max(line_lens) if line_lens else 0
            if cell_len > max_len:
                max_len = cell_len

        # Clamp between 12 and 55
        calculated_width = max(max_len + 4, 12)
        calculated_width = min(calculated_width, 55)
        ws.column_dimensions[col_letter].width = calculated_width

    # Freeze Header Pane
    if freeze_header and header_row < ws.max_row:
        freeze_cell = f"A{header_row + 1}"
        ws.freeze_panes = freeze_cell

    # Set sheet view gridlines explicitly to True
    ws.views.sheetView[0].showGridLines = True


def style_entire_excel_workbook(
    filepath: Path,
    title_prefix: str = "Institutional Report",
    palette: str = "navy"
) -> str:
    """Loads an Excel workbook from disk, applies corporate styling to EVERY worksheet, and saves it."""
    wb = openpyxl.load_workbook(str(filepath))
    
    color_map = {
        "navy": (ThemeColors.NAVY_DARK, ThemeColors.GOLD_ACCENT),
        "emerald": (ThemeColors.SUCCESS_DARK, ThemeColors.GOLD_ACCENT),
        "amber": (ThemeColors.GOLD_DARK, ThemeColors.NAVY_MID),
    }
    header_col, accent_col = color_map.get(palette, (ThemeColors.NAVY_DARK, ThemeColors.GOLD_ACCENT))

    # Give each tab a distinct institutional color
    tab_colors = ["1B365D", "2563EB", "059669", "D97706", "7C3AED", "0284C7", "475569", "0D9488"]

    for idx, sheet_name in enumerate(wb.sheetnames):
        ws = wb[sheet_name]
        ws.sheet_properties.tabColor = tab_colors[idx % len(tab_colors)]
        style_excel_worksheet(
            ws=ws,
            sheet_title=sheet_name.replace("_", " "),
            header_color=header_col,
            accent_color=accent_col
        )

    wb.save(str(filepath))
    return str(filepath)


# =============================================================================
# 2. WORD DOCUMENT STYLER & COVER PAGE BUILDER (.docx)
# =============================================================================
def set_cell_background(cell, hex_color: str):
    """Set background color of a Word table cell."""
    tc_pr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    tc_pr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets internal padding (in dxa) for a table cell."""
    tc_pr = cell._element.get_or_add_tcPr()
    tc_mar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tc_pr.append(tc_mar)

def add_executive_cover_page(
    doc: Document,
    title: str,
    subtitle: str,
    framework: str,
    department: str = "University-Wide",
    reference_no: Optional[str] = None,
    evaluation_cycle: str = "2021–2026 Statutory Window"
):
    """
    Builds a corporate executive cover page for academic & statutory dossiers.
    Features:
    - Top Institutional Header
    - Gold accent horizontal bar
    - Bold multi-line title in Deep Navy
    - Styled Metadata Card table
    - Confidentiality & Statutory Sign-off Badges
    - Page break separating cover from content
    """
    # 1. Top Institutional Banner
    p_inst = doc.add_paragraph()
    p_inst.paragraph_format.space_before = Pt(0)
    p_inst.paragraph_format.space_after = Pt(2)
    r_uni = p_inst.add_run(f"{org_config.org_name.upper()}\n")
    r_uni.font.name = "Arial"
    r_uni.font.size = Pt(13)
    r_uni.font.bold = True
    r_uni.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D) # Navy

    r_dir = p_inst.add_run("DIRECTORATE OF ACADEMIC COMPLIANCE & INTERNAL QUALITY ASSURANCE (IQAC)\n")
    r_dir.font.name = "Arial"
    r_dir.font.size = Pt(9)
    r_dir.font.color.rgb = RGBColor(0x64, 0x74, 0x8B) # Slate

    # 2. Gold Accent Horizontal Rule
    p_rule = doc.add_paragraph()
    p_rule.paragraph_format.space_before = Pt(4)
    p_rule.paragraph_format.space_after = Pt(40)
    rule_table = doc.add_table(rows=1, cols=1)
    rule_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_rule = rule_table.rows[0].cells[0]
    cell_rule.width = Inches(6.5)
    set_cell_background(cell_rule, ThemeColors.GOLD_ACCENT)
    cell_rule.paragraphs[0].paragraph_format.space_before = Pt(0)
    cell_rule.paragraphs[0].paragraph_format.space_after = Pt(0)

    # 3. Framework Pill Badge
    p_badge = doc.add_paragraph()
    p_badge.paragraph_format.space_after = Pt(8)
    r_badge = p_badge.add_run(f"★  OFFICIAL {framework.upper()} ACCREDITATION DOSSIER")
    r_badge.font.name = "Arial"
    r_badge.font.size = Pt(9.5)
    r_badge.font.bold = True
    r_badge.font.color.rgb = RGBColor(0xB4, 0x53, 0x09) # Amber Gold

    # 4. Main Document Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(8)
    r_main_title = p_title.add_run(title)
    r_main_title.font.name = "Arial"
    r_main_title.font.size = Pt(24)
    r_main_title.font.bold = True
    r_main_title.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A) # Dark Slate

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_after = Pt(36)
    r_sub = p_sub.add_run(subtitle)
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(12)
    r_sub.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # 5. Metadata Specification Card Table
    meta_table = doc.add_table(rows=6, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    meta_rows_data = [
        ("TARGET JURISDICTION / DEPT", department),
        ("ACCREDITATION FRAMEWORK", f"{framework} Statutory Framework & Guidelines"),
        ("EVALUATION WINDOW", evaluation_cycle),
        ("STATUTORY DOSSIER REF.", reference_no or f"AUUP/{framework}/2026/SSR-{uuid.uuid4().hex[:4].upper()}"),
        ("COMPLIANCE AUDIT ENGINE", "ReportXpert Sovereign On-Premise AI (100% Air-Gapped)"),
        ("CLASSIFICATION & PRIVACY", "CONFIDENTIAL // OFFICIAL STATUTORY SUBMISSION RECORD")
    ]

    for idx, (label, val) in enumerate(meta_rows_data):
        row = meta_table.rows[idx]
        cell_lbl = row.cells[0]
        cell_val = row.cells[1]
        
        cell_lbl.width = Inches(2.4)
        cell_val.width = Inches(4.1)

        set_cell_background(cell_lbl, "F1F5F9")
        set_cell_background(cell_val, "FFFFFF" if idx % 2 == 0 else "F8FAFC")
        
        set_cell_margins(cell_lbl, top=60, bottom=60, left=100, right=100)
        set_cell_margins(cell_val, top=60, bottom=60, left=100, right=100)

        p_lbl = cell_lbl.paragraphs[0]
        p_lbl.paragraph_format.space_before = Pt(2)
        p_lbl.paragraph_format.space_after = Pt(2)
        r_l = p_lbl.add_run(label)
        r_l.font.name = "Arial"
        r_l.font.size = Pt(8.5)
        r_l.font.bold = True
        r_l.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

        p_val = cell_val.paragraphs[0]
        p_val.paragraph_format.space_before = Pt(2)
        p_val.paragraph_format.space_after = Pt(2)
        r_v = p_val.add_run(val)
        r_v.font.name = "Arial"
        r_v.font.size = Pt(9)
        if "CONFIDENTIAL" in val:
            r_v.font.bold = True
            r_v.font.color.rgb = RGBColor(0x99, 0x1B, 0x1B) # Crimson
        else:
            r_v.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

    # 6. Page Break to start dossier content
    doc.add_page_break()


def configure_document_headers_footers(doc: Document, framework: str):
    """Configures running headers and footers on all content pages."""
    for section in doc.sections:
        section.top_margin = Inches(0.9)
        section.bottom_margin = Inches(0.9)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

        # Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hrun = hp.add_run(f"REPORTXPERT SOVEREIGN COMPLIANCE // {framework.upper()} STATUTORY DOSSIER")
        hrun.font.name = "Arial"
        hrun.font.size = Pt(8)
        hrun.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

        # Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        frun = fp.add_run("CONFIDENTIAL & PROPRIETARY // 0.00 KB CLOUD EGRESS // ON-PREMISE AI VERIFIED")
        frun.font.name = "Arial"
        frun.font.size = Pt(7.5)
        frun.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)


def style_table_element(table: Any, header_bg: str = ThemeColors.NAVY_DARK):
    """Applies corporate header formatting, cell padding, zebra rows, and borders to a docx table."""
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True

    # Style header row
    hdr_row = table.rows[0]
    for cell in hdr_row.cells:
        set_cell_background(cell, header_bg)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        for p in cell.paragraphs:
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.font.name = "Arial"
                run.font.size = Pt(9.5)
                run.font.bold = True
                run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    # Style data rows
    for r_idx in range(1, len(table.rows)):
        row = table.rows[r_idx]
        bg_col = ThemeColors.GRAY_ZEBRA if r_idx % 2 == 0 else "FFFFFF"
        for cell in row.cells:
            set_cell_background(cell, bg_col)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                for run in p.runs:
                    run.font.name = "Arial"
                    run.font.size = Pt(9)
                    run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)


def add_callout_box(doc: Document, text: str, callout_type: str = "info"):
    """Adds a callout quote container with colored left accent border."""
    type_map = {
        "info": ("EFF6FF", ThemeColors.NAVY_MID, "INFORMATION & AUDIT NOTICE:"),
        "success": ("ECFDF5", ThemeColors.SUCCESS_DARK, "STATUTORY COMPLIANCE VERIFIED:"),
        "warning": ("FEF3C7", ThemeColors.GOLD_ACCENT, "FLAGGED AUDIT GAPS & REMEDIATION REQUIRED:")
    }
    bg_hex, border_hex, title_prefix = type_map.get(callout_type, type_map["info"])

    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = tbl.rows[0].cells[0]
    c.width = Inches(6.5)
    set_cell_background(c, bg_hex)
    set_cell_margins(c, top=120, bottom=120, left=180, right=150)

    p = c.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    
    r_hdr = p.add_run(f"▍ {title_prefix}\n")
    r_hdr.font.name = "Arial"
    r_hdr.font.size = Pt(9.5)
    r_hdr.font.bold = True
    r_hdr.font.color.rgb = RGBColor(int(border_hex[:2], 16), int(border_hex[2:4], 16), int(border_hex[4:], 16))

    r_body = p.add_run(text)
    r_body.font.name = "Arial"
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)


def convert_markdown_to_rich_docx(
    doc: Document,
    markdown_content: str,
    framework: str = "NAAC"
):
    """
    Parses Markdown (including headings, bold runs, bullet lists, AND Markdown tables)
    and writes them into doc with professional typography and formatting.
    """
    lines = markdown_content.split("\n")
    in_table = False
    table_lines = []

    def flush_table(t_lines):
        if not t_lines:
            return
        # Extract rows & cols
        rows = []
        for l in t_lines:
            # Strip outer pipes
            trimmed = l.strip().strip("|")
            cols = [c.strip() for c in trimmed.split("|")]
            # Skip separator line (e.g. |:---|:---|)
            if all(re.match(r"^:?-+:?$", c) for c in cols if c):
                continue
            if cols:
                rows.append(cols)

        if not rows:
            return

        col_count = max(len(r) for r in rows)
        tbl = doc.add_table(rows=len(rows), cols=col_count)
        for r_i, r_data in enumerate(rows):
            for c_i in range(col_count):
                val = r_data[c_i] if c_i < len(r_data) else ""
                val_clean = val.replace("**", "").replace("*", "")
                cell = tbl.cell(r_i, c_i)
                cell.text = val_clean

        style_table_element(tbl, header_bg=ThemeColors.NAVY_DARK)
        doc.add_paragraph().paragraph_format.space_after = Pt(8)

    for line in lines:
        stripped = line.strip()

        # Check if line is part of a markdown table
        if stripped.startswith("|") and stripped.endswith("|"):
            in_table = True
            table_lines.append(stripped)
            continue
        elif in_table:
            in_table = False
            flush_table(table_lines)
            table_lines = []

        # Empty line
        if not stripped:
            continue

        # Headings
        if stripped.startswith("# "):
            h1 = doc.add_heading(stripped.replace("# ", "").strip(), level=1)
            h1.paragraph_format.space_before = Pt(16)
            h1.paragraph_format.space_after = Pt(6)
            for r in h1.runs:
                r.font.name = "Arial"
                r.font.size = Pt(16)
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
        elif stripped.startswith("## "):
            h2 = doc.add_heading(stripped.replace("## ", "").strip(), level=2)
            h2.paragraph_format.space_before = Pt(12)
            h2.paragraph_format.space_after = Pt(4)
            for r in h2.runs:
                r.font.name = "Arial"
                r.font.size = Pt(13)
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)
        elif stripped.startswith("### "):
            h3 = doc.add_heading(stripped.replace("### ", "").strip(), level=3)
            h3.paragraph_format.space_before = Pt(10)
            h3.paragraph_format.space_after = Pt(3)
            for r in h3.runs:
                r.font.name = "Arial"
                r.font.size = Pt(11)
                r.font.bold = True
                r.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        # Bullet list
        elif stripped.startswith(("- ", "* ", "• ")):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            content = stripped[2:].strip()
            _add_formatted_runs(p, content)
        # Numbered list
        elif re.match(r"^\d+[\.\)]\s+", stripped):
            match = re.match(r"^(\d+[\.\)])\s+(.*)$", stripped)
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.left_indent = Inches(0.25)
            r_num = p.add_run(f"{match.group(1)} ")
            r_num.bold = True
            r_num.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)
            _add_formatted_runs(p, match.group(2))
        # Blockquote / Alert
        elif stripped.startswith("> "):
            add_callout_box(doc, stripped[2:].strip(), callout_type="info")
        # Standard Paragraph
        else:
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.line_spacing = 1.15
            _add_formatted_runs(p, stripped)

    if in_table and table_lines:
        flush_table(table_lines)


def _add_formatted_runs(paragraph: Any, text: str):
    """Parses inline bold (**text**) and italic (*text*) tags into Word runs."""
    parts = re.split(r'(\*\*.*?\*\*|\*.*?\*)', text)
    for part in parts:
        if part.startswith("**") and part.endswith("**"):
            run = paragraph.add_run(part[2:-2])
            run.font.name = "Arial"
            run.font.size = Pt(10)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
        elif part.startswith("*") and part.endswith("*"):
            run = paragraph.add_run(part[1:-1])
            run.font.name = "Arial"
            run.font.size = Pt(10)
            run.font.italic = True
            run.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
        else:
            run = paragraph.add_run(part)
            run.font.name = "Arial"
            run.font.size = Pt(10)
            run.font.color.rgb = RGBColor(0x33, 0x41, 0x55)


def add_official_sign_off_matrix(doc: Document, left="Dean / HoI", center="IQAC Director", right="Registrar / Vice-Chancellor"):
    """Appends an official 3-signature endorsement card to the end of a dossier."""
    doc.add_paragraph().paragraph_format.space_before = Pt(16)
    
    h_sign = doc.add_heading("Official Statutory Endorsement & Institutional Sign-Off", level=2)
    h_sign.paragraph_format.space_after = Pt(8)
    for r in h_sign.runs:
        r.font.name = "Arial"
        r.font.size = Pt(13)
        r.font.bold = True
        r.font.color.rgb = RGBColor(0x1B, 0x36, 0x5D)

    sig_table = doc.add_table(rows=2, cols=3)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    hdr_cells = sig_table.rows[0].cells
    hdr_cells[0].text = "PREPARED & VERIFIED BY"
    hdr_cells[1].text = "INTERNAL QUALITY ASSURANCE"
    hdr_cells[2].text = "STATUTORY SIGN-OFF"

    for c in hdr_cells:
        set_cell_background(c, "F1F5F9")
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Arial"
            r.font.size = Pt(8.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

    body_cells = sig_table.rows[1].cells
    body_cells[0].text = f"\n\n\n_______________________\n{left}\nReportXpert Node Verified"
    body_cells[1].text = f"\n\n\n_______________________\n{center}\nIQAC Secretariat"
    body_cells[2].text = f"\n\n\n_______________________\n{right}\nUniversity Executive Authority"

    for c in body_cells:
        set_cell_background(c, "FFFFFF")
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for r in p.runs:
            r.font.name = "Arial"
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)


# =============================================================================
# 3. EXECUTIVE POWERPOINT STYLER (.pptx)
# =============================================================================
def build_executive_deck(
    output_path: Path,
    title: str,
    subtitle: str,
    slides_data: List[Dict[str, Any]],
    framework: str = "NAAC"
) -> str:
    """
    Creates an executive 16:9 widescreen presentation in PowerPoint (.pptx).
    Features:
    - Midnight Navy gradient title slide with glowing Gold/Cyan accents
    - Off-white card container slides with branded dark header bar
    - Multi-card content layout with high-contrast pill badges
    """
    prs = Presentation()
    prs.slide_width = PptxInches(13.333)
    prs.slide_height = PptxInches(7.5)
    blank_layout = prs.slide_layouts[6]

    # --- Slide 1: Cover Slide (Dark Executive Theme) ---
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(1, 0, 0, PptxInches(13.333), PptxInches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = PptxRGBColor(11, 19, 43) # Midnight Navy
    bg1.line.color.rgb = PptxRGBColor(11, 19, 43)

    # Gold Accent Stripe
    stripe = s1.shapes.add_shape(1, PptxInches(1.5), PptxInches(1.8), PptxInches(10.333), PptxInches(0.08))
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = PptxRGBColor(217, 119, 6) # Amber Gold
    stripe.line.color.rgb = PptxRGBColor(217, 119, 6)

    tx_box = s1.shapes.add_textbox(PptxInches(1.5), PptxInches(2.2), PptxInches(10.333), PptxInches(3.8))
    tf = tx_box.text_frame
    tf.word_wrap = True

    p_eyebrow = tf.paragraphs[0]
    p_eyebrow.text = f"★  OFFICIAL {framework.upper()} STATUTORY BRIEFING  //  SOVEREIGN AI ENGINE"
    p_eyebrow.font.size = PptxPt(12)
    p_eyebrow.font.bold = True
    p_eyebrow.font.color.rgb = PptxRGBColor(56, 189, 248) # Cyan

    p_title = tf.add_paragraph()
    p_title.text = title.upper()
    p_title.font.size = PptxPt(34)
    p_title.font.bold = True
    p_title.font.color.rgb = PptxRGBColor(255, 255, 255)
    p_title.space_before = PptxPt(10)
    p_title.space_after = PptxPt(10)

    p_sub = tf.add_paragraph()
    p_sub.text = f"{subtitle}\nGenerated On-Premise via ReportXpert • Verified 0.00 KB Cloud Egress"
    p_sub.font.size = PptxPt(15)
    p_sub.font.color.rgb = PptxRGBColor(148, 163, 184) # Muted Slate

    # --- Subsequent Content Slides ---
    for s_info in slides_data:
        s = prs.slides.add_slide(blank_layout)

        # Off-white slide background
        s_bg = s.shapes.add_shape(1, 0, 0, PptxInches(13.333), PptxInches(7.5))
        s_bg.fill.solid()
        s_bg.fill.fore_color.rgb = PptxRGBColor(248, 250, 252) # Slate 50
        s_bg.line.color.rgb = PptxRGBColor(248, 250, 252)

        # Top Header Bar (Deep Navy)
        hdr = s.shapes.add_shape(1, 0, 0, PptxInches(13.333), PptxInches(1.2))
        hdr.fill.solid()
        hdr.fill.fore_color.rgb = PptxRGBColor(15, 23, 42) # Slate 900
        hdr.line.color.rgb = PptxRGBColor(15, 23, 42)

        htf = hdr.text_frame
        hp = htf.paragraphs[0]
        hp.text = s_info.get("heading", "Executive Review").upper()
        hp.font.size = PptxPt(20)
        hp.font.bold = True
        hp.font.color.rgb = PptxRGBColor(255, 255, 255)

        # Gold Accent line under header
        h_stripe = s.shapes.add_shape(1, 0, PptxInches(1.15), PptxInches(13.333), PptxInches(0.05))
        h_stripe.fill.solid()
        h_stripe.fill.fore_color.rgb = PptxRGBColor(217, 119, 6)
        h_stripe.line.color.rgb = PptxRGBColor(217, 119, 6)

        # White Container Card
        card = s.shapes.add_shape(1, PptxInches(0.8), PptxInches(1.5), PptxInches(11.733), PptxInches(5.4))
        card.fill.solid()
        card.fill.fore_color.rgb = PptxRGBColor(255, 255, 255)
        card.line.color.rgb = PptxRGBColor(203, 213, 225) # Slate 300

        ctf = card.text_frame
        ctf.word_wrap = True

        bullets = s_info.get("bullets", [])
        for idx, b in enumerate(bullets):
            bp = ctf.paragraphs[0] if idx == 0 else ctf.add_paragraph()
            bp.text = f"✔   {b}"
            bp.font.size = PptxPt(16)
            bp.font.color.rgb = PptxRGBColor(30, 41, 59)
            bp.space_after = PptxPt(12)

        # Footer
        ft_box = s.shapes.add_textbox(PptxInches(0.8), PptxInches(7.0), PptxInches(11.733), PptxInches(0.4))
        ftp = ft_box.text_frame.paragraphs[0]
        ftp.text = f"ReportXpert On-Premise Sovereign Engine  •  {framework.upper()} Compliance Dossier  •  Strictly Confidential"
        ftp.font.size = PptxPt(9)
        ftp.font.color.rgb = PptxRGBColor(148, 163, 184)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    prs.save(str(output_path))
    return str(output_path)
