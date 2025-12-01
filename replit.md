# VerifAI - AI-Powered KYC Document Verification Platform

## Overview
VerifAI is an intelligent Know Your Customer (KYC) document verification platform that leverages AI technologies to automate identity verification, detect fraud, and assist compliance teams with real-time insights.

## Tech Stack
- **Frontend**: React 18 with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Python Flask API with OpenAI integration
- **Server**: Node.js Express (serves frontend and proxies API requests to Python backend)
- **Database**: PostgreSQL for persistent storage
- **AI**: OpenAI GPT-4o for document analysis and Vision API for OCR

## Project Structure
```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── TopNavbar.tsx  # Top navigation bar
│   │   │   ├── GenAIAssistant.tsx  # AI chat component
│   │   │   └── ui/            # Shadcn UI components
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx  # Main dashboard with KPIs
│   │   │   ├── Upload.tsx     # Document upload interface
│   │   │   ├── VerificationDetail.tsx  # Verification review page
│   │   │   ├── Integrations.tsx  # External data sources
│   │   │   ├── Patterns.tsx   # Fraud detection patterns
│   │   │   └── Settings.tsx   # Configuration settings
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions
│   │   └── App.tsx            # Main app with routing
├── server/                    # Node.js Express server
│   ├── routes.ts              # API route proxying to Python
│   ├── storage.ts             # Storage interface
│   └── index.ts               # Server entry point
├── python_backend/            # Python Flask API
│   └── app.py                 # Flask application with AI logic
├── shared/                    # Shared TypeScript types
│   └── schema.ts              # Data models and Zod schemas
└── design_guidelines.md       # UI/UX design guidelines
```

## Key Features
1. **Dashboard**: Real-time KPIs, verification volume chart, recent verifications feed
2. **Document Upload**: Drag-and-drop interface supporting JPG, PNG, PDF
3. **Verification Detail**: Document viewer with OCR data, risk scoring, approve/reject workflow
4. **GenAI Assistant**: AI-powered chat for document analysis
5. **Integrations**: Mock connections to DMV, Passport Authority, SSA
6. **Patterns Library**: Fraud detection techniques
7. **Settings**: Risk thresholds, automation rules
8. **Audit Trail**: Complete activity logging with export

## Running the Application
The application requires two servers:
1. **Python Backend** (port 5001): `python python_backend/app.py`
2. **Node.js Server** (port 5000): `npm run dev`

## Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key for AI features
- `DATABASE_URL`: PostgreSQL connection string

## API Endpoints
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/verifications` - List all verifications
- `POST /api/verifications` - Create new verification
- `GET /api/verifications/:id` - Get verification details
- `PATCH /api/verifications/:id` - Update verification status
- `POST /api/verifications/:id/chat` - Send chat message
- `GET /api/batch-jobs` - List batch jobs
- `POST /api/batch-jobs` - Create batch job with multiple documents

## Login Credentials
- Username: analyst
- Password: analyst
