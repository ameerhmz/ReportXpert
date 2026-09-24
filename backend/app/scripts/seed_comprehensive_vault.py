#!/usr/bin/env python3
"""
ReportXpert Sovereign Knowledge Vault Seeder
Populates:
1. Moves Ameer Hamza from Faculty to Student (STU-2024-007, AI & ML, SIH Team Lead & Gold Medalist).
2. 100 More Students across all Engineering, IT, Sciences, and Management departments.
3. 28 Distinguished Faculty members (including Dr. Meenakshi Srivastava, Dr. Namrata Singh, Dr. Geetika Srivastava, etc.).
4. 26 Campus Events (Conferences, FDPs, Hackathons, Conclaves, Workshops, Extension Drives).
All embedded locally with zero external network egress.
"""

import sys
from pathlib import Path
import json

# Setup import path
backend_dir = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.tools.rag_engine import rag_engine

print(f"Loaded rag_engine with {len(rag_engine.documents)} initial documents.")

# -----------------------------------------------------------------------------
# 1. PURGE AMEER HAMZA FROM FACULTY
# -----------------------------------------------------------------------------
initial_count = len(rag_engine.documents)
rag_engine.documents = [
    d for d in rag_engine.documents 
    if not (d.get("doc_type") == "faculty_profile" and "ameer" in str(d).lower())
    and d.get("id") not in ["fac_cs_101", "faculty_cs_101"]
]
purged = initial_count - len(rag_engine.documents)
if purged > 0:
    print(f"✓ Removed Ameer Hamza from Faculty profiles ({purged} record removed).")

# -----------------------------------------------------------------------------
# 2. SEED AMEER HAMZA AS STAR STUDENT + 100 MORE STUDENTS (TOTAL 101)
# -----------------------------------------------------------------------------
STUDENTS = [
    {
        "id": "student_STU-2024-007",
        "doc_type": "student_profile",
        "standard": "Student: Ameer Hamza",
        "section": "Computer Science & Engineering",
        "content": (
            "Student Name: Ameer Hamza\n"
            "Student ID: STU-2024-007\n"
            "Department: Computer Science & Engineering (AIIT)\n"
            "Program: B.Tech (Computer Science & Engineering - AI & Machine Learning)\n"
            "Batch Year: 2021-2025 (Final Year)\n"
            "Academic Standing: CGPA 9.72 / 10.0 (Rank #1, Dean's Honor Roll)\n"
            "Category: General / Merit Scholar\n"
            "Key Verified Achievements & Awards:\n"
            "- Lead Architect & System Engineer of ReportXpert: Sovereign Air-Gapped Accreditation & Institutional Intelligence System.\n"
            "- Team Lead & Winner, Smart India Hackathon (SIH 2024 Finalist) with Cash Award ₹1,00,000.\n"
            "- Author of 2 Peer-Reviewed Scopus-Indexed papers in IEEE Transactions on Affective Computing and Biomedical Materials & Devices.\n"
            "- Recipient of Vice-Chancellor's 100% Merit Scholarship (₹3.2 Lakhs/year fee waiver).\n"
            "- 6-Star Competitive Programmer on CodeChef (Rating 2280) and LeetCode Knight (Rating 2140).\n"
            "- Secured Pre-Placement Offer (PPO) as Senior AI Research Engineer with CTC ₹38.00 LPA."
        )
    },
    {
        "id": "student_STU-2024-001",
        "doc_type": "student_profile",
        "standard": "Student: Aryan Sharma",
        "section": "Computer Science & Engineering",
        "content": (
            "Student Name: Aryan Sharma\n"
            "Student ID: STU-2024-001\n"
            "Department: Computer Science & Engineering\n"
            "Program: B.Tech (Computer Science & Engineering)\n"
            "Batch Year: 2021-2025\n"
            "Academic Standing: CGPA 9.35 / 10.0\n"
            "Category: General\n"
            "Key Verified Achievements & Awards:\n"
            "- 1st Prize Winner, Smart India Hackathon (SIH 2024) - Cash Prize ₹1,00,000.\n"
            "- Best Undergraduate Paper Award at IEEE INDICON 2024 on Edge AI.\n"
            "- Google Summer of Code (GSoC) 2024 Contributor with Linux Foundation.\n"
            "- Placed at Amazon AWS with CTC ₹28.50 LPA."
        )
    },
    {
        "id": "student_STU-2024-042",
        "doc_type": "student_profile",
        "standard": "Student: Ananya Verma",
        "section": "Robotics & Automation",
        "content": (
            "Student Name: Ananya Verma\n"
            "Student ID: STU-2024-042\n"
            "Department: Robotics & Automation\n"
            "Program: B.Tech (Robotics & Artificial Intelligence)\n"
            "Batch Year: 2022-2026\n"
            "Academic Standing: CGPA 9.48 / 10.0\n"
            "Category: Female in STEM / OBC\n"
            "Key Verified Achievements & Awards:\n"
            "- Gold Medalist at National University Robocon 2024.\n"
            "- Published Research Paper in Springer Lecture Notes on Autonomous Drone Swarms.\n"
            "- Recipient of AICTE Pragati Scholarship for Girls in Technical Education.\n"
            "- Holds 1 Indian Provisional Patent on Precision Agricultural Drone Sprayer."
        )
    },
    {
        "id": "student_STU-2024-015",
        "doc_type": "student_profile",
        "standard": "Student: Devansh Saxena",
        "section": "Computer Science & Engineering",
        "content": (
            "Student Name: Devansh Saxena\n"
            "Student ID: STU-2024-015\n"
            "Department: Computer Science & Engineering\n"
            "Program: B.Tech (Cyber Security & Digital Forensics)\n"
            "Batch Year: 2021-2025\n"
            "Academic Standing: CGPA 8.92 / 10.0\n"
            "Category: General\n"
            "Key Verified Achievements & Awards:\n"
            "- 1st Runner Up, KAVACH National Cyber Security Hackathon 2023.\n"
            "- Discovered 3 Critical Vulnerabilities in open-source identity providers (CVE recognized).\n"
            "- Certified Ethical Hacker (CEH v12) and Offensive Security Certified Professional (OSCP).\n"
            "- Placed at CrowdStrike with CTC ₹24.00 LPA."
        )
    },
    {
        "id": "student_STU-2024-019",
        "doc_type": "student_profile",
        "standard": "Student: Riya Sen",
        "section": "Information Technology",
        "content": (
            "Student Name: Riya Sen\n"
            "Student ID: STU-2024-019\n"
            "Department: Information Technology (AIIT)\n"
            "Program: BCA / MCA Dual Degree (Cloud Computing)\n"
            "Batch Year: 2022-2026\n"
            "Academic Standing: CGPA 9.15 / 10.0\n"
            "Category: General / Female in STEM\n"
            "Key Verified Achievements & Awards:\n"
            "- AWS Certified Solutions Architect Associate (Score 920/1000).\n"
            "- Winner, Microsoft Imagine Cup India Regional Finals 2024.\n"
            "- Published Paper on Kubernetes Auto-scaling in IEEE CloudCom.\n"
            "- Recipient of Reliance Foundation Undergraduate Scholarship (₹2.0 Lakhs)."
        )
    },
    {
        "id": "student_STU-2024-023",
        "doc_type": "student_profile",
        "standard": "Student: Tanmay Bhatnagar",
        "section": "Biotechnology",
        "content": (
            "Student Name: Tanmay Bhatnagar\n"
            "Student ID: STU-2024-023\n"
            "Department: Biotechnology & Bioinformatics\n"
            "Program: B.Tech (Biotechnology)\n"
            "Batch Year: 2021-2025\n"
            "Academic Standing: CGPA 9.20 / 10.0\n"
            "Category: General\n"
            "Key Verified Achievements & Awards:\n"
            "- Research Fellow at Indian Institute of Toxicology Research (CSIR-IITR).\n"
            "- Co-authored paper on Microbial Biosurfactants in Elsevier Bioresource Technology.\n"
            "- 1st Prize, National Bio-Design Challenge at IIT Delhi.\n"
            "- Admitted with full scholarship to Johns Hopkins University for M.S. in Biomedical Engineering."
        )
    },
    {
        "id": "student_STU-2024-028",
        "doc_type": "student_profile",
        "standard": "Student: Ishaan Joshi",
        "section": "Electronics & Communication",
        "content": (
            "Student Name: Ishaan Joshi\n"
            "Student ID: STU-2024-028\n"
            "Department: Electronics & Communication\n"
            "Program: B.Tech (ECE - VLSI & Embedded Systems)\n"
            "Batch Year: 2021-2025\n"
            "Academic Standing: CGPA 9.05 / 10.0\n"
            "Category: General\n"
            "Key Verified Achievements & Awards:\n"
            "- Designed 16-bit RISC-V SoC taped out on SkyWater 130nm process via Tiny Tapeout.\n"
            "- Winner of Texas Instruments Innovation Challenge 2024.\n"
            "- Published paper in IEEE Transactions on Circuits & Systems.\n"
            "- Placed at Qualcomm India as Hardware Engineer with CTC ₹22.50 LPA."
        )
    },
    {
        "id": "student_STU-2024-033",
        "doc_type": "student_profile",
        "standard": "Student: Sneha Roy",
        "section": "Computer Science & Engineering",
        "content": (
            "Student Name: Sneha Roy\n"
            "Student ID: STU-2024-033\n"
            "Department: Computer Science & Engineering\n"
            "Program: M.Tech (Computer Science - Data Science)\n"
            "Batch Year: 2023-2025\n"
            "Academic Standing: CGPA 9.60 / 10.0\n"
            "Category: Female in STEM / EWS\n"
            "Key Verified Achievements & Awards:\n"
            "- Kaggle Grandmaster (Top 100 in NLP Competitions worldwide).\n"
            "- AICTE National PG Scholarship recipient (₹12,400/month).\n"
            "- 2 Scopus Papers on Multi-Modal LLM Fine-Tuning in IEEE Access.\n"
            "- Placed at Microsoft R&D with CTC ₹32.00 LPA."
        )
    },
    {
        "id": "student_STU-2024-038",
        "doc_type": "student_profile",
        "standard": "Student: Siddharth Nair",
        "section": "Mechanical & Aerospace",
        "content": (
            "Student Name: Siddharth Nair\n"
            "Student ID: STU-2024-038\n"
            "Department: Mechanical & Aerospace Engineering\n"
            "Program: B.Tech (Aerospace Engineering)\n"
            "Batch Year: 2021-2025\n"
            "Academic Standing: CGPA 8.85 / 10.0\n"
            "Category: General\n"
            "Key Verified Achievements & Awards:\n"
            "- Team Captain, Formula Student Bharat & SAE Aero Design East (USA).\n"
            "- Designed hybrid carbon fiber rocket fuselage achieving 10,000 ft apogee.\n"
            "- Research Intern at ISRO Liquid Propulsion Systems Centre (LPSC).\n"
            "- Placed at Skyroot Aerospace with CTC ₹18.00 LPA."
        )
    },
    {
        "id": "student_STU-2024-045",
        "doc_type": "student_profile",
        "standard": "Student: Aditi Kulkarni",
        "section": "Management & Business",
        "content": (
            "Student Name: Aditi Kulkarni\n"
            "Student ID: STU-2024-045\n"
            "Department: Management & Business Studies\n"
            "Program: MBA (Business Analytics & FinTech)\n"
            "Batch Year: 2023-2025\n"
            "Academic Standing: CGPA 9.40 / 10.0\n"
            "Category: General\n"
            "Key Verified Achievements & Awards:\n"
            "- National Winner, Tata Steel Steel-a-thon Business Case Competition.\n"
            "- CFA Level 1 Cleared with 90th percentile score.\n"
            "- Co-authored Case Study published in Harvard Business Publishing (HBP).\n"
            "- Placed at Goldman Sachs as Global Investment Research Analyst with CTC ₹26.00 LPA."
        )
    }
]

# Dynamically generate students 11 through 101 (91 more students) with rich variations
DEPARTMENTS = [
    ("Computer Science & Engineering", ["B.Tech (CSE - AI & ML)", "B.Tech (Data Science)", "B.Tech (Cyber Security)", "B.Tech (Cloud Computing)", "M.Tech (CSE)"]),
    ("Information Technology", ["B.Tech (IT)", "BCA", "MCA (Software Engineering)", "M.Sc (IT)"]),
    ("Robotics & Automation", ["B.Tech (Robotics & Mechatronics)", "M.Tech (Autonomous Systems)"]),
    ("Biotechnology", ["B.Tech (Biotech)", "B.Tech (Bioinformatics)", "M.Sc (Biotechnology)"]),
    ("Electronics & Communication", ["B.Tech (ECE)", "B.Tech (IoT & Sensors)", "M.Tech (VLSI Design)"]),
    ("Mechanical & Aerospace", ["B.Tech (Mechanical)", "B.Tech (Aerospace)", "M.Tech (Thermal Engg)"]),
    ("Management & Business", ["BBA (FinTech)", "MBA (Business Analytics)", "MBA (Digital Marketing)"]),
    ("Applied Sciences", ["B.Sc (Applied Mathematics)", "M.Sc (Data Analytics)", "Ph.D. (Computational Physics)"])
]

NAMES = [
    "Rohan Mehta", "Megha Singhania", "Kabir Malhotra", "Shreya Agarwal", "Pranav Pillai",
    "Pooja Chawla", "Aman Deep Singh", "Kritika Bose", "Yashwant Rao", "Diya Nambiar",
    "Harshavardhan Reddy", "Sanya Grover", "Varun Chopra", "Nidhi Bansal", "Raghav Tandon",
    "Avani Parekh", "Kunal Ghosh", "Simran Kaur", "Farhan Ali", "Tanya Mathur",
    "Mayank Tripathi", "Ritika Sengupta", "Chirag Soni", "Mansi Bhatt", "Akhil George",
    "Shruti Deshpande", "Sameer Khan", "Bhavya Jain", "Aditya Dixit", "Neha Kashyap",
    "Rohit Agnihotri", "Priyanka Das", "Ayush Saxena", "Parul Mittal", "Zeeshan Qureshi",
    "Sonal Chauhan", "Nikhil Prabhu", "Alisha Khan", "Vikramaditya Rathore", "Shalini Iyer",
    "Karanveer Singh", "Anoushka Sen", "Tejaswini G", "Parthiban M", "Deepali Sharma",
    "Samarth Rao", "Kevin D'Souza", "Swati Mishra", "Aayushmaan Sen", "Radhika Nair",
    "Pranjal Tiwari", "Mahima Kapoor", "Saurabh Pandey", "Aakanksha Rawat", "Devika Menon",
    "Chiranjiv Roy", "Nivedita Sundaram", "Abhishek Jha", "Tushar Bhatt", "Shivangi Tiwari",
    "Karthik Varma", "Meenakshi Sundaram", "Rahul Kaushik", "Anjali Panicker", "Harshit Tyagi",
    "Natasha Fernandes", "Eshan Mukherjee", "Shweta Singh", "Raghavendra Pratap", "Anirudh Swaminathan",
    "Mohit Chauhan", "Vanya Rastogi", "Gurpreet Singh", "Gaurav Sen", "Manisha Rao",
    "Abhinav Shukla", "Chetna Sharma", "Dhruv Saxena", "Ishita Bhardwaj", "Arman Malik",
    "Rhea Kapoor", "Siddhant Goel", "Tanvi Bajaj", "Raunak Agarwal", "Sonam Wangchuk",
    "Lavanya Murthy", "Rishabh Todi", "Anindita Pal", "Kshitij Gautam", "Pragya Shukla",
    "Arvind Narayanan"
]

ACHIEVEMENT_POOLS = [
    "1st Prize in Inter-University Hackathon with cash award of ₹50,000",
    "Published research paper in Scopus-indexed Springer Nature conference proceedings",
    "Selected for prestigious Google Summer of Code (GSoC) open-source fellowship",
    "Gold Medalist in All-India University Innovation Exhibition",
    "Awarded AICTE National Merit Scholarship for Outstanding Academic Performance",
    "Filed provisional Indian patent for automated smart agricultural system",
    "Finalist at UNESCO India-Africa International Hackathon",
    "Cleared AWS Certified Cloud Solutions Architect with 94% score",
    "Ranked in Global Top 2% in LeetCode Weekly Contest (Rating 1980+)",
    "Winner of National Youth Technical Paper Presentation Competition",
    "Awarded Post-Matric State Government Scholarship covering 100% academic tuition",
    "Secured Campus Placement with ₹16.50 LPA package at marquee tech recruiter",
    "Developed open-source machine learning library with 500+ GitHub stars",
    "Captain of University Tech Fest Robotics Challenge Team (National Champions)",
    "Recipient of Reliance Foundation STEM Undergraduate Scholarship (₹2.0 Lakhs)",
    "Co-authored research chapter in Elsevier Academic Press monograph",
    "Organized 24-Hour Hackathon with 600+ delegates and corporate sponsorships",
    "Certified Kubernetes Administrator (CKA) with distinction",
    "Winner of Vice-Chancellor's Trophy for All-Round Academic & Research Excellence",
    "Published patent on IoT-driven environmental water pollution sensor"
]

CATEGORIES = ["General", "OBC-NCL", "SC", "ST", "EWS", "Female in STEM", "Divyangjan", "Minority"]

for i, name in enumerate(NAMES, start=101):
    dept_info = DEPARTMENTS[i % len(DEPARTMENTS)]
    dept = dept_info[0]
    prog = dept_info[1][i % len(dept_info[1])]
    sid = f"STU-2024-{i:03d}"
    cgpa = round(7.85 + (i * 17 % 200) / 100.0, 2)
    if cgpa > 9.95: cgpa = 9.85
    batch = "2021-2025" if i % 2 == 0 else "2022-2026"
    cat = CATEGORIES[i % len(CATEGORIES)]
    ach1 = ACHIEVEMENT_POOLS[i % len(ACHIEVEMENT_POOLS)]
    ach2 = ACHIEVEMENT_POOLS[(i + 7) % len(ACHIEVEMENT_POOLS)]
    ach3 = ACHIEVEMENT_POOLS[(i + 13) % len(ACHIEVEMENT_POOLS)]
    
    ctc = round(8.5 + (i * 13 % 240) / 10.0, 1)

    content = (
        f"Student Name: {name}\n"
        f"Student ID: {sid}\n"
        f"Department: {dept}\n"
        f"Program: {prog}\n"
        f"Batch Year: {batch}\n"
        f"Academic Standing: CGPA {cgpa} / 10.0\n"
        f"Category: {cat}\n"
        f"Key Verified Achievements & Awards:\n"
        f"- {ach1}.\n"
        f"- {ach2}.\n"
        f"- {ach3}.\n"
        f"- Campus Placement Offer / Status: Placed with CTC ₹{ctc} LPA."
    )

    STUDENTS.append({
        "id": f"student_{sid}",
        "doc_type": "student_profile",
        "standard": f"Student: {name}",
        "section": dept,
        "content": content
    })

print(f"Prepared {len(STUDENTS)} student records.")

# -----------------------------------------------------------------------------
# 3. SEED 28 DISTINGUISHED FACULTY PROFILES (INCLUDING DR. MEENAKSHI SRIVASTAVA)
# -----------------------------------------------------------------------------
FACULTY = [
    {
        "id": "fac_cse_001",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Meenakshi Srivastava",
        "section": "Computer Science & Engineering",
        "content": (
            "Faculty Name: Dr. Meenakshi Srivastava\n"
            "Faculty ID: CSE-001\n"
            "Designation: Professor & Head of Department (AIIT)\n"
            "Highest Qualification: Ph.D. in Computer Science (IIT Roorkee)\n"
            "Department: Computer Science & Engineering\n"
            "Experience: 19 Years (Academic & Industrial R&D)\n"
            "Publications & Impact: 28 Scopus/WoS Indexed Research Papers. Cumulative Citations: 890. H-Index: 18. Average Impact Factor: 6.8.\n"
            "Flagship Publication: 'MSFHNet: Mobile Siamese Forward Harmonic Net for Histological Structure-Based Breast Cancer Classification Using Histopathological Images' in Biomedical Materials and Devices (Springer/Nature, 2024).\n"
            "Grants & Projects: Principal Investigator for DST-SERB Core Research Grant on Oncology AI (₹48.5 Lakhs, 2023-2026); AICTE Research Promotion Scheme (RPS) Project on Deep Medical Diagnostics (₹18.5 Lakhs).\n"
            "Patents: 2 Published Indian Patents on Automated Histopathological Image Diagnosis and Deep Cellular Classification.\n"
            "Ph.D. Scholars Guided: 7 Awarded, 4 Ongoing."
        )
    },
    {
        "id": "fac_cse_002",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Namrata Singh",
        "section": "Computer Science & Engineering",
        "content": (
            "Faculty Name: Dr. Namrata Singh\n"
            "Faculty ID: CSE-002\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Deep Learning (MNNIT Allahabad)\n"
            "Department: Computer Science & Engineering\n"
            "Publications & Impact: 19 Scopus/WoS Papers in IEEE Access and Springer. Citations: 540. H-Index: 14.\n"
            "Co-Author: 'MSFHNet: Mobile Siamese Forward Harmonic Net for Histological Structure-Based Breast Cancer Classification'.\n"
            "Grants & Projects: Co-PI on DST-SERB Biomedical AI Grant (₹35.0 Lakhs).\n"
            "Patents: 1 Published Patent on Forward Harmonic Feature Fusion for Medical Images."
        )
    },
    {
        "id": "fac_cse_003",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Geetika Srivastava",
        "section": "Computer Science & Engineering",
        "content": (
            "Faculty Name: Dr. Geetika Srivastava\n"
            "Faculty ID: CSE-003\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Medical Image Computing\n"
            "Department: Computer Science & Engineering\n"
            "Publications & Impact: 16 Scopus Papers in Elsevier & Springer. Citations: 420. H-Index: 12.\n"
            "Co-Author: 'MSFHNet: Mobile Siamese Forward Harmonic Net for Histological Structure-Based Breast Cancer Classification'.\n"
            "Grants & Projects: ICMR Research Support on Digital Pathology (₹22.0 Lakhs)."
        )
    },
    {
        "id": "fac_rob_204",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Sarah Connor",
        "section": "Robotics & Automation",
        "content": (
            "Faculty Name: Dr. Sarah Connor\n"
            "Faculty ID: ROB-204\n"
            "Designation: Professor & Director, Robotics Research Centre\n"
            "Highest Qualification: Ph.D. in Robotics (MIT / IISc)\n"
            "Department: Robotics & Automation\n"
            "Publications & Impact: 22 papers in Nature Robotics and IEEE Robotics & Automation Letters. Total Citations: 640. Average Impact Factor: 9.1.\n"
            "Grants & Projects: DRDO Principal Investigator for Autonomous Quadcopter Swarm Navigation (₹65.0 Lakhs).\n"
            "Patents: 2 Granted International Patents on Vision-Based Obstacle Avoidance for Autonomous Rovers."
        )
    },
    {
        "id": "fac_bio_305",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Rajiv Menon",
        "section": "Biotechnology",
        "content": (
            "Faculty Name: Dr. Rajiv Menon\n"
            "Faculty ID: BIO-305\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Biochemical Engineering (IIT Delhi)\n"
            "Department: Biotechnology & Bioinformatics\n"
            "Publications & Impact: 18 papers in Journal of Biological Chemistry and Elsevier Bioresource Technology. Total Citations: 510. Average Impact Factor: 6.4.\n"
            "Grants & Projects: DBT Bio-CARe Grant on Microbial Enzyme Synthesis (₹28.5 Lakhs).\n"
            "Patents: 1 Granted Indian Patent on Bioremediation Catalyst for Industrial Effluents."
        )
    },
    {
        "id": "fac_cse_004",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Vikram Singhal",
        "section": "Computer Science & Engineering",
        "content": (
            "Faculty Name: Dr. Vikram Singhal\n"
            "Faculty ID: CSE-004\n"
            "Designation: Professor\n"
            "Highest Qualification: Ph.D. in Distributed Systems (IIT Kanpur)\n"
            "Department: Computer Science & Engineering\n"
            "Publications & Impact: 24 Scopus/WoS Papers in IEEE Transactions on Cloud Computing. Citations: 710. H-Index: 16.\n"
            "Grants & Projects: MeitY Grant on High-Throughput Edge Computing Architectures (₹42.0 Lakhs).\n"
            "Patents: 2 Published Indian Patents on Fault-Tolerant Microservices."
        )
    },
    {
        "id": "fac_it_005",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Shalini Sharma",
        "section": "Information Technology",
        "content": (
            "Faculty Name: Dr. Shalini Sharma\n"
            "Faculty ID: IT-005\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Cyber Security (IIT Delhi)\n"
            "Department: Information Technology (AIIT)\n"
            "Publications & Impact: 15 Scopus Papers in ACM Transactions on Information and System Security. Citations: 390. H-Index: 11.\n"
            "Grants & Projects: DST Cyber-Physical Systems (ICPS) Project (₹31.5 Lakhs).\n"
            "Patents: 1 Granted Patent on Dynamic Zero-Trust Network Access Engine."
        )
    },
    {
        "id": "fac_ece_006",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Rajesh K. Gupta",
        "section": "Electronics & Communication",
        "content": (
            "Faculty Name: Dr. Rajesh K. Gupta\n"
            "Faculty ID: ECE-006\n"
            "Designation: Professor & Dean, Faculty of Engineering\n"
            "Highest Qualification: Ph.D. in VLSI Design (BITS Pilani)\n"
            "Department: Electronics & Communication\n"
            "Publications & Impact: 31 Scopus/WoS Papers in IEEE Transactions on VLSI. Citations: 950. H-Index: 21.\n"
            "Grants & Projects: ISRO Sponsored Project on Radiation-Hardened Satellite Telemetry Chips (₹54.0 Lakhs).\n"
            "Patents: 3 Granted Indian Patents on Low-Power Reconfigurable Logic Blocks."
        )
    },
    {
        "id": "fac_bio_007",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Priya Nambiar",
        "section": "Biotechnology",
        "content": (
            "Faculty Name: Dr. Priya Nambiar\n"
            "Faculty ID: BIO-007\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Computational Genomics (IISc Bangalore)\n"
            "Department: Biotechnology & Bioinformatics\n"
            "Publications & Impact: 18 Scopus Papers in Nature Communications & Oxford Bioinformatics. Citations: 610. H-Index: 15.\n"
            "Grants & Projects: DBT Extramural Grant on CRISPR Cas-12 Target Prediction (₹38.0 Lakhs)."
        )
    },
    {
        "id": "fac_mech_008",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Alok Ranjan",
        "section": "Mechanical & Aerospace",
        "content": (
            "Faculty Name: Dr. Alok Ranjan\n"
            "Faculty ID: MECH-008\n"
            "Designation: Professor & Head, Advanced Materials Lab\n"
            "Highest Qualification: Ph.D. in Materials Science (IIT Kharagpur)\n"
            "Department: Mechanical & Aerospace Engineering\n"
            "Publications & Impact: 24 Scopus Papers in Elsevier Composites Part B. Citations: 780. H-Index: 17.\n"
            "Grants & Projects: DRDO Grant on High-Temperature Ceramic Matrix Composites (₹72.0 Lakhs).\n"
            "Patents: 2 Granted Patents on Shock-Absorbing Aerogel Sandwich Panels."
        )
    },
    {
        "id": "fac_math_009",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Sunita Deshmukh",
        "section": "Applied Sciences",
        "content": (
            "Faculty Name: Dr. Sunita Deshmukh\n"
            "Faculty ID: MATH-009\n"
            "Designation: Professor\n"
            "Highest Qualification: Ph.D. in Number Theory & Cryptography (TIFR Mumbai)\n"
            "Department: Applied Mathematics & Data Science\n"
            "Publications & Impact: 20 Scopus Papers in Journal of Cryptology. Citations: 490. H-Index: 13.\n"
            "Grants & Projects: National Board for Higher Mathematics (NBHM) Research Grant (₹16.0 Lakhs)."
        )
    },
    {
        "id": "fac_mgmt_010",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Amitav Ghosh",
        "section": "Management & Business",
        "content": (
            "Faculty Name: Dr. Amitav Ghosh\n"
            "Faculty ID: MGMT-010\n"
            "Designation: Professor & Dean, Management Studies\n"
            "Highest Qualification: Ph.D. in Finance & Econometrics (IIM Ahmedabad)\n"
            "Department: Management & Business Studies\n"
            "Publications & Impact: 14 ABDC-A / Scopus Papers in Journal of Banking & Finance. Citations: 340.\n"
            "Grants & Projects: ICSSR Major Research Project on Digital Banking Financial Inclusion (₹14.5 Lakhs)."
        )
    },
    {
        "id": "fac_cse_011",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Preeti Mishra",
        "section": "Computer Science & Engineering",
        "content": (
            "Faculty Name: Dr. Preeti Mishra\n"
            "Faculty ID: CSE-011\n"
            "Designation: Assistant Professor\n"
            "Highest Qualification: Ph.D. in Natural Language Processing (IIIT Hyderabad)\n"
            "Department: Computer Science & Engineering\n"
            "Publications & Impact: 12 Scopus Papers in ACL & EMNLP Proceedings. Citations: 310. H-Index: 9.\n"
            "Grants & Projects: SERB TARE Grant on Indic Language Translation Models (₹18.0 Lakhs)."
        )
    },
    {
        "id": "fac_it_012",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Sanjay Verma",
        "section": "Information Technology",
        "content": (
            "Faculty Name: Dr. Sanjay Verma\n"
            "Faculty ID: IT-012\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Software Engineering (MNIT Jaipur)\n"
            "Department: Information Technology (AIIT)\n"
            "Publications & Impact: 14 Scopus Papers in IEEE Transactions on Software Engineering. Citations: 280."
        )
    },
    {
        "id": "fac_ece_013",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Kavita Rao",
        "section": "Electronics & Communication",
        "content": (
            "Faculty Name: Dr. Kavita Rao\n"
            "Faculty ID: ECE-013\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Wireless Networks (IIT Madras)\n"
            "Department: Electronics & Communication\n"
            "Publications & Impact: 17 Scopus Papers in IEEE Transactions on Wireless Communications. Citations: 450.\n"
            "Grants & Projects: Department of Telecommunications (DoT) 5G Testbed Grant (₹32.0 Lakhs)."
        )
    },
    {
        "id": "fac_mech_014",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Devendra Nath",
        "section": "Mechanical & Aerospace",
        "content": (
            "Faculty Name: Dr. Devendra Nath\n"
            "Faculty ID: MECH-014\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Thermal Sciences (IIT BHU)\n"
            "Department: Mechanical & Aerospace Engineering\n"
            "Publications & Impact: 15 Scopus Papers in Applied Thermal Engineering. Citations: 380.\n"
            "Grants & Projects: MNRE Solar Thermal Storage Research Project (₹24.0 Lakhs)."
        )
    },
    {
        "id": "fac_bio_015",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Ananya Mukherjee",
        "section": "Biotechnology",
        "content": (
            "Faculty Name: Dr. Ananya Mukherjee\n"
            "Faculty ID: BIO-015\n"
            "Designation: Assistant Professor\n"
            "Highest Qualification: Ph.D. in Industrial Bioprocessing (ICT Mumbai)\n"
            "Department: Biotechnology & Bioinformatics\n"
            "Publications & Impact: 11 Scopus Papers in Bioresource Technology. Citations: 290."
        )
    },
    {
        "id": "fac_cse_016",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Arvind Swaminathan",
        "section": "Computer Science & Engineering",
        "content": (
            "Faculty Name: Dr. Arvind Swaminathan\n"
            "Faculty ID: CSE-016\n"
            "Designation: Professor & Director, Sovereign AI Systems\n"
            "Highest Qualification: Ph.D. in Computer Vision (IIT Bombay)\n"
            "Department: Computer Science & Engineering\n"
            "Publications & Impact: 26 Scopus Papers in CVPR, ICCV, IEEE TPAMI. Citations: 1,120. H-Index: 23.\n"
            "Grants & Projects: DST-SERB Core Grant on Autonomous Vehicle Perception (₹58.0 Lakhs)."
        )
    },
    {
        "id": "fac_mgmt_017",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Ritu Saxena",
        "section": "Management & Business",
        "content": (
            "Faculty Name: Dr. Ritu Saxena\n"
            "Faculty ID: MGMT-017\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Behavioral Marketing (FMS Delhi)\n"
            "Department: Management & Business Studies\n"
            "Publications & Impact: 10 ABDC-A Papers in Journal of Consumer Marketing. Citations: 210."
        )
    },
    {
        "id": "fac_chem_018",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Harish Chandra",
        "section": "Applied Sciences",
        "content": (
            "Faculty Name: Dr. Harish Chandra\n"
            "Faculty ID: CHEM-018\n"
            "Designation: Professor & Dean, Science Research\n"
            "Highest Qualification: Ph.D. in Green Nanotechnology (IIT Roorkee)\n"
            "Department: Applied Chemistry & Materials\n"
            "Publications & Impact: 29 Scopus Papers in ACS Applied Materials & Interfaces. Citations: 980. H-Index: 20.\n"
            "Grants & Projects: CSIR Major Research Grant on Solar Photocatalysts (₹36.0 Lakhs)."
        )
    },
    {
        "id": "fac_it_019",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Pooja Vats",
        "section": "Information Technology",
        "content": (
            "Faculty Name: Dr. Pooja Vats\n"
            "Faculty ID: IT-019\n"
            "Designation: Assistant Professor\n"
            "Highest Qualification: Ph.D. in Blockchain Security (JNU New Delhi)\n"
            "Department: Information Technology (AIIT)\n"
            "Publications & Impact: 9 Scopus Papers in IEEE Access. Citations: 180."
        )
    },
    {
        "id": "fac_cse_020",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Brijesh Kumar",
        "section": "Computer Science & Engineering",
        "content": (
            "Faculty Name: Dr. Brijesh Kumar\n"
            "Faculty ID: CSE-020\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Federated Learning (IIT Ropar)\n"
            "Department: Computer Science & Engineering\n"
            "Publications & Impact: 13 Scopus Papers in IEEE Transactions on Big Data. Citations: 340."
        )
    },
    {
        "id": "fac_ece_021",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Manjula Devi",
        "section": "Electronics & Communication",
        "content": (
            "Faculty Name: Dr. Manjula Devi\n"
            "Faculty ID: ECE-021\n"
            "Designation: Professor\n"
            "Highest Qualification: Ph.D. in Biomedical Signal Processing (IIT Guwahati)\n"
            "Department: Electronics & Communication\n"
            "Publications & Impact: 21 Scopus Papers in IEEE TBME. Citations: 620. H-Index: 16.\n"
            "Grants & Projects: DST WOS-A Project on Non-Invasive Cardiac Telemetry (₹26.5 Lakhs)."
        )
    },
    {
        "id": "fac_mech_022",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Shrikant Joshi",
        "section": "Mechanical & Aerospace",
        "content": (
            "Faculty Name: Dr. Shrikant Joshi\n"
            "Faculty ID: MECH-022\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Mechatronics (IIT Indore)\n"
            "Department: Mechanical & Aerospace Engineering\n"
            "Publications & Impact: 16 Scopus Papers in IEEE/ASME Transactions on Mechatronics. Citations: 410."
        )
    },
    {
        "id": "fac_bio_023",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Madhuri Patel",
        "section": "Biotechnology",
        "content": (
            "Faculty Name: Dr. Madhuri Patel\n"
            "Faculty ID: BIO-023\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Molecular Oncology (NII New Delhi)\n"
            "Department: Biotechnology & Bioinformatics\n"
            "Publications & Impact: 15 Scopus Papers in Cancer Research. Citations: 480. H-Index: 14."
        )
    },
    {
        "id": "fac_cse_024",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Tarun Agrawal",
        "section": "Computer Science & Engineering",
        "content": (
            "Faculty Name: Dr. Tarun Agrawal\n"
            "Faculty ID: CSE-024\n"
            "Designation: Assistant Professor\n"
            "Highest Qualification: Ph.D. in Quantum Information (HRI Prayagraj)\n"
            "Department: Computer Science & Engineering\n"
            "Publications & Impact: 8 Scopus Papers in Physical Review A and IEEE Quantum Engineering. Citations: 190."
        )
    },
    {
        "id": "fac_math_025",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Neha Rastogi",
        "section": "Applied Sciences",
        "content": (
            "Faculty Name: Dr. Neha Rastogi\n"
            "Faculty ID: MATH-025\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in Applied Statistics (ISI Kolkata)\n"
            "Department: Applied Mathematics & Data Science\n"
            "Publications & Impact: 12 Scopus Papers in Journal of Statistical Planning and Inference. Citations: 260."
        )
    },
    {
        "id": "fac_it_026",
        "doc_type": "faculty_profile",
        "standard": "Faculty: Dr. Upendra Yadav",
        "section": "Information Technology",
        "content": (
            "Faculty Name: Dr. Upendra Yadav\n"
            "Faculty ID: IT-026\n"
            "Designation: Associate Professor\n"
            "Highest Qualification: Ph.D. in High Performance Computing (IIT Mandi)\n"
            "Department: Information Technology (AIIT)\n"
            "Publications & Impact: 14 Scopus Papers in IEEE Transactions on Parallel and Distributed Systems. Citations: 350."
        )
    }
]

print(f"Prepared {len(FACULTY)} faculty records.")

# -----------------------------------------------------------------------------
# 4. SEED 26 CAMPUS EVENTS (CONFERENCES, FDPS, HACKATHONS, CONCLAVES, EXTENSIONS)
# -----------------------------------------------------------------------------
EVENTS = [
    {
        "id": "event_icncai_2024",
        "doc_type": "campus_event",
        "standard": "Event: International Conference on Next-Gen Computing & AI (ICNCAI-2024)",
        "section": "Computer Science & Engineering",
        "content": (
            "Event Title: International Conference on Next-Gen Computing & AI (ICNCAI-2024)\n"
            "Type: International Conference\n"
            "Department: Computer Science & Engineering (AIIT)\n"
            "Dates: October 14-16, 2024 (3 Days)\n"
            "Participants: 420 Registered Delegates (85 International, 335 National)\n"
            "Funding Agency: DST-SERB & IEEE Computer Society (₹7.50 Lakhs)\n"
            "Description & Outcome: Flagship international conference featuring 6 keynote sessions by IEEE Fellows, 84 peer-reviewed paper presentations published in IEEE Xplore (Scopus indexed), and 3 corporate innovation workshops."
        )
    },
    {
        "id": "event_fdp_atal_2024",
        "doc_type": "campus_event",
        "standard": "Event: National FDP on AICTE Approved Pedagogy & Research Methodologies",
        "section": "Humanities & Sciences",
        "content": (
            "Event Title: National FDP on AICTE Approved Pedagogy & Research Methodologies\n"
            "Type: Faculty Development Program (FDP)\n"
            "Department: Computer Science & Engineering\n"
            "Dates: July 5-11, 2024 (1 Week)\n"
            "Participants: 110 Faculty Members across 45 Universities\n"
            "Funding Agency: AICTE ATAL Academy Grant (₹3.50 Lakhs)\n"
            "Description & Outcome: Intensive faculty development covering outcome-based NEP 2020 curricular delivery, patent drafting, and generative AI in research."
        )
    },
    {
        "id": "event_icetet_2025",
        "doc_type": "campus_event",
        "standard": "Event: International Conference on Emerging Trends in Engineering & Technology (ICETET-2025)",
        "section": "Faculty of Engineering",
        "content": (
            "Event Title: International Conference on Emerging Trends in Engineering & Technology (ICETET-2025)\n"
            "Type: International Conference\n"
            "Department: Faculty of Engineering\n"
            "Dates: February 18-20, 2025\n"
            "Participants: 380 Registered Delegates (60 International)\n"
            "Funding Agency: Springer Nature & AICTE (₹6.00 Lakhs)\n"
            "Description & Outcome: Multi-track engineering symposium covering AI, VLSI, smart grid technologies, and advanced polymers. 72 papers published in Springer LNCS."
        )
    },
    {
        "id": "event_biosummit_2024",
        "doc_type": "campus_event",
        "standard": "Event: Global Bio-Summit on CRISPR & Precision Medicine (BIOSUMMIT-2024)",
        "section": "Biotechnology",
        "content": (
            "Event Title: Global Bio-Summit on CRISPR & Precision Medicine (BIOSUMMIT-2024)\n"
            "Type: International Conference\n"
            "Department: Biotechnology & Bioinformatics\n"
            "Dates: November 8-10, 2024\n"
            "Participants: 310 Scientists & Industry Delegates\n"
            "Funding Agency: Department of Biotechnology (DBT) & ICMR (₹8.00 Lakhs)\n"
            "Description & Outcome: Focus on genomic therapeutics, enzyme engineering, and bioinformatics pipelines. 4 corporate MoUs signed with bio-pharma firms."
        )
    },
    {
        "id": "event_icra_asia_2024",
        "doc_type": "campus_event",
        "standard": "Event: International Symposium on Robotics & Autonomous Systems (ISRAS-2024)",
        "section": "Robotics & Automation",
        "content": (
            "Event Title: International Symposium on Robotics & Autonomous Systems (ISRAS-2024)\n"
            "Type: International Conference\n"
            "Department: Robotics & Automation\n"
            "Dates: December 4-6, 2024\n"
            "Participants: 450 Delegates\n"
            "Funding Agency: DRDO & IEEE Robotics and Automation Society (₹9.50 Lakhs)\n"
            "Description & Outcome: Live drone swarming demonstrations, robotic manipulation challenges, and high-level peer reviews."
        )
    },
    {
        "id": "event_ic5g_2025",
        "doc_type": "campus_event",
        "standard": "Event: International Conference on 5G/6G Wireless Networks & Cyber-Physical Systems",
        "section": "Electronics & Communication",
        "content": (
            "Event Title: International Conference on 5G/6G Wireless Networks & Cyber-Physical Systems\n"
            "Type: International Conference\n"
            "Department: Electronics & Communication\n"
            "Dates: January 22-24, 2025\n"
            "Participants: 340 Delegates\n"
            "Funding Agency: Department of Telecommunications (DoT) & DST (₹6.50 Lakhs)\n"
            "Description & Outcome: Terahertz communication papers, MIMO beamforming algorithms, and industry testbed displays."
        )
    },
    {
        "id": "event_sih_internal_2024",
        "doc_type": "campus_event",
        "standard": "Event: Smart India Hackathon (SIH 2024) Campus Grand Hackathon",
        "section": "Computer Science & Engineering",
        "content": (
            "Event Title: Smart India Hackathon (SIH 2024) Campus Grand Hackathon\n"
            "Type: National Hackathon\n"
            "Department: Computer Science & Engineering (AIIT)\n"
            "Dates: September 20-21, 2024 (36-Hour Non-stop)\n"
            "Participants: 720 Students (120 Competitive Teams)\n"
            "Funding Agency: Institutional Innovation Council (IIC) & Ministry of Education (₹4.00 Lakhs)\n"
            "Description & Outcome: 35 teams shortlisted for National SIH Finals in software and hardware editions. Mentored by 25 senior alumni and industry CTOs."
        )
    },
    {
        "id": "event_hack_amity_2024",
        "doc_type": "campus_event",
        "standard": "Event: HackAmity 2024: National 36-Hour Hackathon on Sovereign AI & Green Tech",
        "section": "Information Technology",
        "content": (
            "Event Title: HackAmity 2024: National 36-Hour Hackathon on Sovereign AI & Green Tech\n"
            "Type: National Hackathon\n"
            "Department: Information Technology (AIIT)\n"
            "Dates: April 12-14, 2024\n"
            "Participants: 540 Coders across 40 Institutions\n"
            "Funding Agency: Corporate Industry Sponsorships (Google Cloud, GitHub, MongoDB) (₹5.00 Lakhs)\n"
            "Description & Outcome: Top prize awarded to on-premise air-gapped LLM privacy sandbox. ₹2.5 Lakhs distributed in cash prizes."
        )
    },
    {
        "id": "event_robofest_2024",
        "doc_type": "campus_event",
        "standard": "Event: National Autonomous Drone & Robocon Challenge (ROBOFEST-2024)",
        "section": "Robotics & Automation",
        "content": (
            "Event Title: National Autonomous Drone & Robocon Challenge (ROBOFEST-2024)\n"
            "Type: National Technical Championship\n"
            "Department: Robotics & Automation\n"
            "Dates: March 15-16, 2024\n"
            "Participants: 350 Participants (65 College Teams)\n"
            "Funding Agency: DRDO & Tata Advanced Systems (₹3.50 Lakhs)\n"
            "Description & Outcome: Arena racing, autonomous maze navigation, and payload delivery."
        )
    },
    {
        "id": "event_cyber_ctf_2024",
        "doc_type": "campus_event",
        "standard": "Event: KAVACH Inter-University 24-Hour Capture The Flag (CTF) Cyber Defense Challenge",
        "section": "Computer Science & Engineering",
        "content": (
            "Event Title: KAVACH Inter-University 24-Hour Capture The Flag (CTF) Cyber Defense Challenge\n"
            "Type: Cyber Security Competition\n"
            "Department: Computer Science & Engineering\n"
            "Dates: May 24-25, 2024\n"
            "Participants: 280 Ethical Hackers (70 Teams)\n"
            "Funding Agency: Ministry of Home Affairs Cyber Cell & DSCI (₹3.00 Lakhs)\n"
            "Description & Outcome: Binary exploitation, reverse engineering, web security, and cryptography tracks."
        )
    },
    {
        "id": "event_atal_cyber_2024",
        "doc_type": "campus_event",
        "standard": "Event: AICTE ATAL FDP on Cloud Security & DevSecOps Architecture",
        "section": "Information Technology",
        "content": (
            "Event Title: AICTE ATAL FDP on Cloud Security & DevSecOps Architecture\n"
            "Type: Faculty Development Program (FDP)\n"
            "Department: Information Technology (AIIT)\n"
            "Dates: August 19-24, 2024\n"
            "Participants: 95 Faculty Members\n"
            "Funding Agency: AICTE ATAL Academy (₹3.50 Lakhs)\n"
            "Description & Outcome: Hands-on container security, CI/CD pipeline auditing, and compliance frameworks."
        )
    },
    {
        "id": "event_ugc_nep_2024",
        "doc_type": "campus_event",
        "standard": "Event: UGC Malaviya Mission FDP on Outcome-Based Education & NEP 2020",
        "section": "Humanities & Sciences",
        "content": (
            "Event Title: UGC Malaviya Mission FDP on Outcome-Based Education & NEP 2020\n"
            "Type: Faculty Development Program (FDP)\n"
            "Department: Academic Affairs & IQAC\n"
            "Dates: June 10-15, 2024\n"
            "Participants: 140 Faculty Members across University Campuses\n"
            "Funding Agency: University Grants Commission (UGC) (₹2.50 Lakhs)\n"
            "Description & Outcome: CCFUG framework implementation, Academic Bank of Credits (ABC) integration, and multidisciplinary curriculum design."
        )
    },
    {
        "id": "event_atal_robo_2025",
        "doc_type": "campus_event",
        "standard": "Event: AICTE ATAL FDP on Autonomous Mobile Robots & Industrial Digital Twins",
        "section": "Robotics & Automation",
        "content": (
            "Event Title: AICTE ATAL FDP on Autonomous Mobile Robots & Industrial Digital Twins\n"
            "Type: Faculty Development Program (FDP)\n"
            "Department: Robotics & Automation\n"
            "Dates: January 6-11, 2025\n"
            "Participants: 85 Faculty Members\n"
            "Funding Agency: AICTE ATAL Academy (₹3.50 Lakhs)\n"
            "Description & Outcome: ROS2, NVIDIA Isaac Sim, and industrial AGV implementations."
        )
    },
    {
        "id": "event_research_method_2024",
        "doc_type": "campus_event",
        "standard": "Event: 2-Week National Workshop on Research Methodologies & High-Impact Publishing",
        "section": "Computer Science & Engineering",
        "content": (
            "Event Title: 2-Week National Workshop on Research Methodologies & High-Impact Publishing\n"
            "Type: Research Workshop\n"
            "Department: Directorate of Research & Innovation\n"
            "Dates: September 2-14, 2024\n"
            "Participants: 160 Research Scholars & Faculty\n"
            "Funding Agency: Self-Financed & Elsevier Academic Grant (₹2.00 Lakhs)\n"
            "Description & Outcome: Scopus/WoS journal targeting, LaTeX typography, statistical ANOVA/regression, and ethics in AI research."
        )
    },
    {
        "id": "event_cxo_conclave_2024",
        "doc_type": "campus_event",
        "standard": "Event: Annual Corporate CXO & HR Leadership Conclave 2024",
        "section": "Management & Business",
        "content": (
            "Event Title: Annual Corporate CXO & HR Leadership Conclave 2024\n"
            "Type: Industry Conclave\n"
            "Department: Corporate Resource Centre (CRC) & Management\n"
            "Dates: November 22, 2024\n"
            "Participants: 45 Corporate CXOs & 500 Graduating Students\n"
            "Funding Agency: Industry Corporate Sponsors (TCS, Infosys, Deloitte, HCL) (₹6.50 Lakhs)\n"
            "Description & Outcome: Panel discussions on Future of Tech Jobs, GenAI workforce integration, and placement MOUs signed."
        )
    },
    {
        "id": "event_startup_expo_2024",
        "doc_type": "campus_event",
        "standard": "Event: Amity Innovation Incubator Annual Startup Pitch Fest & Angel Expo",
        "section": "Management & Business",
        "content": (
            "Event Title: Amity Innovation Incubator Annual Startup Pitch Fest & Angel Expo\n"
            "Type: Entrepreneurship Summit\n"
            "Department: Innovation & Incubation Centre\n"
            "Dates: December 12-13, 2024\n"
            "Participants: 28 Startups & 18 Angel Investors\n"
            "Funding Agency: DST NIDHI TBI & Seed Fund Scheme (₹12.00 Lakhs)\n"
            "Description & Outcome: 6 student startups received seed commitments totaling ₹1.45 Crores in pre-seed funding."
        )
    },
    {
        "id": "event_fintech_roundtable_2025",
        "doc_type": "campus_event",
        "standard": "Event: National Industry-Academia Roundtable on Digital Banking & AI in FinTech",
        "section": "Management & Business",
        "content": (
            "Event Title: National Industry-Academia Roundtable on Digital Banking & AI in FinTech\n"
            "Type: Industry Roundtable\n"
            "Department: Management & Business Studies\n"
            "Dates: January 17, 2025\n"
            "Participants: 60 FinTech Leaders & Faculty\n"
            "Funding Agency: NPCI & Indian Banks' Association (IBA) (₹3.00 Lakhs)\n"
            "Description & Outcome: Regulatory sandboxes, RBI guidelines compliance, and fraud detection algorithms."
        )
    },
    {
        "id": "event_quantum_bootcamp_2024",
        "doc_type": "campus_event",
        "standard": "Event: 3-Day Hands-on Bootcamp on IBM Qiskit Quantum Computing",
        "section": "Computer Science & Engineering",
        "content": (
            "Event Title: 3-Day Hands-on Bootcamp on IBM Qiskit Quantum Computing\n"
            "Type: Technical Bootcamp\n"
            "Department: Computer Science & Engineering\n"
            "Dates: August 8-10, 2024\n"
            "Participants: 180 Students & Researchers\n"
            "Funding Agency: IBM Quantum Education Initiative (₹2.50 Lakhs)\n"
            "Description & Outcome: Quantum gates, Grover's algorithm, Shor's factoring, and quantum key distribution hands-on."
        )
    },
    {
        "id": "event_crispr_workshop_2024",
        "doc_type": "campus_event",
        "standard": "Event: National Hands-on Training on CRISPR-Cas9 Gene Editing Technologies",
        "section": "Biotechnology",
        "content": (
            "Event Title: National Hands-on Training on CRISPR-Cas9 Gene Editing Technologies\n"
            "Type: Laboratory Workshop\n"
            "Department: Biotechnology & Bioinformatics\n"
            "Dates: October 24-26, 2024\n"
            "Participants: 90 Scholars & Faculty\n"
            "Funding Agency: DBT Extramural Grant (₹4.00 Lakhs)\n"
            "Description & Outcome: Wet-lab gRNA design, electroporation, and mammalian cell line editing."
        )
    },
    {
        "id": "event_cloud_arch_2024",
        "doc_type": "campus_event",
        "standard": "Event: AWS & Kubernetes Cloud Native Systems Architecture Certification Bootcamp",
        "section": "Information Technology",
        "content": (
            "Event Title: AWS & Kubernetes Cloud Native Systems Architecture Certification Bootcamp\n"
            "Type: Technical Bootcamp\n"
            "Department: Information Technology (AIIT)\n"
            "Dates: September 26-28, 2024\n"
            "Participants: 220 Engineering Students\n"
            "Funding Agency: AWS Academy & Institutional CRC (₹2.00 Lakhs)\n"
            "Description & Outcome: 140 students achieved official AWS Cloud Practitioner and Solutions Architect certifications."
        )
    },
    {
        "id": "event_unnat_bharat_2024",
        "doc_type": "campus_event",
        "standard": "Event: Unnat Bharat Abhiyan Village Digital Literacy & Solar Energy Outreach Drive",
        "section": "Humanities & Sciences",
        "content": (
            "Event Title: Unnat Bharat Abhiyan Village Digital Literacy & Solar Energy Outreach Drive\n"
            "Type: Extension Activity (NAAC Criterion 3.6)\n"
            "Department: University Social Responsibility Cell\n"
            "Dates: June 15-20, 2024\n"
            "Participants: 120 Student Volunteers & 850 Rural Villagers\n"
            "Funding Agency: Ministry of Education Unnat Bharat Abhiyan Grant (₹1.75 Lakhs)\n"
            "Description & Outcome: Adopted 5 rural village panchayats in Lucknow district. Conducted digital banking literacy, solar micro-grid safety awareness, and distributed e-learning kits."
        )
    },
    {
        "id": "event_rural_stem_2024",
        "doc_type": "campus_event",
        "standard": "Event: Rural STEM Education & Robotics Camp for Underprivileged School Students",
        "section": "Computer Science & Engineering",
        "content": (
            "Event Title: Rural STEM Education & Robotics Camp for Underprivileged School Students\n"
            "Type: Extension Activity (NAAC Criterion 3.6)\n"
            "Department: Computer Science & Engineering (AIIT)\n"
            "Dates: November 14-16, 2024\n"
            "Participants: 400 Government School Students & 60 Student Mentors\n"
            "Funding Agency: Institutional CSR & IEEE Humanitarian Activity Committee (₹2.20 Lakhs)\n"
            "Description & Outcome: 3-day hands-on STEM workshop teaching basic Python, robotics, and science experiment kits."
        )
    },
    {
        "id": "event_blood_donation_2024",
        "doc_type": "campus_event",
        "standard": "Event: Annual Mega Blood Donation & Thalassemia Screening Camp 2024",
        "section": "Humanities & Sciences",
        "content": (
            "Event Title: Annual Mega Blood Donation & Thalassemia Screening Camp 2024\n"
            "Type: Community Health Drive\n"
            "Department: National Service Scheme (NSS) & Youth Red Cross\n"
            "Dates: October 1, 2024 (National Voluntary Blood Donation Day)\n"
            "Participants: 1,100 Student & Staff Donors\n"
            "Funding Agency: King George's Medical University (KGMU) & Red Cross (₹1.50 Lakhs)\n"
            "Description & Outcome: Collected 580 verified blood units for regional government hospitals and screened 350 students for Thalassemia minor."
        )
    },
    {
        "id": "event_green_campus_2024",
        "doc_type": "campus_event",
        "standard": "Event: Mega Tree Plantation, Solar Audit & Zero Plastic Campus Campaign",
        "section": "Applied Sciences",
        "content": (
            "Event Title: Mega Tree Plantation, Solar Audit & Zero Plastic Campus Campaign\n"
            "Type: Environmental Sustainability Drive (NAAC Criterion 7.1)\n"
            "Department: Environmental Science & Green Campus Committee\n"
            "Dates: August 15, 2024\n"
            "Participants: 1,400 Campus Community Members\n"
            "Funding Agency: UP Forest Department & University Green Fund (₹2.80 Lakhs)\n"
            "Description & Outcome: Planted 2,500 native fruit and shade trees on campus. Certified 100% elimination of single-use plastics and completed rooftop solar 120 kW energy audit."
        )
    },
    {
        "id": "event_data_sprint_2025",
        "doc_type": "campus_event",
        "standard": "Event: Sovereign DataSprint 2025: 48-Hour Machine Learning & AI Modeling Challenge",
        "section": "Computer Science & Engineering",
        "content": (
            "Event Title: Sovereign DataSprint 2025: 48-Hour Machine Learning & AI Modeling Challenge\n"
            "Type: AI Competition\n"
            "Department: Computer Science & Engineering (AIIT)\n"
            "Dates: January 10-12, 2025\n"
            "Participants: 310 Registered Participants (78 Teams)\n"
            "Funding Agency: CSI Student Chapter & Industry Partners (₹2.50 Lakhs)\n"
            "Description & Outcome: 48-hour continuous hackathon on multimodal document intelligence and fraud anomaly detection."
        )
    },
    {
        "id": "event_icbme_2024",
        "doc_type": "campus_event",
        "standard": "Event: International Conference on Biomedical Engineering & Medical Informatics (ICBME-2024)",
        "section": "Electronics & Communication",
        "content": (
            "Event Title: International Conference on Biomedical Engineering & Medical Informatics (ICBME-2024)\n"
            "Type: International Conference\n"
            "Department: Electronics & Communication & Biotechnology\n"
            "Dates: December 18-20, 2024\n"
            "Participants: 290 Registered Delegates\n"
            "Funding Agency: Elsevier & ICMR (₹5.50 Lakhs)\n"
            "Description & Outcome: 54 peer-reviewed research papers in computational histology, biosensors, and physiological monitoring."
        )
    }
]

print(f"Prepared {len(EVENTS)} campus event records.")

# -----------------------------------------------------------------------------
# 5. VECTOR EMBEDDING & INGESTION INTO SOVEREIGN RAG
# -----------------------------------------------------------------------------
TOTAL_NEW_DOCS = STUDENTS + FACULTY + EVENTS
print(f"\nComputing offline vector embeddings for {len(TOTAL_NEW_DOCS)} new documents...")

# Batch encode texts
contents = [d["content"] for d in TOTAL_NEW_DOCS]
vectors = rag_engine.encode(contents)

# Remove any previous records matching these new IDs to avoid duplicates
new_ids = {d["id"] for d in TOTAL_NEW_DOCS}
rag_engine.documents = [d for d in rag_engine.documents if d.get("id") not in new_ids]

for doc, vec in zip(TOTAL_NEW_DOCS, vectors):
    doc["vector"] = vec
    rag_engine.documents.append(doc)

# Global strict deduplication by document ID
seen_ids = set()
unique_docs = []
for d in rag_engine.documents:
    doc_id = d.get("id")
    if doc_id and doc_id not in seen_ids:
        seen_ids.add(doc_id)
        unique_docs.append(d)
rag_engine.documents = unique_docs

rag_engine._save_index()

print("\n" + "=" * 60)
print(f"🎉 SOVEREIGN VAULT SEEDING COMPLETED SUCCESSFULLY!")
print(f"Total Documents in Vector DB: {len(rag_engine.documents)}")
print(f"  - Students: {len([d for d in rag_engine.documents if d.get('doc_type') == 'student_profile'])}")
print(f"  - Faculty:  {len([d for d in rag_engine.documents if d.get('doc_type') == 'faculty_profile'])}")
print(f"  - Events:   {len([d for d in rag_engine.documents if d.get('doc_type') == 'campus_event'])}")
print(f"  - Standards:{len([d for d in rag_engine.documents if d.get('doc_type') == 'standard'])}")
print(f"  - Schemes:  {len([d for d in rag_engine.documents if d.get('doc_type') == 'scholarship_scheme'])}")
print(f"  - Papers:   {len([d for d in rag_engine.documents if d.get('doc_type') == 'research_paper'])}")
print("=" * 60)
