document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const resumeForm = document.getElementById('resumeForm');
    const messageDiv = document.getElementById('message');
    const submissionList = document.getElementById('submissionList');
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Modal elements
    const previewModal = document.getElementById('previewModal');
    const analysisModal = document.getElementById('analysisModal');
    const closeButtons = document.querySelectorAll('.close');
    const previewBtn = document.getElementById('previewBtn');
    const editResumeBtn = document.getElementById('editResumeBtn');
    const confirmSubmitBtn = document.getElementById('confirmSubmitBtn');
    const closeAnalysisBtn = document.getElementById('closeAnalysisBtn');
    const downloadAnalysisBtn = document.getElementById('downloadAnalysisBtn');
    const resumeFileInput = document.getElementById('resume');
    const uploadPreview = document.querySelector('.upload-preview p');
    const trackBtn = document.getElementById('trackBtn');
    const formatButtons = document.querySelectorAll('.format-btn');
    
    // Ranking elements
    const rankingTableBody = document.getElementById('rankingTableBody');
    const totalResumesSpan = document.getElementById('totalResumes');
    const averageScoreSpan = document.getElementById('averageScore');
    const topScoreSpan = document.getElementById('topScore');
    
    // Feedback elements
    const stars = document.querySelectorAll('.star');
    const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    const feedbackComments = document.getElementById('feedbackComments');
    
    // Current analysis ID for feedback
    let currentAnalysisId = null;
    let currentRating = 0;
    
    // Initialize
    loadSubmissions();
    loadRankings();
    setupEventListeners();
    
    // Set up all event listeners
    function setupEventListeners() {
        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab));
        });
        
        // Close modals
        closeButtons.forEach(button => {
            button.addEventListener('click', closeModals);
        });
        
        // Preview button
        previewBtn.addEventListener('click', showPreview);
        
        // Edit resume button
        editResumeBtn.addEventListener('click', () => {
            previewModal.style.display = 'none';
        });
        
        // Confirm & submit button
        confirmSubmitBtn.addEventListener('click', submitResume);
        
        // Close analysis modal
        closeAnalysisBtn.addEventListener('click', () => {
            analysisModal.style.display = 'none';
        });
        
        // Download analysis report
        downloadAnalysisBtn.addEventListener('click', downloadAnalysisReport);
        
        // File upload preview
        resumeFileInput.addEventListener('change', updateFilePreview);
        
        // Track button
        trackBtn.addEventListener('click', trackSubmission);
        
        // Format buttons
        formatButtons.forEach(button => {
            button.addEventListener('click', (e) => generateResumeFormat(e.target.dataset.format));
        });
        
        // Star rating system
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                setRating(rating);
            });
        });
        
        // Submit feedback
        submitFeedbackBtn.addEventListener('click', submitFeedback);
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === previewModal) previewModal.style.display = 'none';
            if (e.target === analysisModal) analysisModal.style.display = 'none';
        });
    }
    
    // Set star rating
    function setRating(rating) {
        currentRating = rating;
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.innerHTML = '<i class="fas fa-star"></i>';
                star.classList.add('active');
            } else {
                star.innerHTML = '<i class="far fa-star"></i>';
                star.classList.remove('active');
            }
        });
    }
    
    // Submit feedback on analysis
    function submitFeedback() {
        if (!currentAnalysisId) {
            showMessage('No resume analysis to rate', 'error');
            return;
        }
        
        if (currentRating === 0) {
            showMessage('Please select a rating', 'error');
            return;
        }
        
        const comments = feedbackComments.value;
        
        // Send feedback to the server
        fetch('http://localhost:3000/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resumeId: currentAnalysisId,
                rating: currentRating,
                comments: comments
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showMessage('Thank you for your feedback!', 'success');
                // Reset the form
                setRating(0);
                feedbackComments.value = '';
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error submitting feedback. Please try again.', 'error');
        });
    }
    
    // Switch between tabs
    function switchTab(selectedTab) {
        // Remove active class from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab
        selectedTab.classList.add('active');
        
        // Show selected content
        const tabId = selectedTab.dataset.tab;
        document.getElementById(tabId).classList.add('active');
    }
    
    // Show file preview when a file is selected
    function updateFilePreview() {
        if (resumeFileInput.files.length > 0) {
            const fileName = resumeFileInput.files[0].name;
            uploadPreview.textContent = `Selected file: ${fileName}`;
        } else {
            uploadPreview.textContent = 'No file selected';
        }
    }
    
    // Show resume preview modal
    function showPreview() {
        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const education = document.getElementById('education').value;
        const skills = document.getElementById('skills').value;
        const experience = document.getElementById('experience').value;
        const linkedin = document.getElementById('linkedin').value;
        
        // Validate form
        if (!name || !email || !phone || !education || !skills || !experience) {
            showMessage('Please fill all required fields', 'error');
            return;
        }
        
        // Create preview HTML
        const previewContent = `
            <div class="preview-section">
                <h3>Personal Information</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                ${linkedin ? `<p><strong>LinkedIn:</strong> ${linkedin}</p>` : ''}
            </div>
            <div class="preview-section">
                <h3>Education</h3>
                <p>${education}</p>
            </div>
            <div class="preview-section">
                <h3>Skills</h3>
                <p>${skills}</p>
            </div>
            <div class="preview-section">
                <h3>Work Experience</h3>
                <p>${experience}</p>
            </div>
            <div class="preview-section">
                <h3>Resume File</h3>
                <p>${resumeFileInput.files.length > 0 ? resumeFileInput.files[0].name : 'No file selected'}</p>
            </div>
        `;
        
        // Update preview and show modal
        document.getElementById('resumePreview').innerHTML = previewContent;
        previewModal.style.display = 'block';
    }
    
    // Submit resume after confirmation
    function submitResume() {
        previewModal.style.display = 'none';
        
        // Get form data
        const formData = new FormData(resumeForm);
        
        // Display loading message
        showMessage('Submitting your resume...', '');
        
        // Send data to the server
        fetch('http://localhost:3000/api/submit', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');
                resumeForm.reset();
                uploadPreview.textContent = 'No file selected';
                loadSubmissions();
                loadRankings();
                
                // Show AI analysis after successful submission
                setTimeout(() => showAIAnalysis(data.id), 1000);
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error submitting form. Please try again.', 'error');
        });
    }
    
    // Show AI resume analysis
    function showAIAnalysis(resumeId) {
        // Set current analysis ID for feedback
        currentAnalysisId = resumeId;
        
        // Reset feedback form
        setRating(0);
        feedbackComments.value = '';
        
        // Show loading in modal
        document.getElementById('resumeScore').textContent = "Loading...";
        document.getElementById('resumeRank').textContent = "Loading...";
        document.getElementById('totalRankedResumes').textContent = "Loading...";
        document.getElementById('resumePercentile').textContent = "Loading...";
        
        displayAnalysisItems('strengthsList', ["Loading..."]);
        displayAnalysisItems('improvementsList', ["Loading..."]);
        displayAnalysisItems('suggestionsList', ["Loading..."]);
        
        // Show the modal before fetch to improve UX
        analysisModal.style.display = 'block';
        
        // Fetch analysis from server
        fetch(`http://localhost:3000/api/analyze/${resumeId}`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const analysis = data.data;
                
                // Update UI with analysis data
                document.getElementById('resumeScore').textContent = analysis.score;
                document.getElementById('resumeRank').textContent = analysis.position || 'N/A';
                document.getElementById('totalRankedResumes').textContent = analysis.totalResumes;
                document.getElementById('resumePercentile').textContent = analysis.percentile || 'N/A';
                
                // Display the analysis sections
                displayAnalysisItems('strengthsList', analysis.strengths);
                displayAnalysisItems('improvementsList', analysis.improvements);
                displayAnalysisItems('suggestionsList', analysis.suggestions);
            } else {
                // Display error in the modal
                document.getElementById('resumeScore').textContent = "Error";
                document.getElementById('resumeRank').textContent = "Error";
                document.getElementById('totalRankedResumes').textContent = "Error";
                document.getElementById('resumePercentile').textContent = "Error";
                
                displayAnalysisItems('strengthsList', [data.message || "Error retrieving analysis"]);
                displayAnalysisItems('improvementsList', ["Please try again later"]);
                displayAnalysisItems('suggestionsList', ["Contact support if the issue persists"]);
                
                showMessage(data.message || 'Error retrieving analysis. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Display error in the modal
            document.getElementById('resumeScore').textContent = "Error";
            document.getElementById('resumeRank').textContent = "Error";
            document.getElementById('totalRankedResumes').textContent = "Error";
            document.getElementById('resumePercentile').textContent = "Error";
            
            displayAnalysisItems('strengthsList', ["Server error occurred"]);
            displayAnalysisItems('improvementsList', ["Please try again later"]);
            displayAnalysisItems('suggestionsList', ["Contact support if the issue persists"]);
            
            showMessage('Server error. Please try again later.', 'error');
        });
    }
    
    // Display analysis items in a list
    function displayAnalysisItems(listId, items) {
        const list = document.getElementById(listId);
        list.innerHTML = '';
        
        if (items && items.length > 0) {
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                list.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No items to display';
            list.appendChild(li);
        }
    }
    
    // Download analysis report (simulated)
    function downloadAnalysisReport() {
        showMessage('Analysis report downloaded', 'success');
    }
    
    // Track submission status
    function trackSubmission() {
        const trackingId = document.getElementById('trackingId').value.trim();
        
        if (!trackingId) {
            showMessage('Please enter a submission ID', 'error');
            return;
        }
        
        // Fetch status from server
        const statusResult = document.getElementById('statusResult');
        statusResult.innerHTML = '<p>Loading status...</p>';
        
        fetch(`http://localhost:3000/api/status/${trackingId}`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const statusInfo = data.data;
                const statuses = ['Received', 'Processing', 'Reviewed', 'Completed'];
                const currentStatus = statusInfo.status;
                const currentIndex = statuses.indexOf(currentStatus);
                
                // Create status card
                const statusCard = document.createElement('div');
                statusCard.className = 'status-card';
                
                statusCard.innerHTML = `
                    <h3>Submission ID: ${trackingId}</h3>
                    <p><strong>Current Status:</strong> ${currentStatus}</p>
                    <p><strong>Last Updated:</strong> ${new Date(statusInfo.lastUpdated).toLocaleString()}</p>
                    
                    <div class="status-steps">
                        ${statuses.map((status, index) => `
                            <div class="status-step ${index <= currentIndex ? 'step-completed' : ''} ${index === currentIndex ? 'step-current' : ''}">
                                <div class="step-indicator">${index + 1}</div>
                                <div class="step-label">${status}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
                
                statusResult.innerHTML = '';
                statusResult.appendChild(statusCard);
            } else {
                statusResult.innerHTML = `<p class="error">${data.message || 'Status not found. Please check the ID and try again.'}</p>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            statusResult.innerHTML = '<p class="error">Server error. Please try again later.</p>';
        });
    }
    
    // Load resume rankings
    function loadRankings() {
        // Show loading state
        rankingTableBody.innerHTML = '<tr><td colspan="5">Loading rankings...</td></tr>';
        totalResumesSpan.textContent = '-';
        averageScoreSpan.textContent = '-';
        topScoreSpan.textContent = '-';
        
        fetch('http://localhost:3000/api/rankings')
        .then(response => {
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const rankings = data.data;
                
                // Update stats
                totalResumesSpan.textContent = rankings.length;
                
                if (rankings.length > 0) {
                    // Calculate average score
                    const totalScore = rankings.reduce((sum, rank) => sum + rank.score, 0);
                    const avgScore = Math.round(totalScore / rankings.length);
                    averageScoreSpan.textContent = avgScore;
                    
                    // Find top score
                    const topScore = rankings[0].score;
                    topScoreSpan.textContent = topScore;
                    
                    // Populate ranking table
                    rankingTableBody.innerHTML = '';
                    
                    rankings.forEach((rank, index) => {
                        const tr = document.createElement('tr');
                        const rankClass = index < 3 ? `rank-${index + 1}` : '';
                        
                        tr.innerHTML = `
                            <td class="${rankClass}">${index + 1}</td>
                            <td>${rank.name}</td>
                            <td class="ranking-score">${rank.score}</td>
                            <td>${new Date(rank.date).toLocaleDateString()}</td>
                            <td>
                                <button class="ranking-action view-analysis" data-id="${rank.id}">
                                    <i class="fas fa-chart-bar"></i> Analysis
                                </button>
                            </td>
                        `;
                        
                        rankingTableBody.appendChild(tr);
                        
                        // Add event listener to the view analysis button
                        const viewAnalysisBtn = tr.querySelector('.view-analysis');
                        viewAnalysisBtn.addEventListener('click', () => {
                            showAIAnalysis(rank.id);
                        });
                    });
                } else {
                    rankingTableBody.innerHTML = '<tr><td colspan="5">No rankings available yet</td></tr>';
                    averageScoreSpan.textContent = '0';
                    topScoreSpan.textContent = '0';
                }
            } else {
                throw new Error(data.message || 'Error loading rankings');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            rankingTableBody.innerHTML = '<tr><td colspan="5">Error loading rankings. Please try again later.</td></tr>';
            totalResumesSpan.textContent = 'Error';
            averageScoreSpan.textContent = 'Error';
            topScoreSpan.textContent = 'Error';
        });
    }
    
    // Generate resume in different formats
    function generateResumeFormat(format) {
        // Verify if we have a submission ID
        const trackingId = document.getElementById('trackingId').value.trim();
        
        if (!trackingId) {
            showMessage('Please enter a submission ID first', 'error');
            return;
        }
        
        // Call API to generate format
        fetch(`http://localhost:3000/api/format/${trackingId}/${format}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('Error generating resume format. Please try again.', 'error');
        });
    }
    
    // Function to display messages
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        
        // Hide the message after 5 seconds if it's a success message
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    // Close all modals
    function closeModals() {
        previewModal.style.display = 'none';
        analysisModal.style.display = 'none';
    }
    
    // Function to load submissions from the server
    function loadSubmissions() {
        fetch('http://localhost:3000/api/submissions')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Clear the existing list
            submissionList.innerHTML = '';
            
            // Add each submission to the list
            data.forEach(submission => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="submission-header">
                        <div>
                            <strong>${submission.name}</strong>
                            <span class="submission-email">${submission.email}</span>
                        </div>
                        <span class="submission-id">ID: ${submission.id}</span>
                    </div>
                    <div class="submission-details">
                        <p><i class="fas fa-phone"></i> ${submission.phone}</p>
                        <p><i class="fas fa-calendar-alt"></i> ${new Date(submission.date).toLocaleString()}</p>
                    </div>
                    <div class="submission-actions">
                        <button class="action-btn view-btn" data-id="${submission.id}">View Details</button>
                        <button class="action-btn analyze-btn" data-id="${submission.id}">AI Analysis</button>
                    </div>
                `;
                submissionList.appendChild(listItem);
                
                // Add event listeners to the buttons
                const viewBtn = listItem.querySelector('.view-btn');
                const analyzeBtn = listItem.querySelector('.analyze-btn');
                
                viewBtn.addEventListener('click', () => {
                    // Set the tracking ID input for easier reference
                    document.getElementById('trackingId').value = submission.id;
                    trackSubmission();
                    
                    // Switch to tracking tab
                    tabs.forEach(tab => {
                        if (tab.dataset.tab === 'tracking-tab') {
                            switchTab(tab);
                        }
                    });
                });
                
                analyzeBtn.addEventListener('click', () => {
                    showAIAnalysis(submission.id);
                });
            });
            
            // Display a message if no submissions
            if (data.length === 0) {
                const listItem = document.createElement('li');
                listItem.textContent = 'No submissions yet.';
                submissionList.appendChild(listItem);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            submissionList.innerHTML = '<li>Error loading submissions.</li>';
        });
    }
}); 