# VerifAI - AI-Powered KYC Document Verification Platform

## Overview

VerifAI is an enterprise-grade Know Your Customer (KYC) document verification platform that combines OCR capabilities with advanced AI technologies. The platform leverages LangChain for AI orchestration, LangGraph for multi-step verification workflows, RAG (Retrieval Augmented Generation) for context-aware AI assistance, and ChromaDB for vector embeddings and semantic search.

The core purpose is to automate identity document verification (passports, driver's licenses, national IDs), detect fraud patterns, calculate risk scores, and provide AI-powered assistance to compliance analysts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: Shadcn UI built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens following Material Design 3 principles
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Dual Backend Design**: Node.js Express server acts as a proxy to a Python Flask backend
- **Python Backend**: Handles all AI/ML operations including OCR, RAG, LangGraph workflows, and vector embeddings
- **Express Server**: Manages static file serving, session authentication, and proxies API requests to Python
- **Process Management**: Express spawns and monitors the Python backend process

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions and Zod validation schemas
- **Vector Store**: ChromaDB for document embeddings and semantic search
- **Session Storage**: Express sessions with memory store

### Authentication
- **Method**: Session-based authentication with username/password
- **Demo Credentials**: analyst/analyst for development
- **Session Management**: Express-session middleware

### AI/ML Pipeline
- **OCR**: OpenAI Vision API (GPT-4o) for document text extraction
- **LLM**: OpenAI GPT-4o for document analysis and chat
- **Embeddings**: OpenAI text-embedding-3-small for vector representations
- **Workflow Orchestration**: LangGraph state machine for multi-step verification
- **RAG**: LangChain with ChromaDB for context-aware AI responses

### Key Design Patterns
- **API Proxy Pattern**: All `/api/*` routes proxy through Express to Python backend
- **Shared Types**: TypeScript types in `shared/schema.ts` ensure frontend-backend type safety
- **Feature-based Pages**: Each major feature (Dashboard, Upload, VerificationDetail, etc.) has its own page component

## External Dependencies

### AI/ML Services
- **OpenAI API**: GPT-4o for document analysis, Vision API for OCR, text-embedding-3-small for embeddings
- **ChromaDB**: Local vector database for document embeddings and similarity search

### Database
- **PostgreSQL**: Primary data store via Neon serverless driver (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database queries and migrations

### Frontend Libraries
- **Radix UI**: Accessible component primitives for all UI elements
- **Framer Motion**: Page transitions and animations
- **Recharts**: Dashboard analytics charts
- **React Hook Form + Zod**: Form handling and validation

### Backend Services
- **Flask**: Python web framework for AI endpoints
- **LangChain**: AI orchestration and RAG pipeline
- **LangGraph**: Stateful workflow management for verification steps
- **psycopg2**: Python PostgreSQL adapter

### Development Tools
- **Vite**: Frontend build and dev server with HMR
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database migration tooling