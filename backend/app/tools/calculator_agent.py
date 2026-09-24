import uuid
import time
from pathlib import Path
from typing import Dict, Any, List
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from .sandbox import sandbox_runner
from .xlsx_generator import create_academic_report_sheet
from .docx_generator import create_naac_approval_note
from ..core.config import settings

class AcademicAnalyticsAgent:
    """
    Automated Data Analytics & Self-Healing Code Sandbox Agent.
    Implements University NAAC/UGC performance calculations.
    """

    def __init__(self):
        self.output_dir = settings.DELIVERABLES_DIR
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def calculate_academic_metrics(
        self,
        department_id: str = "Computer Science",
        framework: str = "NAAC",
        total_faculty: float = 25.0,
        total_publications: float = 150.0,
        total_citations: float = 450.0,
        h_index_avg: float = 12.5,
        research_grants_lakhs: float = 50.0,
        years_assessed: float = 5.0
    ) -> Dict[str, Any]:
        """
        Executes Academic framework (NAAC/UGC/NIRF etc.) research metrics inside an isolated Python sandbox.
        """
        calc_id = f"{framework.upper()}-{uuid.uuid4().hex[:6].upper()}"

        python_script = f"""
faculty = {total_faculty}
pubs = {total_publications}
citations = {total_citations}
grants = {research_grants_lakhs}
years = {years_assessed}

pubs_per_faculty = pubs / max(faculty, 1.0)
citations_per_pub = citations / max(pubs, 1.0)
grants_per_year = grants / max(years, 1.0)

# NAAC Score Criteria 3 Estimation (Max 100 points proxy)
naac_score = (min(pubs_per_faculty, 5.0) / 5.0 * 40) + (min(citations_per_pub, 10.0) / 10.0 * 40) + (min(grants_per_year, 20.0) / 20.0 * 20)
is_eligible = naac_score > 65.0

print(f"PUBS_PER_FACULTY: {{pubs_per_faculty:.2f}}")
print(f"CITATIONS_PER_PUB: {{citations_per_pub:.2f}}")
print(f"GRANTS_PER_YEAR: {{grants_per_year:.2f}}")
print(f"NAAC_SCORE: {{naac_score:.2f}}")
print(f"IS_ELIGIBLE: {{is_eligible}}")
"""

        exec_result = sandbox_runner.execute_code(python_script)

        parsed_metrics = {}
        for line in exec_result["stdout"].strip().split("\\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                try:
                    parsed_metrics[k.strip()] = float(v.strip())
                except ValueError:
                    parsed_metrics[k.strip()] = v.strip()

        pubs_per_faculty = parsed_metrics.get("PUBS_PER_FACULTY", 0.0)
        citations_per_pub = parsed_metrics.get("CITATIONS_PER_PUB", 0.0)
        grants_per_year = parsed_metrics.get("GRANTS_PER_YEAR", 0.0)
        naac_score = parsed_metrics.get("NAAC_SCORE", 0.0)
        is_eligible = parsed_metrics.get("IS_ELIGIBLE", "False") == "True"

        chart_filename = f"naac_chart_{calc_id}.png"
        chart_path = self.output_dir / chart_filename
        self._generate_naac_chart(
            chart_path=chart_path,
            department_id=department_id,
            pubs_per_faculty=pubs_per_faculty,
            citations_per_pub=citations_per_pub,
            naac_score=naac_score
        )

        # 2. Generate Deliverable: Excel .xlsx
        xlsx_filename = f"{framework}_Report_{calc_id}.xlsx"
        xlsx_path = self.output_dir / xlsx_filename
        create_academic_report_sheet(
            output_path=xlsx_path,
            department_id=department_id,
            total_faculty=total_faculty,
            total_publications=total_publications,
            total_citations=total_citations,
            h_index_avg=h_index_avg,
            research_grants_lakhs=research_grants_lakhs,
            naac_score=naac_score
        )

        # 3. Generate Official Approval Note (.docx)
        docx_filename = f"{framework}_Approval_Note_{calc_id}.docx"
        docx_path = self.output_dir / docx_filename
        create_naac_approval_note(
            output_path=docx_path,
            subject=f"{framework} Research Impact Review",
            reference_no=calc_id,
            department_id=department_id,
            findings=f"The department generated {total_publications} publications over {years_assessed} years with {total_citations} citations.",
            audit_verdict="ELIGIBLE" if is_eligible else "NEEDS IMPROVEMENT",
            components_list=[
                {"tag": "Faculty Pubs", "type": "Metric", "status": f"{pubs_per_faculty:.2f} per faculty"},
                {"tag": "Citations", "type": "Metric", "status": f"{citations_per_pub:.2f} per pub"},
                {"tag": "Grants", "type": "Metric", "status": f"{grants_per_year:.2f} Lakhs/yr"}
            ],
            action_items=[
                f"Review H-Index ({h_index_avg}) against {framework} benchmark",
                f"Verify grant funding documentation for {grants_per_year:.2f} Lakhs"
            ]
        )

        return {
            "calc_id": calc_id,
            "department_id": department_id,
            "pubs_per_faculty": pubs_per_faculty,
            "citations_per_pub": citations_per_pub,
            "grants_per_year": grants_per_year,
            "naac_score": naac_score,
            "is_eligible": is_eligible,
            "years_assessed": years_assessed,
            "execution_time_ms": exec_result["execution_time_ms"],
            "deliverables": {
                "chart_png": str(chart_path),
                "xlsx": str(xlsx_path),
                "docx": str(docx_path)
            }
        }

    def _generate_degradation_chart(
        self,
        chart_path: Path,
        asset_id: str,
        baseline_val: float,
        current_val: float,
        threshold_min: float,
        years_in_service: float,
        remaining_life: float
    ):
        """Plots degradation trajectory and critical threshold line."""
        plt.figure(figsize=(10, 5.5), facecolor="#0F172A")
        ax = plt.gca()
        ax.set_facecolor("#1E293B")

        # Timeline data points
        years = [0.0, years_in_service, years_in_service + remaining_life]
        vals = [baseline_val, current_val, threshold_min]

        # Plot degradation curve
        plt.plot(years[:2], vals[:2], "o-", color="#38BDF8", linewidth=3, markersize=8, label="Historical Data Points")
        plt.plot(years[1:], vals[1:], "--", color="#F59E0B", linewidth=2.5, markersize=8, label="Projected Degradation Curve")

        # Critical Threshold Line
        plt.axhline(y=threshold_min, color="#EF4444", linestyle=":", linewidth=2.5, label=f"Critical Threshold ({threshold_min:.2f})")

        # Annotation
        plt.scatter([years_in_service + remaining_life], [threshold_min], color="#EF4444", s=120, zorder=5)
        plt.annotate(
            f"Critical Retirement Limit\n({remaining_life:.1f} yrs left)",
            xy=(years_in_service + remaining_life, threshold_min),
            xytext=(years_in_service + remaining_life - 2.5, threshold_min + 0.8),
            color="#FFFFFF",
            fontweight="bold",
            bbox=dict(boxstyle="round,pad=0.5", facecolor="#DC2626", alpha=0.9),
            arrowprops=dict(arrowstyle="->", color="#FFFFFF", lw=1.5)
        )

        plt.title(f"ORGANIZATION — SYSTEM DEGRADATION FORECAST ({asset_id})", color="#F8FAFC", fontsize=12, fontweight="bold", pad=15)
        plt.xlabel("Service Operation (Years)", color="#CBD5E1", fontsize=10, labelpad=10)
        plt.ylabel("Asset Metric Value", color="#CBD5E1", fontsize=10, labelpad=10)
        plt.grid(True, linestyle="--", alpha=0.2, color="#94A3B8")
        plt.tick_params(colors="#94A3B8")

        for spine in ax.spines.values():
            spine.set_color("#334155")

        leg = plt.legend(facecolor="#0F172A", edgecolor="#334155", labelcolor="#F8FAFC")
        plt.tight_layout()
        plt.savefig(str(chart_path), dpi=150, facecolor=plt.gcf().get_facecolor())
        plt.close()

calculator_agent = EngineeringCalculatorAgent()
