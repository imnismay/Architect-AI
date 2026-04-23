from flask import Flask, render_template, request, jsonify
from core_analyzer import analyze_resume_data
from dotenv import load_dotenv
from PyPDF2 import PdfReader

load_dotenv()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_template/<template_name>')
def get_template(template_name):
    # Dynamically loads the raw HTML of the selected template for the live preview
    try:
        return render_template(f'templates_raw/{template_name}.html')
    except Exception:
        return "Template not found", 404

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # We are now receiving form data to support file uploads
    target_role = request.form.get('target_role', 'General')
    target_company = request.form.get('target_company', 'General')
    experience_level = request.form.get('experience_level', 'Entry Level')
    
    resume_text_data = ""
    
    # Check if a file was uploaded
    if 'resume_file' in request.files and request.files['resume_file'].filename != '':
        file = request.files['resume_file']
        try:
            reader = PdfReader(file)
            for page in reader.pages:
                resume_text_data += page.extract_text() + "\n"
        except Exception as e:
            return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 400
    else:
        # If no file, use the JSON stringified data from the live form
        import json
        resume_text_data = json.loads(request.form.get('resume_data', '{}'))
    
    analysis = analyze_resume_data(
        resume_data=resume_text_data,
        target_role=target_role,
        target_company=target_company,
        experience_level=experience_level
    )
    
    return jsonify(analysis)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)