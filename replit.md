# VerifAI - AI-Powered KYC Document Verification Platform

## Overview

VerifAI is an enterprise-grade Know Your Customer (KYC) document verification platform that combines OCR capabilities with advanced AI technologies. The platform uses LangChain for AI orchestration, LangGraph for multi-step verification workflows, RAG (Retrieval Augmented Generation) with ChromaDB for semantic document search, and OpenAI GPT-4o for document analysis and fraud detection.

The application provides automated identity verification for passports, driver's licenses, and national IDs with real-time risk scoring, fraud pattern matching, and an AI-powered GenAI assistant for compliance analysts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **Styling**: Tailwind CSS with a custom design system following Material Design 3 principles
- **Component Library**: Shadcn UI (Radix primitives) with custom theming
- **State Management**: TanStack Query for server state and data fetching
- **Routing**: Wouter (lightweight client-side routing)
- **Animations**: Framer Motion for UI transitions

The frontend follows a page-based architecture with shared components. Key pages include Dashboard, Upload, VerificationDetail, Settings, and an AI Architecture documentation page.

### Backend Architecture
- **Primary Backend**: Python Flask server handling AI/ML operations, OCR processing, and database operations
- **Proxy Layer**: Node.js Express server that proxies requests to the Python backend and serves static files
- **API Pattern**: RESTful endpoints with JSON responses

The Express server spawns and manages the Python Flask process, waiting for it to be ready before accepting requests. All `/api/*` routes are proxied to the Python backend.

### Database Layer
- **Database**: PostgreSQL (configured via Drizzle ORM)
- **ORM**: Drizzle ORM with Zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all database models

Key entities include Verifications (document submissions with OCR data, risk scores, and status), Settings, Integrations, FraudPatterns, and ChatMessages for the GenAI assistant.

### AI/ML Pipeline
- **LangChain**: Orchestrates AI components and chains
- **LangGraph**: Manages multi-step verification workflows with state machines
- **Vector Store**: ChromaDB for document embeddings and semantic search
- **Embeddings**: OpenAI text-embedding-3-small model
- **LLM**: OpenAI GPT-4o for document analysis and chat
- **OCR**: OpenAI Vision API for text extraction from documents

The RAG service (`python_backend/rag_service.py`) provides document embedding creation, semantic search, fraud pattern matching, and context-aware chat responses.

### Authentication
- Simple session-based authentication using express-session
- Demo credentials hardcoded for development (analyst/analyst)
- Session data stored in memory (MemoryStore)

## External Dependencies

### AI/ML Services
- **OpenAI API**: GPT-4o for document analysis, Vision API for OCR, text-embedding-3-small for embeddings
- **ChromaDB**: Local vector database for document embeddings (initialized in RAG service)

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Neon Database**: Uses `@neondatabase/serverless` driver for PostgreSQL connections

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for all AI features
- `PYTHON_BACKEND_URL`: Python Flask backend URL (defaults to `http://127.0.0.1:5001`)

### Key NPM Dependencies
- `@tanstack/react-query`: Data fetching and caching
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `express` / `express-session`: HTTP server and sessions
- `multer`: File upload handling

### Key Python Dependencies
- `flask` / `flask-cors`: Web framework
- `openai`: OpenAI API client
- `langchain-openai` / `langchain-core` / `langchain-chroma`: LangChain ecosystem
- `langgraph`: Workflow orchestration
- `psycopg2`: PostgreSQL driver