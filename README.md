Markdown
# 🚀 Architect AI: GenAI Resume Builder & ATS Analyzer

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

Architect AI is a full-stack, real-time resume generation and analysis tool. It combines a blazing-fast live preview interface with the analytical power of Google's Gemini API to act as a strict, constructive Applicant Tracking System (ATS). 

Built with an emphasis on rapid prototyping and clean architecture, this application allows users to dynamically craft their professional profiles and instantly score them against target roles.

---

## ✨ Core Features

* **⚡ Real-Time DOM Binding:** Instant visual feedback as you type, powered by vanilla JavaScript and dynamic HTML injection. No page reloads required.
* **🧠 Gemini ATS Brain:** Upload an external PDF or use the live form data to get brutally honest, constructive feedback, a calculated ATS score, and actionable improvement steps.
* **📄 Dynamic Templating Engine:** Choose from 10 distinct, production-ready resume templates ranging from classic corporate (ATS-friendly) to modern tech sidebar layouts.
* **🛡️ Smart Data Rendering:** Sections (like PhDs, Master's, or empty projects) intelligently hide themselves if left blank to preserve perfect typography and spacing.
* **🔗 Auto-Formatting Links:** Social inputs automatically convert into styled, clickable hyperlinks in the final document.
* **🖨️ Native PDF Export:** Custom `@media print` CSS ensures flawless, A4-perfect PDF exports with a single click, automatically saving with the candidate's name.

---

## 🛠️ Tech Stack

* **Backend:** Python 3, Flask, PyPDF2
* **Frontend:** HTML5, Tailwind CSS (via CDN), Vanilla JavaScript
* **AI Integration:** `google-generativeai` (Gemini 2.5 flash)

---

## 📂 Project Structure

```text
Architect-AI/
│
├── .env                  # Environment variables (API Keys) - DO NOT COMMIT
├── requirements.txt      # Python dependencies
├── app.py                # Main Flask application and routing
├── core_analyzer.py      # Gemini API integration and prompt engineering
│
├── static/
│   └── js/
│       └── builder.js    # Live DOM binding, dynamic UI logic, and API calls
│
└── templates/
    ├── index.html        # Main workspace UI
    └── templates_raw/    # The 10 HTML resume templates
        ├── tpl_01_executive.html
        ├── tpl_02_tech.html
        └── ... (up to 10)
🚀 Quick Start & Installation
1. Clone the repository

Bash
git clone https://github.com/imnismay/Architect-AI.git
cd Architect-AI
2. Install dependencies
Make sure you have Python installed, then run:

Bash
pip install -r requirements.txt
3. Environment Setup
Create a file named .env in the root directory and add your Google AI Studio API key:

Code snippet
GEMINI_API_KEY=your_gemini_api_key_here
FLASK_ENV=development
4. Fire it up

Bash
python app.py
Navigate to http://127.0.0.1:5000 in your web browser.

💡 Usage Guide
Select a Template: Use the dropdown on the left to choose a base design. The preview on the right will update instantly.

Input Data: Fill out your personal details, education, and projects. Watch the resume build itself in real-time. Leave fields blank to hide them.

Analyze: Set your target role and company at the top of the form, then click ATS Analyzer. Gemini will evaluate your profile and provide a score.

External Resumes: Inside the ATS Analyzer modal, you can upload an existing PDF resume to bypass the live form and have Gemini analyze the document directly.

Export: Click Export PDF to save your masterpiece.

👨‍💻 Author
MAYUR Computer Science Engineer & Founder of NISMAY Studios

Advocate of 'Vibe Coding'—building rapid, scalable web portals and autonomous AI tools without getting bogged down by rigid syntax. Focus on flow, creativity, and high utility."# Architect-AI" 
