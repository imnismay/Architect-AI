document.addEventListener('DOMContentLoaded', () => {
    // Load the default template selected in the dropdown
    const defaultTemplate = document.getElementById('templateSelector').value;
    loadTemplate(defaultTemplate);

    // Listen for template changes from the dropdown
    document.getElementById('templateSelector').addEventListener('change', (e) => {
        loadTemplate(e.target.value);
    });

    // Ensure preview updates immediately to hide empty slots on initial load
    setTimeout(updatePreview, 150); 
});

async function loadTemplate(templateName) {
    try {
        const response = await fetch(`/get_template/${templateName}`);
        if (!response.ok) throw new Error('Template not found');
        const html = await response.text();
        document.getElementById('resumePreviewContainer').innerHTML = html;
        updatePreview(); // Re-populate data into the new template instantly
    } catch (error) {
        console.error("Error loading template:", error);
    }
}

function updatePreview() {
    // Map Input IDs to Preview Template IDs (Removed links from here)
    const mappings = {
        'fullName': 'prev-name', 'address': 'prev-address', 'jobTitle': 'prev-title',
        'email': 'prev-email', 'phone': 'prev-phone', 'summary': 'prev-summary',
        
        'degree': 'prev-degree', 'college': 'prev-college', 'degreeScore': 'prev-deg-score', 'gradYear': 'prev-deg-year',
        'pucCollege': 'prev-puc-college', 'pucScore': 'prev-puc-score', 'pucYear': 'prev-puc-year',
        'sslcSchool': 'prev-sslc-school', 'sslcScore': 'prev-sslc-score', 'sslcYear': 'prev-sslc-year',
        
        'phdCollege': 'prev-phd-college', 'phdScore': 'prev-phd-score', 'phdYear': 'prev-phd-year',
        'masterCollege': 'prev-master-college', 'masterScore': 'prev-master-score', 'masterYear': 'prev-master-year',
        
        'proj1Title': 'prev-proj1-title', 'proj1Tech': 'prev-proj1-tech', 'proj1Desc': 'prev-proj1-desc',
        'proj2Title': 'prev-proj2-title', 'proj2Tech': 'prev-proj2-tech', 'proj2Desc': 'prev-proj2-desc',
        'proj3Title': 'prev-proj3-title', 'proj3Tech': 'prev-proj3-tech', 'proj3Desc': 'prev-proj3-desc',
        'proj4Title': 'prev-proj4-title', 'proj4Tech': 'prev-proj4-tech', 'proj4Desc': 'prev-proj4-desc',
        
        'skills': 'prev-skills', 'achievements': 'prev-achievements', 'strengths': 'prev-strengths',
        'languages': 'prev-langs', 'hobbies': 'prev-hobbies'
    };

    // 1. Text Mapping (Transfers text from input to preview, preserves line breaks)
    for (const [inputId, previewId] of Object.entries(mappings)) {
        const inputElement = document.getElementById(inputId);
        const prevElement = document.getElementById(previewId);
        if (inputElement && prevElement) {
            prevElement.innerHTML = inputElement.value.replace(/\n/g, '<br>');
        }
    }

    // 2. Advanced Dynamic Hiding Logic
    // Hides the container in the preview if the corresponding input is empty
    const hideIfEmpty = (inputId, containerId) => {
        const input = document.getElementById(inputId);
        const container = document.getElementById(containerId);
        if (input && container) {
            const hasContent = input.value.trim() !== '';
            container.style.display = hasContent ? '' : 'none';
            return hasContent;
        }
        return false;
    };

    // Hide Education Rows if blank
    hideIfEmpty('phdCollege', 'container-phd');
    hideIfEmpty('masterCollege', 'container-master');
    
    // Hide Project Blocks individually if title is blank
    const p1 = hideIfEmpty('proj1Title', 'container-proj1');
    const p2 = hideIfEmpty('proj2Title', 'container-proj2');
    const p3 = hideIfEmpty('proj3Title', 'container-proj3');
    const p4 = hideIfEmpty('proj4Title', 'container-proj4');
    
    // Hide the entire "Projects" heading if ALL project slots are empty
    const projHeader = document.getElementById('header-projects');
    if (projHeader) {
        projHeader.style.display = (p1 || p2 || p3 || p4) ? '' : 'none';
    }

    // 3. Dynamic Clickable Links Logic
    const linkedinInput = document.getElementById('linkedin')?.value.trim();
    const githubInput = document.getElementById('github')?.value.trim();
    const portfolioInput = document.getElementById('portfolio')?.value.trim();
    
    const linkContainer = document.getElementById('link-container');
    
    if (linkContainer) {
        let linksHTML = [];
        
        // Build the HTML anchor tags based on the usernames
        if (linkedinInput) {
            linksHTML.push(`<a href="https://linkedin.com/in/${linkedinInput}" target="_blank" style="text-decoration: none; color: inherit; transition: color 0.2s;" onmouseover="this.style.color='#0077b5'" onmouseout="this.style.color='inherit'">LinkedIn</a>`);
        }
        if (githubInput) {
            linksHTML.push(`<a href="https://github.com/${githubInput}" target="_blank" style="text-decoration: none; color: inherit; transition: color 0.2s;" onmouseover="this.style.color='#333'" onmouseout="this.style.color='inherit'">GitHub</a>`);
        }
        if (portfolioInput) {
            linksHTML.push(`<a href="https://${portfolioInput}" target="_blank" style="text-decoration: none; color: inherit; transition: color 0.2s;" onmouseover="this.style.color='#4f46e5'" onmouseout="this.style.color='inherit'">Portfolio</a>`);
        }
        
        // If there are links, join them with a bullet point and show the container
        if (linksHTML.length > 0) {
            linkContainer.innerHTML = linksHTML.join(' &nbsp;&bull;&nbsp; ');
            linkContainer.style.display = '';
        } else {
            // If all inputs are blank, hide the container completely
            linkContainer.style.display = 'none';
        }
    }
}
async function triggerAnalysis() {
    const modal = document.getElementById('aiModal');
    const content = document.getElementById('aiContent');
    modal.classList.remove('hidden');
    
    // Show Loading State
    content.innerHTML = `<div class="flex flex-col items-center justify-center space-y-4 text-indigo-600 py-10">
                            <i class="fa-solid fa-circle-notch fa-spin text-4xl"></i>
                            <span class="font-bold text-lg tracking-wide">Gemini is analyzing the data...</span>
                         </div>`;

    // Initialize FormData to support both JSON and PDF uploads
    const formData = new FormData();
    const fileInput = document.getElementById('resumeUpload');
    
    if (fileInput.files.length > 0) {
        // Option A: User uploaded an external PDF
        formData.append('resume_file', fileInput.files[0]);
    } else {
        // Option B: Fallback to the live form data
        const resumeJSON = {
            name: document.getElementById('fullName').value,
            title: document.getElementById('jobTitle').value,
            objective: document.getElementById('summary').value,
            education: `${document.getElementById('degree').value} - ${document.getElementById('college').value}`,
            skills: document.getElementById('skills').value,
            projects: `${document.getElementById('proj1Title').value}, ${document.getElementById('proj2Title').value}`,
            achievements: document.getElementById('achievements').value,
            strengths: document.getElementById('strengths').value
        };
        formData.append('resume_data', JSON.stringify(resumeJSON));
    }

    // Append Target Goals
    formData.append('target_role', document.getElementById('targetRole').value);
    formData.append('target_company', document.getElementById('targetCompany').value);
    formData.append('experience_level', document.getElementById('expLevel').value);

    try {
        const res = await fetch('/api/analyze', {
            method: 'POST',
            body: formData 
        });
        
        const data = await res.json();
        
        if (data.error) {
            content.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-lg font-medium"><i class="fa-solid fa-triangle-exclamation mr-2"></i>Error: ${data.error}</div>`;
            return;
        }

        // Determine score color
        let scoreColor = 'text-green-500';
        if (data.ats_score < 75) scoreColor = 'text-orange-500';
        if (data.ats_score < 50) scoreColor = 'text-red-500';

        // Render AI Results Dashboard
        content.innerHTML = `
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6 flex items-center space-x-6">
                <div class="flex flex-col items-center justify-center bg-white rounded-full h-24 w-24 shadow-sm border border-gray-100 flex-shrink-0">
                    <span class="text-3xl font-black ${scoreColor}">${data.ats_score}</span>
                    <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">ATS Score</span>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-1">Score Breakdown</h3>
                    <p class="text-sm text-gray-600 leading-relaxed">${data.score_explanation}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-green-50 rounded-xl p-5 border border-green-100">
                    <h4 class="font-extrabold text-green-800 mb-3 flex items-center"><i class="fa-solid fa-check-circle mr-2"></i>Strengths Found</h4>
                    <ul class="space-y-2 text-sm text-green-900/80 font-medium">
                        ${data.strengths.map(s => `<li><i class="fa-solid fa-caret-right text-green-500 mr-2"></i>${s}</li>`).join('')}
                    </ul>
                </div>
                <div class="bg-red-50 rounded-xl p-5 border border-red-100">
                    <h4 class="font-extrabold text-red-800 mb-3 flex items-center"><i class="fa-solid fa-circle-exclamation mr-2"></i>Critical Weaknesses</h4>
                    <ul class="space-y-2 text-sm text-red-900/80 font-medium">
                        ${data.weaknesses.map(w => `<li><i class="fa-solid fa-caret-right text-red-400 mr-2"></i>${w}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <h4 class="font-extrabold text-indigo-900 mb-3 flex items-center"><i class="fa-solid fa-rocket mr-2 text-indigo-500"></i>Action Plan to Improve</h4>
                <ul class="space-y-2 text-sm text-indigo-900/80 font-medium">
                    ${data.actionable_advice.map(a => `<li><i class="fa-solid fa-arrow-right text-indigo-400 mr-2"></i>${a}</li>`).join('')}
                </ul>
            </div>
        `;
    } catch (err) {
        content.innerHTML = `<div class="p-4 bg-red-50 text-red-700 rounded-lg font-medium"><i class="fa-solid fa-triangle-exclamation mr-2"></i>Failed to reach backend. Make sure app.py is running.</div>`;
    }
}

function printResume() {
    // 1. Save the original tab title
    const originalTitle = document.title;
    
    // 2. Grab the user's name from the input field
    const nameInput = document.getElementById('fullName').value.trim();
    
    // 3. Temporarily change the tab title so the PDF saves with their name
    if (nameInput) {
        document.title = nameInput;
    } else {
        document.title = "Resume";
    }
    
    // 4. Open the print dialog
    window.print();
    
    // 5. Instantly revert the tab back to original title
    document.title = originalTitle;
}