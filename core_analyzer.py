import os
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Use the standard pro model
model = genai.GenerativeModel('gemini-2.5-flash')

def analyze_resume_data(resume_data, target_role, target_company, experience_level):
    """
    Takes user input and asks Gemini to return a strict JSON evaluation.
    """
    prompt = f"""
    You are an expert tech recruiter and ATS system. Analyze the following candidate data against their goals.
    
    Candidate Data:
    {json.dumps(resume_data, indent=2)}
    
    Current Experience Level: {experience_level}
    Target Role: {target_role}
    Target Company/Industry: {target_company}
    
    Provide a brutally honest but constructive analysis. 
    You MUST return ONLY a valid JSON object with the exact following schema. Do not use markdown blocks.
    
    {{
        "ats_score": 85, 
        "score_explanation": "Short sentence explaining the score",
        "strengths": ["point 1", "point 2"],
        "weaknesses": ["point 1", "point 2"],
        "actionable_advice": ["step 1", "step 2"],
        "recommended_roles": ["role 1", "role 2"]
    }}
    """
    
    try:
        response = model.generate_content(prompt)
        # Clean up the response to ensure it's pure JSON
        cleaned_response = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(cleaned_response)
    except Exception as e:
        return {"error": str(e)}