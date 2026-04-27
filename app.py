import os
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from PyPDF2 import PdfReader
from functools import wraps
from dotenv import load_dotenv

# Import your database and user model
from models import db, User
# Import your Gemini logic
from core_analyzer import analyze_resume_data

load_dotenv()

app = Flask(__name__)

# --- Configuration ---
# In production, change this secret key to a random string in your .env file
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'nismay-super-secret-key-2026')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///architect.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Database & Login Manager Init ---
db.init_app(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login' # Redirects guests here if they try to access secure pages

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- Security Decorators ---
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Kick out users who aren't logged in, or aren't admins
        if not current_user.is_authenticated or not current_user.is_admin:
            flash("Access Denied: You do not have administrator privileges.")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# --- Create Database Tables & Default Admin ---
with app.app_context():
    db.create_all()
    
    # Check if the default admin exists. If not, create it.
    if not User.query.filter_by(email='admin@admin.com').first():
        default_admin = User(
            username='Admin', 
            email='admin@admin.com', 
            is_admin=True
        )
        default_admin.set_password('admin@123')
        db.session.add(default_admin)
        db.session.commit()
        print(">>> DEFAULT ADMIN CREATED: email='admin@admin.com', password='admin@123'")

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            flash('Email address already exists. Please log in.')
            return redirect(url_for('signup'))

        # Create new user
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('Account created successfully! Please log in.')
        return redirect(url_for('login'))
        
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            
            # SMART ROUTING: Send admins to dashboard, regular users to the builder
            if user.is_admin:
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('index'))
        else:
            flash('Invalid email or password. Please try again.')
            
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


# ==========================================
# SECURE ADMIN ROUTE
# ==========================================

@app.route('/admin')
@admin_required
def admin_dashboard():
    # Fetch all registered users to display on the dashboard
    users = User.query.all()
    return render_template('admin.html', users=users)


# ==========================================
# CORE APP ROUTES (PROTECTED)
# ==========================================

@app.route('/')
@login_required # Forces users to log in before using the tool
def index():
    return render_template('index.html')

@app.route('/get_template/<template_name>')
@login_required
def get_template(template_name):
    """Dynamically loads the raw HTML of the selected template for the live preview"""
    try:
        return render_template(f'templates_raw/{template_name}.html')
    except Exception:
        return "Template not found", 404

@app.route('/api/analyze', methods=['POST'])
@login_required
def analyze():
    """Handles both live form data and external PDF uploads to send to Gemini"""
    target_role = request.form.get('target_role', 'General')
    target_company = request.form.get('target_company', 'General')
    experience_level = request.form.get('experience_level', 'Entry Level')
    
    resume_text_data = ""
    
    # Check if a file was uploaded inside the FormData
    if 'resume_file' in request.files and request.files['resume_file'].filename != '':
        file = request.files['resume_file']
        try:
            # Parse the PDF using PyPDF2
            reader = PdfReader(file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    resume_text_data += extracted + "\n"
        except Exception as e:
            return jsonify({"error": f"Failed to read PDF: {str(e)}"}), 400
    else:
        # Fallback: No file uploaded, so parse the live JSON data from the builder
        try:
            resume_text_data = json.loads(request.form.get('resume_data', '{}'))
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse live form data."}), 400
    
    # Send the extracted text or JSON to the Gemini brain
    analysis = analyze_resume_data(
        resume_data=resume_text_data,
        target_role=target_role,
        target_company=target_company,
        experience_level=experience_level
    )
    
    return jsonify(analysis)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
