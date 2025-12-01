# VerifAI - AI-Powered KYC Document Verification Platform

## Overview
VerifAI is an intelligent Know Your Customer (KYC) document verification platform that leverages AI technologies to automate identity verification, detect fraud, and assist compliance teams with real-time insights.

## Tech Stack
- **Frontend**: React 18 with TypeScript, Tailwind CSS, Shadcn UI components
- **Backend**: Python Flask API with OpenAI integration (via Replit AI Integrations)
- **Server**: Node.js Express (serves frontend and proxies API requests to Python backend)
- **Storage**: In-memory storage (MVP)
- **AI**: OpenAI GPT-5 for document analysis and GenAI assistant

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
1. **Dashboard**: Real-time KPIs (total verifications, auto-approval rate, pending reviews, high-risk flags), verification volume chart, recent verifications feed
2. **Document Upload**: Drag-and-drop interface supporting JPG, PNG, PDF (max 10MB)
3. **Verification Detail**: Document viewer with OCR bounding boxes, risk scoring, data validation, approve/reject workflow
4. **GenAI Assistant**: AI-powered chat for document analysis and recommendations
5. **Integrations**: Mock connections to DMV, Passport Authority, SSA
6. **Patterns Library**: Fraud detection techniques and known patterns
7. **Settings**: Risk thresholds, automation rules, notification preferences

## Running the Application
The application requires two servers:
1. **Python Backend** (port 5001): `python python_backend/app.py`
2. **Node.js Server** (port 5000): `npm run dev`

## API Endpoints
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/verifications` - List all verifications
- `POST /api/verifications` - Create new verification (multipart form)
- `GET /api/verifications/:id` - Get verification details
- `PATCH /api/verifications/:id` - Update verification status
- `GET /api/verifications/:id/chat` - Get chat history
- `POST /api/verifications/:id/chat` - Send chat message
- `GET /api/integrations` - List integrations
- `GET /api/patterns` - List fraud patterns
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

## AI Integration
Uses Replit AI Integrations for OpenAI access:
- No API key required
- Charges billed to Replit credits
- Model: GPT-5 for document analysis and chat

## Design System
- Typography: Inter (UI), JetBrains Mono (technical data)
- Colors: Professional blue primary with neutral grays
- Layout: Max-width 7xl containers, responsive grid layouts
- Components: Shadcn UI with custom elevation system
