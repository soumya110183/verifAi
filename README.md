# VerifAI - AI-Powered KYC Document Verification Platform

<p align="center">
  <strong>Intelligent Know Your Customer (KYC) document verification powered by cutting-edge AI technologies</strong>
</p>

<p align="center">
  <em>LangChain | LangGraph | RAG | Vector Embeddings | OpenAI GPT-4o | ChromaDB</em>
</p>

---

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [AI Technologies](#ai-technologies)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Menu Flow](#menu-flow)
- [User Flow](#user-flow)
- [Technical Details](#technical-details)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)

---

## Overview

VerifAI is an enterprise-grade Know Your Customer (KYC) document verification platform that combines traditional OCR capabilities with advanced AI technologies. The platform leverages **LangChain** for intelligent document processing, **LangGraph** for multi-step verification workflows, **RAG (Retrieval Augmented Generation)** for context-aware AI assistance, and **ChromaDB** for semantic document similarity search.

### What Makes VerifAI Unique

- **Multi-Step Verification Workflow**: LangGraph orchestrates a sophisticated verification pipeline with OCR analysis, fraud detection, historical comparison, and compliance checking
- **Knowledge-Augmented AI Assistant**: RAG-enhanced GenAI provides contextual responses by retrieving relevant historical documents and fraud patterns
- **Semantic Fraud Detection**: Vector embeddings enable similarity-based fraud pattern matching across the document knowledge base
- **Real-Time Risk Scoring**: Advanced algorithms analyze document quality, data consistency, and historical patterns

---

## Key Features

### Core Verification Features

| Feature | Description | Technology |
|---------|-------------|------------|
| **AI-Powered OCR** | Automated text extraction from passports, driver's licenses, and national IDs with field-level confidence scoring | OpenAI Vision API (GPT-4o) |
| **Intelligent Risk Scoring** | Multi-factor risk assessment analyzing document quality, data consistency, OCR confidence, and historical patterns | Custom Risk Engine |
| **LangGraph Verification Workflow** | Automated multi-step verification pipeline with OCR analysis, fraud detection, similarity search, and compliance validation | LangGraph State Machine |
| **RAG-Enhanced GenAI Assistant** | Context-aware AI chat that retrieves relevant historical documents and fraud patterns for informed responses | LangChain RAG + ChromaDB |
| **Semantic Document Search** | Find similar verifications using natural language queries across the entire document knowledge base | Vector Embeddings + ChromaDB |
| **Fraud Pattern Matching** | Automatic detection of fraud patterns by comparing against a vector-embedded library of known techniques | Cosine Similarity Search |

### Dashboard & Analytics

| Feature | Description |
|---------|-------------|
| **Real-Time KPIs** | Total verifications, auto-approval rate, pending reviews, and high-risk flags at a glance |
| **Verification Volume Chart** | 7-day trend visualization of verification activity with status breakdown |
| **Recent Activity Feed** | Live feed of verification submissions with risk indicators and status |
| **RAG System Status** | Knowledge base statistics showing indexed documents, embeddings, and AI model health |

### Document Processing

| Feature | Description |
|---------|-------------|
| **Drag-and-Drop Upload** | Intuitive file upload supporting JPG, PNG, and PDF formats up to 10MB |
| **Batch Processing** | Upload and process multiple documents simultaneously with progress tracking |
| **Document Preview** | Full-size document viewer with OCR field highlighting |
| **Multi-Tab Analysis** | Organized views for OCR data, validation results, and risk insights |

### Compliance & Audit

| Feature | Description |
|---------|-------------|
| **Complete Audit Trail** | Every action logged with timestamp, user, IP address, and detailed changes |
| **Filterable Logs** | Search audit history by action type, entity, user, or date range |
| **CSV Export** | Export audit logs for external compliance reporting |
| **Role-Based Access** | Session-based authentication with configurable user permissions |

### Configuration & Integrations

| Feature | Description |
|---------|-------------|
| **Risk Thresholds** | Configurable auto-approve (low risk) and high-risk threshold values |
| **Automation Rules** | Optional auto-rejection for high-risk documents |
| **Notification Settings** | Email and in-app notification preferences |
| **External Data Sources** | Integration points for DMV, Passport Authority, and SSA verification |
| **Fraud Pattern Library** | Curated detection techniques for font substitution, photo manipulation, and metadata tampering |

---

## AI Technologies

### LangChain Integration

LangChain powers the core AI capabilities of VerifAI:

```
┌─────────────────────────────────────────────────────────────────────┐
│                     LANGCHAIN COMPONENTS                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐   ┌──────────────────┐   ┌────────────────┐  │
│  │   ChatOpenAI     │   │ OpenAIEmbeddings │   │  ChromaDB      │  │
│  │   (GPT-4o)       │   │ (text-embedding  │   │  Vector Store  │  │
│  │                  │   │  -3-small)       │   │                │  │
│  │  - Chat responses│   │  - Document      │   │  - Persistent  │  │
│  │  - Analysis      │   │    embeddings    │   │    storage     │  │
│  │  - Reasoning     │   │  - Semantic      │   │  - Similarity  │  │
│  │                  │   │    similarity    │   │    search      │  │
│  └──────────────────┘   └──────────────────┘   └────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     RAG Chain                                  │  │
│  │  Query → Retrieve Similar Docs → Augment Context → Generate   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Capabilities:**
- **ChatOpenAI**: GPT-4o model for document analysis, risk assessment, and conversational AI
- **OpenAIEmbeddings**: text-embedding-3-small model for creating vector representations of documents
- **Document Loaders**: Convert verification data into LangChain Document objects with metadata
- **Prompt Templates**: Specialized prompts for compliance analysis and fraud detection

### LangGraph Verification Workflow

LangGraph orchestrates a sophisticated multi-step verification pipeline:

```
┌─────────────────────────────────────────────────────────────────────┐
│                  LANGGRAPH VERIFICATION WORKFLOW                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐  │
│  │    OCR    │───▶│   FRAUD   │───▶│  SIMILAR  │───▶│COMPLIANCE │  │
│  │ ANALYSIS  │    │ DETECTION │    │   DOCS    │    │   CHECK   │  │
│  └───────────┘    └───────────┘    └───────────┘    └───────────┘  │
│       │                │                │                │          │
│       │                │                │                │          │
│       ▼                ▼                ▼                ▼          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    VERIFICATION STATE                        │   │
│  │  - verification_id    - fraud_indicators    - risk_score    │   │
│  │  - document_type      - similar_documents   - risk_level    │   │
│  │  - ocr_data          - compliance_check    - recommendation │   │
│  │  - workflow_steps    (accumulated across all nodes)         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│                                ▼                                     │
│                    ┌───────────────────────┐                        │
│                    │     RECOMMENDATION    │                        │
│                    │  APPROVE | REJECT |   │                        │
│                    │    MANUAL REVIEW      │                        │
│                    └───────────────────────┘                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Workflow Nodes:**

1. **OCR Analysis Node**
   - Evaluates extracted field quality
   - Flags low-confidence extractions (<80%)
   - Identifies missing required fields

2. **Fraud Detection Node**
   - Matches against embedded fraud pattern library
   - Uses vector similarity for pattern detection
   - Reports confidence scores for matches

3. **Similar Documents Node**
   - Retrieves historically similar verifications
   - Identifies patterns from high-risk similar documents
   - Provides context from past decisions

4. **Compliance Check Node**
   - Validates document type acceptability
   - Checks for required fields (name, DOB, document number)
   - Verifies expiry and issuing authority

5. **Recommendation Node**
   - Aggregates all indicators
   - Generates final APPROVE/REJECT/MANUAL REVIEW decision
   - Provides reasoning summary

### RAG (Retrieval Augmented Generation)

The RAG system enhances AI responses with relevant historical context:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RAG PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  User Query: "What are the risk factors for this document?"         │
│                                                                      │
│       │                                                              │
│       ▼                                                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    RETRIEVAL PHASE                             │  │
│  │  1. Embed user query using text-embedding-3-small              │  │
│  │  2. Search ChromaDB for similar verifications (k=2)            │  │
│  │  3. Search ChromaDB for matching fraud patterns (k=2)          │  │
│  │  4. Rank results by cosine similarity score                    │  │
│  └───────────────────────────────────────────────────────────────┘  │
│       │                                                              │
│       ▼                                                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    AUGMENTATION PHASE                          │  │
│  │  Context = Current Document + Similar Documents + Patterns     │  │
│  │                                                                │  │
│  │  "Current Document: Passport, Risk Score: 45..."               │  │
│  │  "Similar Case 1: Medium risk, approved..."                    │  │
│  │  "Matching Pattern: Font substitution detected..."             │  │
│  └───────────────────────────────────────────────────────────────┘  │
│       │                                                              │
│       ▼                                                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    GENERATION PHASE                            │  │
│  │  GPT-4o generates response using augmented context             │  │
│  │                                                                │  │
│  │  "Based on the analysis and similar past cases, the main      │  │
│  │   risk factors are: 1) Low OCR confidence on DOB field...     │  │
│  │   2) Similar to 2 previously flagged documents..."            │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**RAG Benefits:**
- **Historical Context**: AI responses informed by past verification decisions
- **Pattern Recognition**: Automatic retrieval of relevant fraud patterns
- **Reduced Hallucination**: Grounded responses based on actual data
- **Institutional Knowledge**: Captures and leverages organizational expertise

### Vector Embeddings & ChromaDB

ChromaDB provides persistent vector storage for semantic search:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CHROMADB VECTOR STORE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Collection: verifai_documents                                       │
│  Embedding Model: text-embedding-3-small (1536 dimensions)          │
│  Persist Directory: ./chroma_db                                      │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  DOCUMENT TYPES                                 │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │                                                                 │ │
│  │  Verifications (type: "verification")                          │ │
│  │  ├── Document type, customer name                              │ │
│  │  ├── Risk score, risk level, status                            │ │
│  │  ├── OCR extracted fields with confidence                      │ │
│  │  ├── Risk insights and validation results                      │ │
│  │  └── Submission timestamp                                       │ │
│  │                                                                 │ │
│  │  Fraud Patterns (type: "fraud_pattern")                        │ │
│  │  ├── Pattern name and description                              │ │
│  │  ├── Detection technique                                        │ │
│  │  └── Confidence score                                           │ │
│  │                                                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                  SEARCH CAPABILITIES                           │ │
│  ├────────────────────────────────────────────────────────────────┤ │
│  │  • Semantic similarity search with cosine distance             │ │
│  │  • Metadata filtering by document type                         │ │
│  │  • Configurable result count (k parameter)                     │ │
│  │  • Similarity score ranking (0-1 scale)                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Technical Stack

### Frontend
```
React 18          - Modern UI with hooks and functional components
TypeScript        - Type-safe development
Vite              - Fast build tool and dev server
Tailwind CSS      - Utility-first styling
Shadcn/UI         - Pre-built accessible components
Wouter            - Lightweight routing
TanStack Query    - Server state management
Recharts          - Data visualization
Lucide React      - Icon library
```

### Backend
```
Node.js/Express   - API gateway and static file server
Python Flask      - Core business logic and AI services
PostgreSQL        - Persistent data storage (Neon-backed)
Multer            - File upload handling
psycopg2          - PostgreSQL driver for Python
```

### AI & ML Stack
```
OpenAI GPT-4o           - Document analysis, chat, reasoning
OpenAI Vision API       - OCR and image analysis
OpenAI Embeddings       - text-embedding-3-small for vectors
LangChain               - AI application framework
LangGraph               - Multi-step workflow orchestration
ChromaDB                - Vector database for embeddings
tiktoken                - Token counting for context management
```

### Python Dependencies
```python
langchain               - Core LangChain framework
langchain-openai        - OpenAI integrations
langchain-community     - Community integrations
langgraph               - State machine workflows
chromadb                - Vector store
openai                  - OpenAI Python SDK
tiktoken                - Tokenization
psycopg2-binary         - PostgreSQL driver
flask                   - Web framework
flask-cors              - CORS handling
python-dotenv           - Environment variables
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                             │
│                         (React SPA @ :5000)                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EXPRESS SERVER (:5000)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐ │
│  │   Vite Dev  │  │   Session   │  │     API Proxy to Flask      │ │
│  │   Server    │  │   Auth      │  │   (Multer File Handling)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       FLASK API SERVER (:5001)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Verification │  │   OpenAI    │  │      Risk Engine         │  │
│  │   Service     │  │  Integration │  │   (Scoring/Detection)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  RAG Service │  │  LangGraph   │  │     Batch Processing     │  │
│  │  (LangChain) │  │   Workflow   │  │        Service           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │    Chat      │  │   Audit     │                                  │
│  │   Service    │  │   Logging   │                                  │
│  └──────────────┘  └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
                          │                    │
                          ▼                    ▼
┌────────────────────────────────┐  ┌─────────────────────────────────┐
│      POSTGRESQL DATABASE        │  │         CHROMADB                 │
│  ┌──────────────┐  ┌─────────┐ │  │      (Vector Store)              │
│  │ verifications │  │  chat   │ │  │  ┌─────────────────────────┐   │
│  └──────────────┘  │messages │ │  │  │  verifai_documents      │   │
│  ┌──────────────┐  └─────────┘ │  │  │  - Verification vectors │   │
│  │  audit_logs  │  ┌─────────┐ │  │  │  - Fraud pattern vectors│   │
│  └──────────────┘  │settings │ │  │  └─────────────────────────┘   │
│  ┌──────────────┐  └─────────┘ │  └─────────────────────────────────┘
│  │  batch_jobs  │              │
│  └──────────────┘              │
└────────────────────────────────┘
```

### Data Flow

1. **Document Upload** → Express receives file → Proxies to Flask
2. **OCR Processing** → Flask sends image to OpenAI Vision API → Extracts fields
3. **Risk Assessment** → Risk engine calculates score → Generates insights
4. **Vector Embedding** → Document embedded → Stored in ChromaDB
5. **Workflow Analysis** → LangGraph runs verification pipeline
6. **Database Storage** → Verification saved to PostgreSQL
7. **AI Chat** → RAG retrieves context → LangChain generates response

---

## Menu Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          TOP NAVIGATION BAR                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [VerifAI Logo]                                                      │
│                                                                      │
│  Navigation Links:                                                   │
│  ├── Dashboard (/dashboard)         - Main overview page             │
│  ├── Audit Trail (/audit)           - Activity logs                  │
│  ├── Integrations (/integrations)   - External connections           │
│  ├── Patterns (/patterns)           - Fraud detection library        │
│  └── Settings (/settings)           - Configuration                  │
│                                                                      │
│  Actions:                                                            │
│  ├── [Upload Document] Button       - Opens upload page              │
│  └── [User Menu]                    - Profile and logout             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Page Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Login | Authentication page |
| `/dashboard` | Dashboard | Main overview with KPIs and RAG status |
| `/upload` | Upload | Document upload interface |
| `/verification/:id` | Verification Detail | Review with AI assistant |
| `/integrations` | Integrations | External data source connections |
| `/patterns` | Patterns | Fraud detection techniques |
| `/settings` | Settings | System configuration |
| `/audit` | Audit Trail | Activity log viewer |

---

## User Flow

```
┌─────────────┐
│    LOGIN    │
│  (analyst)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            DASHBOARD                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Total     │  │    Auto     │  │   Pending   │  │  High Risk │ │
│  │Verifications│  │  Approval   │  │   Review    │  │   Flags    │ │
│  │     12      │  │    Rate     │  │      4      │  │     2      │ │
│  │             │  │    50%      │  │             │  │            │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│                                                                      │
│  [Verification Volume Chart]        [Recent Verifications List]     │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  RAG System Status: Active                                    │   │
│  │  Knowledge Base: 156 documents | ChromaDB: Connected          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌─────────────┐        ┌─────────────────────────────────────────────┐
│   UPLOAD    │        │           VERIFICATION DETAIL                │
│  DOCUMENT   │        │  ┌─────────────────────────────────────────┐ │
│             │        │  │         Document Preview                │ │
│ [Drag/Drop] │        │  │    (Image with OCR Highlights)          │ │
│  [Browse]   │        │  └─────────────────────────────────────────┘ │
└──────┬──────┘        │  ┌─────────────────────────────────────────┐ │
       │               │  │    Tabs: OCR Data | Validation | Risk   │ │
       │               │  │    ─────────────────────────────────    │ │
       │               │  │    Name: John Smith          98%        │ │
       │               │  │    DOB: 1985-03-15           96%        │ │
       │               │  │    Doc #: ABC123456          99%        │ │
       │               │  └─────────────────────────────────────────┘ │
       │               │  ┌─────────────────────────────────────────┐ │
       │               │  │   [APPROVE]  [REJECT]  [Ask AI]         │ │
       │               │  └─────────────────────────────────────────┘ │
       │               │  ┌─────────────────────────────────────────┐ │
       └───────────────┤  │     RAG-Enhanced GenAI Assistant        │ │
                       │  │  "What are the risk factors?"           │ │
                       │  │  AI: "Based on similar past cases..."   │ │
                       │  │       [Similar: 3 docs | Patterns: 2]   │ │
                       │  └─────────────────────────────────────────┘ │
                       └─────────────────────────────────────────────┘
                              │
                              ▼
                       ┌─────────────┐
                       │   AUDIT     │
                       │   TRAIL     │
                       │  (Logged)   │
                       └─────────────┘
```

### User Journey Steps

1. **Login**: Analyst enters credentials (analyst/analyst)
2. **Dashboard Review**: View KPIs, RAG status, recent verifications
3. **Upload Document**: Drag-and-drop or browse to upload ID document
4. **AI Processing**: 
   - OCR extraction with OpenAI Vision
   - Risk score calculation
   - Vector embedding creation
   - LangGraph workflow execution
5. **Review Verification**: Examine OCR data, risk insights, similar documents
6. **Consult AI**: RAG-enhanced chat with historical context
7. **Decision**: Approve or reject with full audit logging
8. **Knowledge Base Update**: Decision embedded for future reference

---

## Technical Details

### Database Schema

```javascript
// verifications table
{
  id: "uuid",
  document_type: "passport | drivers_license | national_id",
  document_url: "base64 encoded image",
  status: "pending | approved | rejected | in_review",
  risk_score: 0-100,
  risk_level: "low | medium | high",
  customer_name: "string",
  submitted_at: "timestamp",
  reviewed_at: "timestamp",
  ocr_fields: "jsonb[]",
  risk_insights: "jsonb[]",
  validation_results: "jsonb[]"
}

// chat_messages table
{
  id: "uuid",
  verification_id: "uuid (FK)",
  role: "user | assistant",
  content: "string",
  timestamp: "timestamp"
}

// audit_logs table
{
  id: "uuid",
  action: "string",
  entity_type: "string",
  entity_id: "string",
  user_id: "string",
  user_name: "string",
  details: "jsonb",
  ip_address: "string",
  timestamp: "timestamp"
}

// batch_jobs table
{
  id: "uuid",
  name: "string",
  status: "pending | processing | completed | failed",
  total_documents: "integer",
  processed_documents: "integer",
  successful_documents: "integer",
  failed_documents: "integer",
  verification_ids: "jsonb[]",
  created_at: "timestamp",
  started_at: "timestamp",
  completed_at: "timestamp"
}
```

### Risk Scoring Algorithm

```javascript
function calculateRiskScore(ocrResult, documentType) {
  let baseScore = 20;
  
  // Document quality assessment
  if (qualityScore < 50) baseScore += 30;
  else if (qualityScore < 70) baseScore += 15;
  
  // Issue detection from OCR
  baseScore += issueCount * 8;
  
  // Readability check
  if (!isReadable) baseScore += 25;
  
  // OCR confidence average
  if (avgConfidence < 70) baseScore += 20;
  else if (avgConfidence < 85) baseScore += 10;
  
  // LangGraph fraud pattern matches
  baseScore += fraudPatternMatches * 10;
  
  // Similar high-risk documents
  baseScore += highRiskSimilarDocs * 5;
  
  return Math.min(Math.max(baseScore, 5), 95);
}

// Risk Level Classification
// Low:    0-29  → Auto-approve candidate
// Medium: 30-69 → Manual review required
// High:   70+   → High fraud risk
```

### RAG Implementation

```python
# RAG-enhanced chat with document context retrieval
def rag_enhanced_chat(verification, user_message, chat_history):
    # 1. Retrieve similar documents from ChromaDB
    similar_docs = find_similar_verifications(verification, k=2)
    matching_patterns = find_matching_fraud_patterns(verification, k=2)
    
    # 2. Build augmented context
    context = f"""
    Current Document: {verification['documentType']}
    Risk Score: {verification['riskScore']}/100
    
    Similar Past Verifications:
    {format_similar_docs(similar_docs)}
    
    Matching Fraud Patterns:
    {format_patterns(matching_patterns)}
    """
    
    # 3. Generate response with LangChain
    messages = [SystemMessage(content=context)]
    messages.extend(format_chat_history(chat_history))
    messages.append(HumanMessage(content=user_message))
    
    response = llm.invoke(messages)
    return response.content
```

### LangGraph Workflow

```python
# Create verification workflow
workflow = StateGraph(VerificationState)

# Add nodes
workflow.add_node("ocr_analysis", ocr_analysis_node)
workflow.add_node("fraud_detection", fraud_detection_node)
workflow.add_node("similar_docs", similar_docs_node)
workflow.add_node("compliance_check", compliance_check_node)
workflow.add_node("recommendation", recommendation_node)

# Define edges (linear flow)
workflow.set_entry_point("ocr_analysis")
workflow.add_edge("ocr_analysis", "fraud_detection")
workflow.add_edge("fraud_detection", "similar_docs")
workflow.add_edge("similar_docs", "compliance_check")
workflow.add_edge("compliance_check", "recommendation")
workflow.add_edge("recommendation", END)

# Compile and execute
app = workflow.compile()
result = app.invoke(initial_state)
```

---

## API Reference

### Verification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/verifications` | List all verifications |
| POST | `/api/verifications` | Upload new document |
| GET | `/api/verifications/:id` | Get verification details |
| PATCH | `/api/verifications/:id` | Update status |
| GET | `/api/verifications/:id/chat` | Get chat history |
| POST | `/api/verifications/:id/chat` | Send chat message (RAG-enhanced) |

### RAG & AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rag/status` | Get RAG system status and knowledge base stats |
| POST | `/api/rag/search` | Semantic search across document knowledge base |
| GET | `/api/rag/similar/:id` | Find similar verifications for a document |
| POST | `/api/rag/analyze/:id` | Run complete RAG analysis with LangGraph workflow |
| POST | `/api/rag/workflow/:id` | Execute LangGraph verification workflow |
| POST | `/api/rag/embed` | Manually trigger embedding for all documents |

### Batch Processing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/batch-jobs` | List all batch jobs |
| POST | `/api/batch-jobs` | Create batch job |
| GET | `/api/batch-jobs/:id` | Get job details |
| GET | `/api/batch-jobs/:id/verifications` | Get job verifications |
| GET | `/api/batch-jobs/stats` | Get batch statistics |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/integrations` | List integrations |
| GET | `/api/patterns` | List fraud patterns |
| GET/PUT | `/api/settings` | Get/update settings |
| GET | `/api/audit-logs` | List audit logs |
| GET | `/api/audit-logs/export` | Export as CSV |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL database
- OpenAI API key

### Environment Variables
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
SESSION_SECRET=your-session-secret
```

### Installation
```bash
# Install Node dependencies
npm install

# Install Python dependencies
pip install flask flask-cors openai psycopg2-binary python-dotenv \
    langchain langchain-openai langchain-community langgraph chromadb tiktoken

# Start the application
npm run dev
```

### Login Credentials
- **Username**: analyst
- **Password**: analyst

---

## License
MIT License - See LICENSE file for details.
#   v e r i f A i  
 