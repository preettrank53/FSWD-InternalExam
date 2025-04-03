const express = require('express');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const shortid = require('shortid');

// Initialize express app
const app = express();
const PORT = 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure database
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set default db values
db.defaults({ submissions: [], statuses: {}, rankings: [] })
  .write();

// Manually check if statuses exists as an object (not an array)
const dbData = db.getState();
if (Array.isArray(dbData.statuses)) {
    // If statuses is an array, convert it to an object
    db.set('statuses', {}).write();
    console.log('Converted statuses from array to object');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // limit file size to 5MB
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to update submission status
const updateSubmissionStatus = (id, newStatus) => {
    try {
        const statuses = db.get('statuses').value();
        const status = statuses[id];
        
        if (status) {
            db.get('statuses')
              .set(id, {
                  ...status,
                  status: newStatus,
                  lastUpdated: new Date().toISOString()
              })
              .write();
            
            console.log(`Status for ${id} updated to: ${newStatus}`);
        } else {
            console.error(`Cannot update status: submission ID ${id} not found`);
        }
    } catch (error) {
        console.error(`Error updating status for ${id}:`, error);
    }
};

// Handle resume submission
app.post('/api/submit', upload.single('resume'), (req, res) => {
    try {
        // Check if all required fields are provided
        if (!req.body.name || !req.body.email || !req.body.phone) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Generate unique ID for submission
        const submissionId = shortid.generate();
        
        // Create submission object
        const submission = {
            id: submissionId,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            education: req.body.education,
            skills: req.body.skills,
            experience: req.body.experience,
            linkedin: req.body.linkedin,
            resumeFile: req.file ? req.file.filename : null,
            date: new Date().toISOString()
        };
        
        // Save submission to database
        db.get('submissions').push(submission).write();
        
        // Create initial status for the submission
        db.get('statuses')
            .set(submissionId, {
                status: 'Received',
                lastUpdated: new Date().toISOString()
            })
            .write();
        
        // Create initial ranking (mock AI analysis)
        const score = Math.floor(Math.random() * 41) + 60; // Random score between 60-100
        
        const ranking = {
            id: submissionId,
            name: submission.name,
            score: score,
            date: submission.date
        };
        
        db.get('rankings').push(ranking).write();
        
        // Return success response
        res.status(201).json({
            success: true,
            message: 'Resume submitted successfully!',
            id: submissionId
        });
        
        // Simulate status changes for demo purposes
        setTimeout(() => {
            updateSubmissionStatus(submissionId, 'Processing');
        }, 30000); // 30 seconds
        
        setTimeout(() => {
            updateSubmissionStatus(submissionId, 'Reviewed');
        }, 60000); // 60 seconds
        
        setTimeout(() => {
            updateSubmissionStatus(submissionId, 'Completed');
        }, 90000); // 90 seconds
    } catch (error) {
        console.error('Error submitting resume:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting resume'
        });
    }
});

// Function to calculate resume score (simulated)
function calculateResumeScore(submission) {
    // This is a simplified score calculation for demonstration
    // In a real app, this would use ML/NLP to analyze resume content
    let score = 0;
    
    // Basic checks for completeness
    if (submission.name) score += 5;
    if (submission.email) score += 5;
    if (submission.phone) score += 5;
    
    // Check education - assign points based on length and complexity
    if (submission.education) {
        const educationLength = submission.education.length;
        if (educationLength > 200) score += 20;
        else if (educationLength > 100) score += 15;
        else if (educationLength > 50) score += 10;
        else score += 5;
    }
    
    // Check skills - assign points based on number of skills mentioned
    if (submission.skills) {
        const skillsCount = submission.skills.split(',').length;
        if (skillsCount > 10) score += 20;
        else if (skillsCount > 5) score += 15;
        else score += 10;
    }
    
    // Check experience - assign points based on length and complexity
    if (submission.experience) {
        const experienceLength = submission.experience.length;
        if (experienceLength > 300) score += 25;
        else if (experienceLength > 150) score += 20;
        else if (experienceLength > 50) score += 10;
        else score += 5;
    }
    
    // Bonus for LinkedIn
    if (submission.linkedin) score += 10;
    
    // Bonus for resume file
    if (submission.resumePath) score += 10;
    
    // Normalize to 100
    score = Math.min(score, 100);
    
    return score;
}

// Get all submissions
app.get('/api/submissions', (req, res) => {
    try {
        // Get submissions from database
        const submissions = db.get('submissions').value();
        
        // Return only necessary information for security
        const safeSubmissions = submissions.map(sub => ({
            id: sub.id,
            name: sub.name,
            email: sub.email,
            phone: sub.phone,
            date: sub.date
        }));
        
        res.json(safeSubmissions);
    } catch (error) {
        console.error('Error retrieving submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving submissions'
        });
    }
});

// Get submission by ID
app.get('/api/submissions/:id', (req, res) => {
    const id = req.params.id;
    const submission = db.get('submissions')
                        .find({ id: id })
                        .value();
    
    if (!submission) {
        return res.status(404).json({ 
            success: false, 
            message: 'Submission not found' 
        });
    }
    
    res.status(200).json({
        success: true,
        data: submission
    });
});

// Get submission status
app.get('/api/status/:id', (req, res) => {
    const id = req.params.id;
    
    try {
        // First check if the submission exists
        const submission = db.get('submissions')
                            .find({ id: id })
                            .value();
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found with this ID'
            });
        }
        
        // Then get the status info
        const statusInfo = db.get('statuses').get(id).value();
        
        // If no status info exists, create a default one
        if (!statusInfo) {
            const defaultStatus = {
                status: 'Received',
                lastUpdated: new Date(),
                history: [
                    { status: 'Received', timestamp: new Date() }
                ]
            };
            
            // Save the default status
            db.get('statuses')
              .set(id, defaultStatus)
              .write();
            
            return res.status(200).json({
                success: true,
                data: defaultStatus
            });
        }
        
        return res.status(200).json({
            success: true,
            data: statusInfo
        });
    } catch (error) {
        console.error('Error retrieving status:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while retrieving status'
        });
    }
});

// Get top ranked resumes
app.get('/api/rankings', (req, res) => {
    try {
        // Get all rankings from database
        let rankings = db.get('rankings').value();
        
        // Check if rankings exist, if not, create dummy data
        if (!rankings || rankings.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        
        // Sort the rankings by score (highest first)
        rankings = rankings.sort((a, b) => b.score - a.score);
        
        res.status(200).json({
            success: true,
            data: rankings
        });
    } catch (error) {
        console.error('Error retrieving rankings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving rankings'
        });
    }
});

// Analyze resume
app.get('/api/analyze/:id', (req, res) => {
    const id = req.params.id;
    
    try {
        // Check if submission exists
        const submission = db.get('submissions')
                           .find({ id: id })
                           .value();
        
        if (!submission) {
            return res.status(404).json({ 
                success: false, 
                message: 'Submission not found' 
            });
        }
        
        // Get ranking info or create a new one if it doesn't exist
        let rankInfo = db.get('rankings')
                        .find({ id: id })
                        .value();
        
        // If ranking doesn't exist, calculate score and create it
        if (!rankInfo) {
            const score = calculateResumeScore(submission);
            rankInfo = {
                id: id,
                name: submission.name,
                score: score,
                date: new Date()
            };
            
            // Add to rankings db
            db.get('rankings')
              .push(rankInfo)
              .write();
        }
        
        // Get all rankings to calculate percentile
        const allRankings = db.get('rankings')
                            .sortBy('score')
                            .reverse()
                            .value();
        
        // Find position of current resume
        const position = allRankings.findIndex(r => r.id === id);
        const percentile = position !== -1 && allRankings.length > 0 ? 
            Math.round((1 - position / allRankings.length) * 100) : 50;
        
        // Generate analysis data
        const analysis = generateAnalysis(submission, rankInfo.score);
        
        res.status(200).json({
            success: true,
            data: {
                id,
                score: rankInfo.score,
                percentile,
                position: position !== -1 ? position + 1 : 1,
                totalResumes: allRankings.length,
                ...analysis,
                analyzedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Error analyzing resume:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while analyzing resume'
        });
    }
});

// Generate detailed analysis and improvement suggestions
function generateAnalysis(submission, score) {
    // This would be more sophisticated in a real application
    const strengths = [];
    const improvements = [];
    const suggestions = [];
    
    // Education analysis
    if (submission.education) {
        if (submission.education.length > 100) {
            strengths.push('Detailed education background');
        } else {
            improvements.push('Consider providing more details about your education');
            suggestions.push('Include your degree, major, university name, and graduation date');
        }
    }
    
    // Skills analysis
    if (submission.skills) {
        const skillsArr = submission.skills.split(',').map(s => s.trim());
        if (skillsArr.length > 5) {
            strengths.push('Good range of skills listed');
        } else {
            improvements.push('Consider listing more skills');
            suggestions.push('Add both technical and soft skills relevant to your field');
        }
        
        // Look for technical skills (simplified check)
        const techSkills = skillsArr.filter(s => 
            ['programming', 'javascript', 'python', 'java', 'c++', 'sql', 'html', 'css', 'react', 'node', 'database', 'aws', 'cloud']
            .some(tech => s.toLowerCase().includes(tech))
        );
        
        if (techSkills.length > 2) {
            strengths.push('Good technical skill representation');
        } else {
            suggestions.push('Include more technical skills if relevant to your field');
        }
    }
    
    // Experience analysis
    if (submission.experience) {
        if (submission.experience.length > 200) {
            strengths.push('Detailed work experience section');
        } else {
            improvements.push('Your work experience section could be more detailed');
            suggestions.push('Include specific achievements and responsibilities in your work experience');
        }
        
        // Check for quantifiable achievements (simple check for numbers)
        const hasNumbers = /\d+/.test(submission.experience);
        if (hasNumbers) {
            strengths.push('Includes quantifiable achievements');
        } else {
            improvements.push('Add quantifiable achievements to your experience');
            suggestions.push('Use numbers to showcase your impact (e.g., "Increased sales by 20%")');
        }
    }
    
    // LinkedIn check
    if (submission.linkedin) {
        strengths.push('Includes LinkedIn profile');
    } else {
        suggestions.push('Add your LinkedIn profile to enhance your online presence');
    }
    
    // Overall score-based suggestions
    if (score < 70) {
        improvements.push('Overall resume completeness needs improvement');
        suggestions.push('Consider using a professional resume template');
    } else if (score > 90) {
        strengths.push('Excellent overall resume quality');
    }
    
    return {
        strengths: strengths.slice(0, 4), // Limit to 4 strengths
        improvements: improvements.slice(0, 3), // Limit to 3 improvements
        suggestions: suggestions.slice(0, 4) // Limit to 4 suggestions
    };
}

// Submit feedback on analysis
app.post('/api/feedback', (req, res) => {
    const { resumeId, rating, comments } = req.body;
    
    if (!resumeId || !rating) {
        return res.status(400).json({
            success: false,
            message: 'Resume ID and rating are required'
        });
    }
    
    // In a real app, you would store this in a feedback collection
    console.log('Feedback received:', { resumeId, rating, comments });
    
    res.status(200).json({
        success: true,
        message: 'Thank you for your feedback!'
    });
});

// Generate resume in different formats
app.get('/api/format/:id/:format', (req, res) => {
    try {
        const { id, format } = req.params;
        
        // Check if submission exists
        const submission = db.get('submissions')
            .find({ id: id })
            .value();
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        
        // Check if format is valid
        const validFormats = ['pdf', 'docx', 'txt', 'json', 'html'];
        if (!validFormats.includes(format)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid format requested'
            });
        }
        
        // For demo purposes, we're just simulating the generation
        // In a real app, this would generate the actual file
        
        res.status(200).json({
            success: true,
            message: `Resume successfully generated in ${format.toUpperCase()} format. Download started.`,
            format: format,
            resumeId: id
        });
    } catch (error) {
        console.error('Error generating resume format:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while generating resume format'
        });
    }
});

// Serve the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 