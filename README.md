# Enhanced Resume Submission System

A comprehensive resume submission system with modern UI and advanced features. Originally created for the IT107 exam, this project demonstrates a web application with form submission, resume analysis, status tracking, and more.

## Project Structure

- `frontend/`: Contains the client-side code
  - `index.html`: The main HTML file with the resume submission form and UI
  - `styles.css`: CSS styles for the application
  - `script.js`: JavaScript for form handling and interaction with the backend

- `backend/`: Contains the server-side code
  - `server.js`: Node.js server using Express to handle API requests
  - `package.json`: Dependencies and project information
  - `db.json`: JSON database file (created automatically)

## Features

### Core Features
- Form to submit personal information and upload a resume (PDF)
- Client-side validation for required fields
- Backend API to accept and store submissions
- Display of previously submitted resumes

### Advanced Features
- **Resume Preview & Confirmation**: Preview your submission before finalizing
- **Resume Processing & Analysis**: AI-based analysis of your resume with feedback
- **Status Tracking**: Track the processing status of your submission
- **AI-based Resume Score & Feedback**: Get a score and improvement suggestions
- **Resume Ranking System**: See how your resume ranks compared to others
- **Integration with LinkedIn**: Add your LinkedIn profile to your submission
- **Generate Resume in Different Formats**: Convert your resume to PDF, DOCX, JSON, or plain text
- **Feedback System**: Rate the quality of AI analysis and provide comments
- **Data Persistence**: Stored in a lightweight JSON database
- **Modern UI**: Attractive and responsive interface with tabs and cards
- **Mobile-Friendly Design**: Works on all device sizes

## How to Run

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```
   The server will start on http://localhost:3000

### Frontend Setup

1. Open the `frontend/index.html` file in your web browser.

2. If you're using VS Code, you can use the Live Server extension to serve the frontend.

## Database Structure

The project uses LowDB, a lightweight JSON database:

- **submissions**: Stores all resume submissions
- **statuses**: Tracks the status of each submission
- **rankings**: Stores resume scores and rankings

## API Endpoints

- `POST /api/submit`: Submit a new resume
- `GET /api/submissions`: Get all submissions
- `GET /api/submissions/:id`: Get a specific submission
- `GET /api/status/:id`: Get the status of a submission
- `GET /api/analyze/:id`: Get AI analysis for a resume
- `GET /api/rankings`: Get all resume rankings
- `POST /api/feedback`: Submit feedback on an analysis
- `GET /api/format/:id/:format`: Generate resume in a specific format

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express
- **Database**: LowDB (JSON file database)
- **File Upload**: Multer
- **Cross-Origin Resource Sharing**: CORS
- **UI Components**: Custom-built components with modern design
- **Icons**: Font Awesome

## Notes

For a real-world application, you would typically add:

- More robust database (e.g., MongoDB, MySQL)
- User authentication and authorization
- More comprehensive validation
- Real AI analysis using NLP or ML models
- Email notifications for status updates
- Advanced security measures
- Testing and CI/CD pipeline 