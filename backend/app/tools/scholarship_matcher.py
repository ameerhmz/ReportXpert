from typing import Dict, Any, List, Optional
import re

SCHOLARSHIP_CATALOG = [
    {
        "id": "AMITY-MERIT-100",
        "name": "Amity 100% On-Admission & Continuation Merit Scholarship",
        "category": "Academic Merit",
        "min_cgpa": 9.3,
        "max_income_lakhs": 100.0,
        "target_gender": "ALL",
        "target_departments": "ALL",
        "financial_benefit": "100% Full Tuition Fee Waiver (₹1.80L – ₹3.20L per annum)",
        "sponsoring_agency": "Amity University Uttar Pradesh",
        "documents_required": [
            "Class XII / Qualifying Degree Marksheet (93%+ or CGPA >= 9.3)",
            "Bonafide Student Certificate",
            "Dean / HoI Verification of Academic Standing"
        ],
        "description": "Awarded to top rankers and extraordinary academic achievers with aggregate 93%+ in qualifying examinations or CGPA >= 9.3 in university semesters."
    },
    {
        "id": "AMITY-MERIT-50",
        "name": "Amity 50% High-Performance Merit Scholarship",
        "category": "Academic Merit",
        "min_cgpa": 8.8,
        "max_income_lakhs": 100.0,
        "target_gender": "ALL",
        "target_departments": "ALL",
        "financial_benefit": "50% Tuition Fee Concession (₹90,000 – ₹1.60L per annum)",
        "sponsoring_agency": "Amity University Uttar Pradesh",
        "documents_required": [
            "Semester Grade Cards (CGPA >= 8.8)",
            "Disciplinary Clearance from Proctor's Office",
            "Minimum 75% Attendance Record"
        ],
        "description": "Awarded to students maintaining outstanding academic performance with CGPA >= 8.8 across semesters."
    },
    {
        "id": "AMITY-MERIT-25",
        "name": "Amity 25% Academic Progression Scholarship",
        "category": "Academic Merit",
        "min_cgpa": 8.0,
        "max_income_lakhs": 100.0,
        "target_gender": "ALL",
        "target_departments": "ALL",
        "financial_benefit": "25% Tuition Fee Concession (₹45,000 – ₹80,000 per annum)",
        "sponsoring_agency": "Amity University Uttar Pradesh",
        "documents_required": [
            "Semester Grade Sheets (CGPA >= 8.0)",
            "Recommendation from Faculty Mentor / Head of Department"
        ],
        "description": "Incentive scholarship for consistent scholars with CGPA between 8.0 and 8.79."
    },
    {
        "id": "AMITY-MCM-AID",
        "name": "Amity Merit-cum-Means Financial Assistance Grant",
        "category": "EWS / Means",
        "min_cgpa": 7.5,
        "max_income_lakhs": 4.5,
        "target_gender": "ALL",
        "target_departments": "ALL",
        "financial_benefit": "50% Tuition Waiver + Free Access to Digital Library & Book Bank",
        "sponsoring_agency": "Amity Student Welfare Directorate",
        "documents_required": [
            "Tehsildar-Issued Annual Family Income Certificate (< ₹4.50 Lakhs)",
            "Latest 6-Month Bank Statement of Parents / Guardians",
            "Affidavit of No Other External Sponsoring Scholarship",
            "CGPA Grade Sheet (>= 7.5)"
        ],
        "description": "Supports meritorious students from economically constrained families to ensure higher education without financial distress."
    },
    {
        "id": "AICTE-PRAGATI-GIRLS",
        "name": "AICTE Pragati Scholarship for Girl Students",
        "category": "Girl Child / Technical",
        "min_cgpa": 6.5,
        "max_income_lakhs": 8.0,
        "target_gender": "FEMALE",
        "target_departments": ["AIIT", "Computer Science", "Information Technology", "Electronics", "Mechanical", "Biotechnology"],
        "financial_benefit": "₹50,000 per annum towards Tuition Fee & Laptop / Study Material Grant",
        "sponsoring_agency": "Ministry of Education / AICTE, Govt of India",
        "documents_required": [
            "AICTE Central Portal Student Registration Form",
            "Class X & XII Marksheets",
            "Competent Authority Income Certificate (< ₹8.0 Lakhs)",
            "Aadhaar-Seeded Bank Passbook Copy"
        ],
        "description": "Empowers female students pursuing Degree / Diploma technical education. Up to two girl children per family eligible."
    },
    {
        "id": "GOI-POSTMATRIC-SCST",
        "name": "Centrally Sponsored Post-Matric Scholarship for SC/ST Students",
        "category": "SC/ST Welfare",
        "min_cgpa": 5.0,
        "max_income_lakhs": 2.5,
        "target_gender": "ALL",
        "target_departments": "ALL",
        "financial_benefit": "100% Non-Refundable Compulsory Fee Reimbursement + ₹13,500/year Maintenance Allowance",
        "sponsoring_agency": "Ministry of Social Justice & Empowerment / UP Social Welfare Dept",
        "documents_required": [
            "Digital Caste Certificate verified on edistrict.up.gov.in",
            "Income Certificate issued by Revenue Authority (< ₹2.50 Lakhs)",
            "Fee Receipt & Bonafide Certificate from University Registrar",
            "National Scholarship Portal (NSP) Application Printout"
        ],
        "description": "Statutory government scholarship providing full fee coverage and living stipend for Scheduled Caste & Scheduled Tribe scholars."
    },
    {
        "id": "GOI-POSTMATRIC-OBC",
        "name": "Post-Matric Scholarship & Fee Reimbursement for OBC Students",
        "category": "OBC Welfare",
        "min_cgpa": 6.0,
        "max_income_lakhs": 2.5,
        "target_gender": "ALL",
        "target_departments": "ALL",
        "financial_benefit": "Substantial Tuition Reimbursement up to ₹50,000 + Maintenance Grant",
        "sponsoring_agency": "Backward Class Welfare Department, Govt of Uttar Pradesh",
        "documents_required": [
            "OBC Non-Creamy Layer Certificate",
            "Income Certificate (< ₹2.50 Lakhs)",
            "University Verified Enrollment ID & UP Scholarship Portal Token"
        ],
        "description": "Statutory state support scheme for OBC category students admitted to technical and professional higher education."
    },
    {
        "id": "UGC-INDIRA-GANDHI-SGC",
        "name": "UGC Indira Gandhi Post-Graduate Scholarship for Single Girl Child",
        "category": "Single Girl Child",
        "min_cgpa": 6.0,
        "max_income_lakhs": 100.0,
        "target_gender": "FEMALE",
        "target_departments": "ALL",
        "financial_benefit": "₹36,200 per annum for 2 Years (Total ₹72,400 direct DBT)",
        "sponsoring_agency": "University Grants Commission (UGC)",
        "documents_required": [
            "First-Class Magistrate Notarized Affidavit stating Single Girl Child status in family",
            "Admission Proof into Regular Full-time Master's / PG Degree",
            "Birth Certificate & Family Ration Card"
        ],
        "description": "UGC affirmative scholarship to compensate direct costs of higher education for families having a single girl child."
    },
    {
        "id": "AMITY-DEFENCE-WARDS",
        "name": "Amity Martyr's & Armed Forces Personnel Wards Scholarship",
        "category": "Defence / Paramilitary",
        "min_cgpa": 6.0,
        "max_income_lakhs": 100.0,
        "target_gender": "ALL",
        "target_departments": "ALL",
        "financial_benefit": "25% to 50% Concession on Tuition Fee across entire programme duration",
        "sponsoring_agency": "Amity University Uttar Pradesh",
        "documents_required": [
            "Discharge Certificate / Service Book of Defence Personnel",
            "Zila Sainik Welfare Board Dependent Identity Card",
            "Gallantry / Disability Certificate (for special concession)"
        ],
        "description": "Institutional respect concession for wards of serving and retired Army, Navy, Air Force, and Paramilitary personnel."
    },
    {
        "id": "AMITY-SPORTS-EXCELLENCE",
        "name": "Amity National & International Sports Excellence Scholarship",
        "category": "Sports",
        "min_cgpa": 5.5,
        "max_income_lakhs": 100.0,
        "target_gender": "ALL",
        "target_departments": "ALL",
        "financial_benefit": "100% Waiver for International Athletes, 50% for National Medalists, 25% for State Champions",
        "sponsoring_agency": "Amity Directorate of Physical Education",
        "documents_required": [
            "Recognized Federation Merit Certificates (IOA / SAI / National Games)",
            "University Sports Trials Evaluation Report",
            "Medical Fitness Certificate"
        ],
        "description": "Full and partial scholarships for student athletes representing state, university, or nation in recognized championships."
    }
]

class ScholarshipMatcher:
    """
    Intelligent Air-Gapped Scholarship Matching & Policy Engine.
    Evaluates student XYZ parameters (CGPA, income, category, gender) against institutional & govt policies.
    """

    def parse_query_parameters(self, text: str) -> Dict[str, Any]:
        """Extracts CGPA, income, category, gender, branch from natural language."""
        lowered = text.lower()

        # CGPA extraction (e.g., "8.8 cgpa", "cgpa of 9.1", "cgpa: 7.8")
        cgpa = 0.0
        cgpa_match = re.search(r'(?:cgpa|gpa|score|percentage|marks)?\s*(?:is|of|:)?\s*(\d+(?:\.\d+)?)\s*(?:cgpa|gpa|%|percent)?', lowered)
        # Look specifically for numbers between 5.0 and 10.0
        for num in re.findall(r'\b([5-9]\.\d{1,2}|10(?:\.0)?)\b', lowered):
            try:
                cgpa = float(num)
                break
            except Exception:
                pass

        # Income extraction (e.g., "4.5 lakhs", "income of 3 lakh", "4.2 lpa", "250000")
        income_lakhs = 50.0  # default large
        income_match = re.search(r'(?:income|family income|annual income)?\s*(?:is|of|:)?\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lac|lpa)', lowered)
        if income_match:
            try:
                income_lakhs = float(income_match.group(1))
            except Exception:
                pass
        else:
            # Check for raw rupees like 300000
            raw_num_match = re.search(r'\b(\d{5,7})\b', lowered)
            if raw_num_match:
                val = float(raw_num_match.group(1))
                if val > 10000:
                    income_lakhs = round(val / 100000.0, 2)

        # Category
        category = "GENERAL"
        if "obc" in lowered or "backward" in lowered:
            category = "OBC"
        elif "sc" in lowered or "scheduled caste" in lowered:
            category = "SC"
        elif "st" in lowered or "scheduled tribe" in lowered:
            category = "ST"
        elif "ews" in lowered or "economically weaker" in lowered:
            category = "EWS"

        # Gender
        gender = "ALL"
        if any(w in lowered for w in ["girl", "female", "woman", "she", "her", "daughter"]):
            gender = "FEMALE"
        elif any(w in lowered for w in ["boy", "male", "son", "he", "his"]):
            gender = "MALE"

        # Special criteria
        special = []
        if any(w in lowered for w in ["single girl", "only child"]):
            special.append("SINGLE_GIRL_CHILD")
        if any(w in lowered for w in ["sports", "athlete", "national player"]):
            special.append("SPORTS")
        if any(w in lowered for w in ["defence", "army", "navy", "air force", "martyr", "soldier"]):
            special.append("DEFENCE")
        if any(w in lowered for w in ["disabled", "handicap", "divyang", "specially abled"]):
            special.append("SPECIALLY_ABLED")

        # Department
        dept = "ALL"
        if any(w in lowered for w in ["aiit", "information technology", "bca", "mca", "it"]):
            dept = "AIIT"
        elif any(w in lowered for w in ["cse", "computer science", "b.tech cse"]):
            dept = "Computer Science"
        elif any(w in lowered for w in ["biotech", "biotechnology"]):
            dept = "Biotechnology"
        elif any(w in lowered for w in ["management", "mba", "bba"]):
            dept = "Management"

        return {
            "cgpa": cgpa,
            "income_lakhs": income_lakhs,
            "category": category,
            "gender": gender,
            "special": special,
            "department": dept
        }

    def match_scholarships(self, student_params: Dict[str, Any]) -> Dict[str, Any]:
        """Matches extracted or provided student details against all scholarship schemes."""
        cgpa = float(student_params.get("cgpa", 0.0))
        income = float(student_params.get("income_lakhs", 100.0))
        category = student_params.get("category", "GENERAL").upper()
        gender = student_params.get("gender", "ALL").upper()
        special = student_params.get("special", [])
        dept = student_params.get("department", "ALL")

        eligible = []
        near_eligible = []

        for s in SCHOLARSHIP_CATALOG:
            s_cgpa = s["min_cgpa"]
            s_income = s["max_income_lakhs"]
            s_gender = s["target_gender"]
            s_cat = s["category"]

            # Checks
            cgpa_ok = (cgpa >= s_cgpa) if cgpa > 0 else True
            income_ok = (income <= s_income)

            gender_ok = (s_gender == "ALL") or (gender == "FEMALE" and s_gender == "FEMALE")
            if s_gender == "FEMALE" and gender == "MALE":
                gender_ok = False

            category_ok = True
            if "SC/ST" in s_cat and category not in ["SC", "ST"]:
                category_ok = False
            elif "OBC" in s_cat and category != "OBC":
                category_ok = False

            # Special conditions
            if s["id"] == "UGC-INDIRA-GANDHI-SGC" and "SINGLE_GIRL_CHILD" not in special and gender != "FEMALE":
                continue
            if s["id"] == "AMITY-SPORTS-EXCELLENCE" and "SPORTS" not in special:
                continue
            if s["id"] == "AMITY-DEFENCE-WARDS" and "DEFENCE" not in special:
                continue

            if cgpa_ok and income_ok and gender_ok and category_ok:
                reasons = []
                if cgpa > 0:
                    reasons.append(f"CGPA {cgpa} meets minimum requirement of {s_cgpa}")
                if income < 100.0:
                    reasons.append(f"Family income ₹{income}L is within ceiling limit of ₹{s_income}L")
                if category != "GENERAL" and category in s_cat:
                    reasons.append(f"Satisfies {category} reservation quota")
                if gender == "FEMALE" and s_gender == "FEMALE":
                    reasons.append("Eligible under Women Empowerment affirmative mandate")

                eligible.append({
                    "id": s["id"],
                    "name": s["name"],
                    "category": s["category"],
                    "financial_benefit": s["financial_benefit"],
                    "sponsoring_agency": s["sponsoring_agency"],
                    "match_reasons": reasons,
                    "documents_required": s["documents_required"],
                    "description": s["description"]
                })
            else:
                # Near eligibility check
                near_reasons = []
                if not cgpa_ok and cgpa > 0 and (s_cgpa - cgpa <= 0.5):
                    near_reasons.append(f"Need CGPA >= {s_cgpa} (current is {cgpa}, shortfall of {round(s_cgpa - cgpa, 2)})")
                if not income_ok and (income - s_income <= 1.0):
                    near_reasons.append(f"Family income ₹{income}L marginally exceeds limit of ₹{s_income}L")
                
                if near_reasons:
                    near_eligible.append({
                        "name": s["name"],
                        "reasons": near_reasons,
                        "financial_benefit": s["financial_benefit"]
                    })

        return {
            "student_profile_evaluated": {
                "cgpa": cgpa if cgpa > 0 else "Not Specified (Assumed Eligible)",
                "family_income": f"₹{income} Lakhs/year" if income < 100.0 else "Not Specified",
                "category": category,
                "gender": gender,
                "department": dept
            },
            "total_eligible_count": len(eligible),
            "eligible_scholarships": eligible,
            "near_eligible_scholarships": near_eligible
        }

    def generate_natural_response(self, query: str) -> str:
        """Parses query and generates a polished, executive response ready for chatbot output."""
        params = self.parse_query_parameters(query)
        res = self.match_scholarships(params)
        eval_p = res["student_profile_evaluated"]
        eligible = res["eligible_scholarships"]
        near = res["near_eligible_scholarships"]

        out = [
            f"### 🎓 Student Scholarship Eligibility Assessment\n",
            f"**Student Profile Evaluated:**",
            f"- **Academic Standing / CGPA:** `{eval_p['cgpa']}`",
            f"- **Annual Family Income:** `{eval_p['family_income']}`",
            f"- **Social Category:** `{eval_p['category']}`",
            f"- **Gender:** `{eval_p['gender']}`\n",
            f"Found **{len(eligible)} Highly Applicable Scholarship Schemes**:\n"
        ]

        if not eligible:
            out.append("No scholarships matched the exact criteria. Please check the near-eligible criteria below.")
        else:
            for idx, s in enumerate(eligible, start=1):
                out.append(f"#### {idx}. {s['name']}")
                out.append(f"- **Category / Agency:** `{s['category']}` • *{s['sponsoring_agency']}*")
                out.append(f"- **Financial Award:** **{s['financial_benefit']}**")
                out.append(f"- **Eligibility Justification:**")
                for r in s['match_reasons']:
                    out.append(f"  - ✅ {r}")
                out.append(f"- **Mandatory Documentation Required:**")
                for d in s['documents_required']:
                    out.append(f"  - 📄 {d}")
                out.append("")

        if near:
            out.append("---")
            out.append("#### 💡 Next-Tier / Near-Eligible Opportunities:")
            for n in near:
                out.append(f"- **{n['name']}** ({n['financial_benefit']}):")
                for r in n['reasons']:
                    out.append(f"  - ⚠️ {r}")

        out.append("\n> **Institutional Notice:** Application forms and Bonafide Verification Certificates can be endorsed at the Amity Student Welfare Office or Registrar's Secretariat.")
        return "\n".join(out)

scholarship_matcher = ScholarshipMatcher()
