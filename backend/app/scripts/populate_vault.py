import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

# Comprehensive Academic Standards & Institutional Data for Vector DB
DOCUMENTS = [
    # 1. NAAC Standards
    {
        "standard": "NAAC",
        "section": "Criterion III - Research, Innovations and Extension",
        "content": "NAAC Criterion 3 Assessment Guidelines:\n- Key Indicator 3.1: Promotion of Research and Facilities (Seed money, research fellowships).\n- Key Indicator 3.2: Resource Mobilization for Research (Grants received from government & non-governmental agencies in Lakhs).\n- Key Indicator 3.3: Innovation Ecosystem (Incubation centres, start-ups incubated).\n- Key Indicator 3.4: Research Publications and Awards (UGC CARE, Scopus, Web of Science indexed journals with impact factor and citation counts).\n- Key Indicator 3.5: Consultancy (Revenue generated from consultancy).\n- Key Indicator 3.6: Extension Activities (Awards recognized for extension activities).\n- Key Indicator 3.7: Collaboration (Collaborative research, MoUs signed with industry).",
        "doc_type": "standard",
        "doc_id": "naac_crit_3"
    },
    {
        "standard": "NAAC",
        "section": "Criterion II - Teaching-Learning and Evaluation",
        "content": "NAAC Criterion 2 Assessment Guidelines:\n- Student-to-Faculty Ratio (FSR): Benchmark standard is 1:15 for postgraduate & professional courses.\n- Full-Time Faculty with Ph.D. / D.Sc. / D.Litt.\n- Continuous Internal Evaluation (CIE) system and Student Satisfaction Survey (SSS).",
        "doc_type": "standard",
        "doc_id": "naac_crit_2"
    },
    # 2. UGC Standards
    {
        "standard": "UGC",
        "section": "Minimum Qualifications for Teachers & API Scores",
        "content": "UGC Regulations for Academic Performance Indicators (API):\n- Category I: Teaching-Learning and Evaluation Related Activities (Direct teaching hours, examination duties).\n- Category II: Professional Development, Co-Curricular & Extension Activities (Student clubs, seminars organized).\n- Category III: Research & Academic Contributions (Peer-reviewed journals: 25 points/paper; Impact factor > 5 adds 30 points; Research projects > 10 Lakhs: 20 points).",
        "doc_type": "standard",
        "doc_id": "ugc_api_regulations"
    },
    # 3. NIRF Parameters
    {
        "standard": "NIRF",
        "section": "Research and Professional Practice (RPC)",
        "content": "NIRF Research and Professional Practice (RPC) Weightage: 30%\n- Combined metric for Publications (PU): Assessed based on Scopus and Web of Science databases.\n- Combined metric for Quality of Publications (QP): Citations per faculty member over 3-year sliding window.\n- Footprint of Projects and Professional Practice (FPPP): Research funding received from DST, SERB, DBT, and industry.",
        "doc_type": "standard",
        "doc_id": "nirf_rpc_guidelines"
    },
    # 4. WASC Standards
    {
        "standard": "WASC",
        "section": "CFR 2 - Achieving Educational Objectives Through Core Functions",
        "content": "WASC Senior College and University Commission Criteria for Review:\n- Guideline 2.8: The institution clearly defines expectations for research, scholarship, and creative activity appropriate to the institutional purpose.\n- Guideline 2.9: Where research is an essential component, the institution provides appropriate infrastructure, support, and resources to ensure faculty scholarship.",
        "doc_type": "standard",
        "doc_id": "wasc_cfr_2"
    },
    # 5. Faculty Profiles
    {
        "standard": "Faculty: Dr. Ameer Hamza",
        "section": "Computer Science & Engineering",
        "content": "Faculty ID: CS-101\nDesignation: Associate Professor\nDepartment: Computer Science & Engineering\nPublications & Impact: 14 papers in IEEE Transactions on Affective Computing & Pattern Recognition (Scopus/WoS indexed). Total Citations: 520. Average Impact Factor: 8.4.\nGrants & Projects: Principal Investigator for DST-SERB AI Project (₹35.0 Lakhs, 2023-2026).\nPatents: 2 Published Indian Patents on Autonomous Neural Signal Processing.",
        "doc_type": "faculty_profile",
        "doc_id": "fac_cs_101"
    },
    {
        "standard": "Faculty: Dr. Sarah Connor",
        "section": "Robotics & Automation",
        "content": "Faculty ID: ROB-204\nDesignation: Professor\nDepartment: Robotics & Automation\nPublications & Impact: 11 papers in Nature Robotics and IEEE Robotics & Automation Letters. Total Citations: 410. Average Impact Factor: 9.1.\nGrants & Projects: DRDO Co-Investigator for Autonomous Quadcopter Swarm Navigation (₹65.0 Lakhs).\nPatents: 1 Granted International Patent on Vision-Based Obstacle Avoidance.",
        "doc_type": "faculty_profile",
        "doc_id": "fac_rob_204"
    },
    {
        "standard": "Faculty: Dr. Rajiv Menon",
        "section": "Biotechnology",
        "content": "Faculty ID: BIO-305\nDesignation: Assistant Professor\nDepartment: Biotechnology\nPublications & Impact: 9 papers in Journal of Biological Chemistry and Elsevier Bioresource Technology. Total Citations: 290. Average Impact Factor: 5.8.\nGrants & Projects: DBT Bio-CARe Grant on Microbial Enzyme Synthesis (₹28.5 Lakhs).\nPatents: 1 Published Patent on Bioremediation Catalyst.",
        "doc_type": "faculty_profile",
        "doc_id": "fac_bio_305"
    },
    # 6. Student Profiles
    {
        "standard": "Student: Aryan Sharma",
        "section": "Computer Science & Engineering",
        "content": "Student ID: STU-2024-001\nName: Aryan Sharma\nDepartment: Computer Science & Engineering\nBatch: 2021-2025\nAchievements & Awards:\n- 1st Prize Winner, Smart India Hackathon (SIH 2024) - Cash Prize ₹1,00,000.\n- Best Undergraduate Paper Award at IEEE INDICON 2024 on Edge AI.\n- Google Summer of Code (GSoC) 2024 Contributor with Linux Foundation.\n- 5 Star Coder on HackerRank with 1800+ LeetCode rating.",
        "doc_type": "student_profile",
        "doc_id": "student_stu_2024_001"
    },
    {
        "standard": "Student: Ananya Verma",
        "section": "Robotics & Automation",
        "content": "Student ID: STU-2024-042\nName: Ananya Verma\nDepartment: Robotics & Automation\nBatch: 2022-2026\nAchievements & Awards:\n- Gold Medalist at National University Robocon 2024.\n- Published Research Paper in Springer Lecture Notes on Drone Autonomy.\n- Winner of Tata Crucible Campus Quiz 2024.\n- Holds 1 Provisional Patent on Agricultural Drone Sprayer.",
        "doc_type": "student_profile",
        "doc_id": "student_stu_2024_042"
    },
    # 7. Campus Events
    {
        "standard": "Event: International Conference on Next-Gen Computing & AI (ICNCAI-2024)",
        "section": "Computer Science & Engineering",
        "content": "Event Title: International Conference on Next-Gen Computing & AI (ICNCAI-2024)\nType: International Conference\nDepartment: Computer Science & Engineering\nDates: October 14-16, 2024\nParticipants: 420 Registered Delegates (85 International, 335 National)\nFunding Agency: DST-SERB & IEEE Computer Society (₹7.5 Lakhs)\nDescription: Premier 3-day conference featuring 6 keynote sessions, 80 oral presentations, and IEEE Scopus-indexed conference proceedings.",
        "doc_type": "campus_event",
        "doc_id": "event_icncai_2024"
    },
    {
        "standard": "Event: National FDP on AICTE Approved Pedagogy & Research Methodologies",
        "section": "Humanities & Sciences",
        "content": "Event Title: National FDP on AICTE Approved Pedagogy & Research Methodologies\nType: Faculty Development Program (FDP)\nDepartment: Humanities & Sciences\nDates: July 5-11, 2024\nParticipants: 110 Faculty Members across 45 Universities\nFunding Agency: AICTE ATAL Academy Grant (₹3.5 Lakhs)\nDescription: 1-week national faculty training on generative AI, NEP 2020 outcome-based education, and high-impact research publishing.",
        "doc_type": "campus_event",
        "doc_id": "event_fdp_atal_2024"
    }
]

def populate_vault():
    print(f"Pushing {len(DOCUMENTS)} academic documents into Sovereign RAG Engine...")
    success = 0
    for doc in DOCUMENTS:
        try:
            res = requests.post(f"{BASE_URL}/knowledge/documents", json=doc)
            if res.status_code == 200:
                print(f"✅ Ingested: {doc['doc_id']} ({doc['doc_type']})")
                success += 1
            else:
                print(f"❌ Failed: {doc['doc_id']} - {res.text}")
        except Exception as e:
            print(f"❌ Connection error: {e}")
        time.sleep(0.15)
        
    print(f"\n✨ Vector DB Population Complete! {success}/{len(DOCUMENTS)} documents successfully embedded.")

if __name__ == "__main__":
    populate_vault()
