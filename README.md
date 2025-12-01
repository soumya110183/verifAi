# VerifAI - AI-Powered KYC Document Verification Platform

<p align="center">
  <strong>Intelligent Know Your Customer (KYC) document verification powered by AI</strong>
</p>

---

## Table of Contents
- [Features](#features)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Menu Flow](#menu-flow)
- [User Flow](#user-flow)
- [Technical Details](#technical-details)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **AI-Powered OCR** | Automated text extraction from identity documents using OpenAI Vision API |
| **Risk Scoring** | Intelligent risk assessment based on document quality, data consistency, and fraud indicators |
| **Real-time Dashboard** | KPIs, verification volume charts, and recent activity feed |
| **Document Verification** | Support for passports, driver's licenses, and national ID cards |
| **GenAI Assistant** | AI-powered chat for document analysis and compliance guidance |
| **Batch Processing** | Upload and process multiple documents simultaneously |
| **Audit Trail** | Complete activity logging with filtering and CSV export |
| **Session Authentication** | Secure login with session-based access control |

### Supporting Features

- **Integrations Hub**: Connections to DMV, Passport Authority, SSA for data verification
- **Fraud Patterns Library**: Detection techniques for font substitution, photo manipulation, metadata tampering
- **Configurable Settings**: Risk thresholds, automation rules, notification preferences
- **Auto-Approval/Rejection**: Rule-based automation based on risk scores

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
PostgreSQL        - Persistent data storage
Multer            - File upload handling
psycopg2          - PostgreSQL driver for Python
```

### AI Stack
```
OpenAI GPT-4o     - Document analysis and chat responses
OpenAI Vision API - OCR and image analysis
Custom Risk Engine - Fraud detection and scoring algorithms
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
│  │    Chat      │  │   Audit     │  │     Batch Processing     │  │
│  │   Service    │  │   Logging   │  │        Service           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL DATABASE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ verifications │  │chat_messages │  │       audit_logs         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │   settings   │  │  batch_jobs  │                                 │
│  └──────────────┘  └──────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Interaction

1. **Browser → Express**: All requests go through Express on port 5000
2. **Express → Flask**: API requests proxied to Flask on port 5001
3. **Flask → OpenAI**: Document images sent for OCR and analysis
4. **Flask → PostgreSQL**: All data persisted to database
5. **Express Auth**: Session-based authentication gates access

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
| `/dashboard` | Dashboard | Main overview with KPIs |
| `/upload` | Upload | Document upload interface |
| `/verification/:id` | Verification Detail | Review and approve/reject |
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
       └───────────────┤  │         GenAI Assistant Chat            │ │
                       │  │  "What are the risk factors?"           │ │
                       │  │  AI: "Based on the analysis..."         │ │
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
2. **Dashboard Review**: View KPIs, recent verifications, trends
3. **Upload Document**: Drag-and-drop or browse to upload ID document
4. **AI Processing**: System extracts OCR data, calculates risk score
5. **Review Verification**: Analyst examines extracted data, risk insights
6. **Consult AI**: Optional chat with GenAI for guidance
7. **Decision**: Approve or reject the verification
8. **Audit Logged**: All actions recorded for compliance

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

// settings table
{
  id: 1,
  auto_approve_threshold: 30,
  high_risk_threshold: 70,
  email_notifications: true,
  in_app_notifications: true,
  auto_reject_high_risk: false
}
```

### Risk Scoring Algorithm

```javascript
function calculateRiskScore(ocrResult, documentType) {
  let baseScore = 20;
  
  // Document quality assessment
  if (qualityScore < 50) baseScore += 30;
  else if (qualityScore < 70) baseScore += 15;
  
  // Issue detection
  baseScore += issueCount * 8;
  
  // Readability check
  if (!isReadable) baseScore += 25;
  
  // OCR confidence
  if (avgConfidence < 70) baseScore += 20;
  else if (avgConfidence < 85) baseScore += 10;
  
  return Math.min(Math.max(baseScore, 5), 95);
}

// Risk Level Classification
// Low:    0-29  → Auto-approve candidate
// Medium: 30-69 → Manual review required
// High:   70+   → High fraud risk
```

### Frontend State Management

```javascript
// TanStack Query for server state
const { data: verifications } = useQuery({
  queryKey: ['/api/verifications'],
});

// Mutations with cache invalidation
const updateMutation = useMutation({
  mutationFn: (data) => apiRequest('PATCH', `/api/verifications/${id}`, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/verifications'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
  }
});

// Authentication hook
const { user, isAuthenticated, login, logout } = useAuth();
```

### Express Proxy Pattern

```javascript
// Proxy all API requests to Flask backend
async function proxyToPython(req, res, options = {}) {
  const url = `${PYTHON_BACKEND_URL}${req.path}`;
  const response = await fetch(url, {
    method: options.method || req.method,
    headers: { 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await response.json();
  res.status(response.status).json(data);
}

// File upload handling with Multer
app.post('/api/verifications', 
  upload.single('document'),
  async (req, res) => {
    const formData = new FormData();
    formData.append('document', new Blob([req.file.buffer]));
    // Forward to Flask...
  }
);
```

### OpenAI Integration

```python
# Vision API for OCR
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {
                "url": f"data:{mime_type};base64,{image_base64}",
                "detail": "high"
            }}
        ]
    }],
    max_tokens=1000
)

# Chat completions for GenAI Assistant
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": context},
        *chat_history
    ],
    max_tokens=500
)
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
| POST | `/api/verifications/:id/chat` | Send chat message |

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
pip install flask flask-cors openai psycopg2-binary python-dotenv

# Start the application
npm run dev
```

### Login Credentials
- **Username**: analyst
- **Password**: analyst

---

## License
MIT License - See LICENSE file for details.
