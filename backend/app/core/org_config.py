import os
from dataclasses import dataclass, field
from typing import List

@dataclass
class OrgConfig:
    org_name: str = "ReportXpert"
    org_subtitle: str = "Paperless University Administration & Accreditation Copilot"
    project_code: str = "REPORTXPERT"
    industry_type: str = "Higher Education Administration & Accreditation"
    
    task_id_prefix: str = "TASK"
    incident_id_prefix: str = "INC"
    
    hazard_keywords: List[str] = field(default_factory=lambda: [
        "unauthorized access", "data breach", "non-compliance", "signature missing",
        "forgery", "policy violation", "confidentiality breach", "delay",
        "misclassification", "missing document"
    ])
    
    audit_keywords: List[str] = field(default_factory=lambda: [
        "audit", "compliance", "policy", "guideline", "standard", "verification",
        "administrative rule", "document check", "workflow"
    ])
    
    standards_keywords: List[str] = field(default_factory=lambda: [
        "standard", "policy", "guideline", "rule", "procedure", "administrative",
        "circular", "memorandum", "act", "compliance", "requirement",
        "amity", "lucknow", "university", "faculty", "student", "exam", "leave", "attendance"
    ])
    
    calc_keywords: List[str] = field(default_factory=lambda: [
        "calculate", "compute", "estimate", "budget", "cost", "timeline",
        "resource allocation", "math", "metrics", "analytics"
    ])

# Global instance for easy import
org_config = OrgConfig()

# Allow environment variables to override
if os.getenv("ORG_NAME"):
    org_config.org_name = os.getenv("ORG_NAME")
if os.getenv("ORG_SUBTITLE"):
    org_config.org_subtitle = os.getenv("ORG_SUBTITLE")
if os.getenv("PROJECT_CODE"):
    org_config.project_code = os.getenv("PROJECT_CODE")
