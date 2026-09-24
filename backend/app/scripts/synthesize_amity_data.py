import os
import sys
from pathlib import Path
import json

# Add backend dir to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.tools.rag_engine import rag_engine

def seed_synthetic_amity_data():
    print("Clearing existing RAG Engine index...")
    rag_engine.documents = []
    
    synthetic_docs = [
        {
            "id": "amity_faculty_code_of_conduct",
            "standard": "Amity University Lucknow — HR & Ethics Policy",
            "section": "1.0 Faculty Code of Conduct",
            "content": (
                "All faculty members of Amity University Lucknow must uphold the highest standards of academic integrity. "
                "Faculty are expected to maintain professional boundaries with students and colleagues. Plagiarism, falsification "
                "of data, or misrepresentation of academic credentials will result in immediate disciplinary action, including potential "
                "termination. Faculty must report any conflicts of interest regarding research funding or student evaluations to the Dean of Academics."
            )
        },
        {
            "id": "amity_leave_policy_extended",
            "standard": "Amity University Lucknow — HR Policy",
            "section": "2.4 Leave & Attendance Guidelines",
            "content": (
                "Faculty and staff are entitled to 12 Casual Leaves (CL) and 15 Earned Leaves (EL) per academic year. "
                "Leaves must be applied for via the Amizone portal. CL applications require 48-hour prior notice, whereas EL "
                "applications must be submitted at least 15 days in advance. Medical leaves exceeding 3 days require a certified "
                "medical practitioner's note. Maternity leave of 26 weeks is provided as per government regulations."
            )
        },
        {
            "id": "amity_examination_protocol",
            "standard": "Amity University Lucknow — Examination Protocol",
            "section": "3.1 Invigilation and Exam Security",
            "content": (
                "Invigilators must report to the examination control room 30 minutes prior to the commencement of the exam. "
                "Mobile phones, smartwatches, and unauthorized electronic devices are strictly prohibited inside the examination hall "
                "for both students and faculty. Suspected use of unfair means (UFM) must be reported immediately to the Flying Squad "
                "and documented on the UFM incident form before the student leaves the hall."
            )
        },
        {
            "id": "amity_research_grants",
            "standard": "Amity University Lucknow — Research & Development",
            "section": "4.2 Internal Research Grants",
            "content": (
                "The university encourages active research through the Amity Science, Technology & Innovation Foundation (ASTIF). "
                "Faculty can apply for internal seed grants up to INR 5,00,000. Proposals must outline the objective, methodology, "
                "and expected societal impact. Grant proposals are reviewed bi-annually by the central research committee. "
                "Funds must be utilized within 18 months, with quarterly progress reports submitted to the R&D cell."
            )
        },
        {
            "id": "amity_student_attendance",
            "standard": "Amity University Lucknow — Academic Regulations",
            "section": "5.1 Student Attendance Criteria",
            "content": (
                "Students must maintain a minimum of 75% attendance in all theory and practical courses to be eligible to appear "
                "for the End Semester Examinations. A relaxation of up to 5% may be granted by the Head of Institution (HOI) on "
                "medical grounds or for participation in official university events (e.g., Sangathan sports meet, moot court competitions), "
                "provided valid documentation is submitted within 7 days of absence."
            )
        },
        {
            "id": "amity_infrastructure_it",
            "standard": "Amity University Lucknow — IT Policy",
            "section": "6.0 Network & Cybersecurity",
            "content": (
                "Access to the university's internal Wi-Fi network requires authentication via individual Amizone credentials. "
                "Peer-to-peer file sharing and access to unauthorized content are blocked at the firewall level. "
                "Faculty must not share their login credentials. In case of a suspected data breach, the IT Helpdesk must be "
                "contacted immediately. All university-owned devices must have the centralized endpoint protection software active."
            )
        },
        {
            "id": "amity_event_approval",
            "standard": "Amity University Lucknow — Administrative Procedures",
            "section": "7.3 Event and Seminar Approvals",
            "content": (
                "Any department wishing to host a seminar, guest lecture, or cultural event must submit an 'Event Approval Note' "
                "to the Vice Chancellor's office at least 3 weeks in advance. The note must include the proposed budget, list of "
                "external speakers, and logistics requirements. Once approved, the administration department will issue necessary "
                "clearances for campus entry, auditorium booking, and hospitality arrangements."
            )
        },
        {
            "id": "amity_grading_system",
            "standard": "Amity University Lucknow — Academic Regulations",
            "section": "8.2 Relative Grading and CGPA",
            "content": (
                "Amity University employs a Choice Based Credit System (CBCS) and a 10-point relative grading scale. "
                "Grades range from A+ (10 points) to F (0 points). An overall CGPA of 5.0 is required for undergraduate "
                "degree completion, and 6.0 for postgraduate programs. Students failing to clear a course may appear for "
                "supplementary examinations held during the summer break."
            )
        },
        {
            "id": "reportxpert_digital_signatures",
            "standard": "ReportXpert Workflow Standard",
            "section": "Clause 2.1 (Digital Authorizations)",
            "content": (
                "To maintain a paperless administration, all internal memos, grade sheets, event approvals, and official circulars "
                "must be digitally generated and signed using the organization's approved cryptographic key infrastructure or "
                "internal ReportXpert dashboard before internal distribution."
            )
        }
    ]

    print(f"Indexing {len(synthetic_docs)} high-quality synthetic documents into SovereignRAGEngine...")
    
    for i, doc in enumerate(synthetic_docs):
        rag_engine.add_document(
            standard=doc["standard"],
            section=doc["section"],
            content=doc["content"],
            doc_id=doc["id"]
        )
        print(f"Indexed document {i+1}/{len(synthetic_docs)}: {doc['id']}")
        
    print("Successfully seeded RAG Engine with rich, synthetic Amity University data.")

if __name__ == "__main__":
    seed_synthetic_amity_data()
