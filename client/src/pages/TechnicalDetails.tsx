import { motion } from "framer-motion";
import { 
  Code2, 
  Database, 
  Brain, 
  Shield, 
  FileCheck, 
  Upload,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  Layers,
  Server,
  Globe,
  Zap,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const techStack = {
  frontend: [
    { name: "React 18", description: "Modern UI library with hooks and functional components" },
    { name: "TypeScript", description: "Type-safe JavaScript for robust development" },
    { name: "Tailwind CSS", description: "Utility-first CSS framework for rapid styling" },
    { name: "Shadcn UI", description: "Beautifully designed component library" },
    { name: "Framer Motion", description: "Production-ready animation library" },
    { name: "TanStack Query", description: "Powerful data fetching and caching" },
    { name: "Wouter", description: "Lightweight routing solution" },
    { name: "Recharts", description: "Composable charting library" },
  ],
  backend: [
    { name: "Python Flask", description: "Lightweight WSGI web application framework" },
    { name: "Node.js Express", description: "Fast, unopinionated web framework for proxying" },
    { name: "PostgreSQL", description: "Advanced open-source relational database" },
    { name: "Drizzle ORM", description: "TypeScript ORM for type-safe database queries" },
  ],
  ai: [
    { name: "OpenAI GPT-4o", description: "Advanced language model for document analysis" },
    { name: "OpenAI Vision API", description: "OCR and image analysis capabilities" },
    { name: "LangChain", description: "Framework for LLM application development" },
    { name: "LangGraph", description: "Workflow orchestration for AI agents" },
    { name: "ChromaDB", description: "Vector database for embeddings and semantic search" },
    { name: "RAG Pipeline", description: "Retrieval Augmented Generation for context-aware AI" },
  ],
};

const features = [
  {
    icon: Upload,
    title: "Document Upload & OCR",
    description: "Drag-and-drop document upload with AI-powered OCR extraction using OpenAI Vision API. Supports passports, driver's licenses, and national IDs.",
    status: "implemented"
  },
  {
    icon: Brain,
    title: "AI-Powered Risk Scoring",
    description: "Automated risk assessment using machine learning algorithms that analyze document quality, data consistency, and fraud indicators.",
    status: "implemented"
  },
  {
    icon: Shield,
    title: "Fraud Detection Patterns",
    description: "Library of known fraud patterns including font substitution, photo manipulation, metadata tampering, and MRZ inconsistencies.",
    status: "implemented"
  },
  {
    icon: MessageSquare,
    title: "GenAI Assistant",
    description: "RAG-enhanced chat assistant that provides context-aware insights about verifications using historical data and fraud patterns.",
    status: "implemented"
  },
  {
    icon: Layers,
    title: "LangGraph Workflows",
    description: "Multi-step verification workflow with OCR analysis, fraud detection, similarity search, compliance checks, and recommendations.",
    status: "implemented"
  },
  {
    icon: BarChart3,
    title: "Real-time Dashboard",
    description: "Live KPIs showing verification metrics, approval rates, pending reviews, and high-risk flags with interactive charts.",
    status: "implemented"
  },
  {
    icon: Database,
    title: "Vector Search",
    description: "Semantic document search using ChromaDB embeddings to find similar past verifications and matching fraud patterns.",
    status: "implemented"
  },
  {
    icon: FileCheck,
    title: "Verification Workflow",
    description: "Complete approve/reject workflow with audit trail, status tracking, and detailed verification review interface.",
    status: "implemented"
  },
  {
    icon: Settings,
    title: "Configurable Settings",
    description: "Adjustable risk thresholds, auto-approval rules, and notification preferences for compliance customization.",
    status: "implemented"
  },
  {
    icon: Users,
    title: "Session Authentication",
    description: "Secure session-based authentication protecting all verification data and operations.",
    status: "implemented"
  },
];

const apiEndpoints = [
  { method: "GET", path: "/api/dashboard", description: "Dashboard statistics and metrics" },
  { method: "GET", path: "/api/verifications", description: "List all verifications" },
  { method: "POST", path: "/api/verifications", description: "Create new verification with document upload" },
  { method: "GET", path: "/api/verifications/:id", description: "Get verification details" },
  { method: "PATCH", path: "/api/verifications/:id", description: "Update verification status (approve/reject)" },
  { method: "POST", path: "/api/verifications/:id/chat", description: "Send message to GenAI assistant" },
  { method: "GET", path: "/api/patterns", description: "List fraud detection patterns" },
  { method: "GET", path: "/api/integrations", description: "List external data integrations" },
  { method: "GET", path: "/api/settings", description: "Get system settings" },
  { method: "PUT", path: "/api/settings", description: "Update system settings" },
  { method: "GET", path: "/api/audit-logs", description: "Get audit trail logs" },
  { method: "POST", path: "/api/rag/query", description: "Query RAG system directly" },
];

function TechStackSection({ title, items, color }: { title: string; items: { name: string; description: string }[]; color: string }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        {title}
      </h3>
      <div className="grid gap-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-medium">{item.name}</span>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TechnicalDetails() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
              <Code2 className="w-8 h-8 text-primary" />
              Technical Details
            </h1>
            <p className="text-muted-foreground mt-1">
              Project documentation, tech stack, and implemented features
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8" data-testid="tabs-technical">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="stack" data-testid="tab-stack">Tech Stack</TabsTrigger>
            <TabsTrigger value="features" data-testid="tab-features">Features</TabsTrigger>
            <TabsTrigger value="api" data-testid="tab-api">API Reference</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Project Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">VerifAI</strong> is an AI-powered Know Your Customer (KYC) document verification platform 
                    that leverages cutting-edge AI technologies to automate identity verification, detect fraud, 
                    and assist compliance teams with real-time insights.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Server className="w-6 h-6 text-blue-500 mb-2" />
                      <h4 className="font-semibold">Architecture</h4>
                      <p className="text-sm text-muted-foreground">
                        React frontend + Flask AI backend + Express proxy server with PostgreSQL database
                      </p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <Brain className="w-6 h-6 text-purple-500 mb-2" />
                      <h4 className="font-semibold">AI Capabilities</h4>
                      <p className="text-sm text-muted-foreground">
                        GPT-4o Vision OCR, LangChain RAG, LangGraph workflows, ChromaDB vector search
                      </p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Shield className="w-6 h-6 text-green-500 mb-2" />
                      <h4 className="font-semibold">Security</h4>
                      <p className="text-sm text-muted-foreground">
                        Session-based authentication, audit logging, encrypted data handling
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Key Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Real-time document OCR with OpenAI Vision API</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>AI-powered risk scoring and fraud detection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>RAG-enhanced GenAI assistant for insights</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Multi-step LangGraph verification workflows</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Vector-based similar document search</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Comprehensive audit trail logging</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Configurable auto-approval thresholds</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Interactive architecture visualization</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Login Credentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <p><span className="text-muted-foreground">Username:</span> <span className="text-primary font-semibold">analyst</span></p>
                    <p><span className="text-muted-foreground">Password:</span> <span className="text-primary font-semibold">analyst</span></p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="stack">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Technology Stack</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-8">
                    <TechStackSection 
                      title="Frontend" 
                      items={techStack.frontend} 
                      color="bg-blue-500" 
                    />
                    <TechStackSection 
                      title="Backend" 
                      items={techStack.backend} 
                      color="bg-green-500" 
                    />
                    <TechStackSection 
                      title="AI & ML" 
                      items={techStack.ai} 
                      color="bg-purple-500" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{`├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   └── lib/               # Utility functions
├── server/                    # Node.js Express server
│   ├── routes.ts              # API route proxying
│   └── storage.ts             # Storage interface
├── python_backend/            # Python Flask API
│   ├── app.py                 # Flask application
│   └── rag_service.py         # RAG & LangChain services
├── shared/                    # Shared TypeScript types
│   └── schema.ts              # Data models & Zod schemas
└── design_guidelines.md       # UI/UX design guidelines`}</pre>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="features">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Implemented Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {features.map((feature) => {
                      const Icon = feature.icon;
                      return (
                        <div 
                          key={feature.title} 
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{feature.title}</h4>
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-0 text-xs">
                                  {feature.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="api">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {apiEndpoints.map((endpoint, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                      >
                        <Badge 
                          variant="outline" 
                          className={`font-mono text-xs min-w-[60px] justify-center ${
                            endpoint.method === 'GET' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            endpoint.method === 'POST' ? 'bg-green-100 text-green-700 border-green-200' :
                            endpoint.method === 'PUT' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-purple-100 text-purple-700 border-purple-200'
                          }`}
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="font-mono text-sm flex-1">{endpoint.path}</code>
                        <span className="text-sm text-muted-foreground hidden md:block">{endpoint.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <code className="font-mono text-sm text-primary">OPENAI_API_KEY</code>
                      <span className="text-sm text-muted-foreground">OpenAI API key for AI features</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <code className="font-mono text-sm text-primary">DATABASE_URL</code>
                      <span className="text-sm text-muted-foreground">PostgreSQL connection string</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      <code className="font-mono text-sm text-primary">SESSION_SECRET</code>
                      <span className="text-sm text-muted-foreground">Secret for session encryption</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
