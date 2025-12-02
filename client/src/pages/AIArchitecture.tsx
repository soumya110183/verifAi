import { motion } from "framer-motion";
import { 
  SystemArchitectureDiagram,
  LangGraphWorkflowDiagram,
  RAGPipelineDiagram,
  LangChainComponentsDiagram,
  DataFlowDiagram
} from "@/components/diagrams/AIArchitectureDiagrams";
import { 
  Brain, 
  Workflow, 
  Sparkles, 
  Layers, 
  Zap,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIArchitecture() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" data-testid="text-page-title">
              <Brain className="w-8 h-8 text-primary" />
              AI Architecture & Technology
            </h1>
            <p className="text-muted-foreground mt-1">
              Visual documentation of VerifAI's AI-powered verification system
            </p>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8" data-testid="tabs-architecture">
            <TabsTrigger value="all" className="flex items-center gap-2" data-testid="tab-all">
              <Layers className="w-4 h-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2" data-testid="tab-system">
              <Layers className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="langgraph" className="flex items-center gap-2" data-testid="tab-langgraph">
              <Workflow className="w-4 h-4" />
              LangGraph
            </TabsTrigger>
            <TabsTrigger value="rag" className="flex items-center gap-2" data-testid="tab-rag">
              <Sparkles className="w-4 h-4" />
              RAG
            </TabsTrigger>
            <TabsTrigger value="langchain" className="flex items-center gap-2" data-testid="tab-langchain">
              <Brain className="w-4 h-4" />
              LangChain
            </TabsTrigger>
            <TabsTrigger value="flow" className="flex items-center gap-2" data-testid="tab-flow">
              <Zap className="w-4 h-4" />
              Data Flow
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <motion.div 
              className="grid gap-8 lg:grid-cols-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <SystemArchitectureDiagram />
              <LangGraphWorkflowDiagram />
              <RAGPipelineDiagram />
              <LangChainComponentsDiagram />
              <div className="lg:col-span-2">
                <DataFlowDiagram />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="system">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <SystemArchitectureDiagram />
              <div className="mt-6 bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">System Architecture Overview</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <span><strong>Client Browser:</strong> React SPA with TypeScript, Tailwind CSS, and Shadcn UI components</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <span><strong>Express Server:</strong> Handles authentication, file uploads, and proxies requests to Flask</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <span><strong>Flask API:</strong> Core business logic with RAG, LangGraph workflows, and OpenAI integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2" />
                    <span><strong>PostgreSQL:</strong> Persistent storage for verifications, chat history, and audit logs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mt-2" />
                    <span><strong>ChromaDB:</strong> Vector database for document embeddings and semantic search</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="langgraph">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <LangGraphWorkflowDiagram />
              <div className="mt-6 bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">LangGraph Verification Workflow</h3>
                <p className="text-muted-foreground mb-4">
                  LangGraph orchestrates a sophisticated multi-step verification pipeline that processes each document through:
                </p>
                <ol className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                    <span><strong>OCR Analysis:</strong> Evaluates extracted field quality and flags low-confidence extractions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                    <span><strong>Fraud Detection:</strong> Matches against embedded fraud pattern library using vector similarity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                    <span><strong>Similar Documents:</strong> Retrieves historically similar verifications for context</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</span>
                    <span><strong>Compliance Check:</strong> Validates required fields and document type acceptability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm font-bold">5</span>
                    <span><strong>Recommendation:</strong> Generates APPROVE / REJECT / MANUAL REVIEW decision</span>
                  </li>
                </ol>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="rag">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <RAGPipelineDiagram />
              <div className="mt-6 bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">RAG (Retrieval Augmented Generation)</h3>
                <p className="text-muted-foreground mb-4">
                  The RAG system enhances AI responses by retrieving relevant context from the knowledge base:
                </p>
                <div className="space-y-4">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-400 mb-2">Retrieval Phase</h4>
                    <p className="text-sm text-muted-foreground">
                      Embeds user query, searches ChromaDB for similar verifications and matching fraud patterns
                    </p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-2">Augmentation Phase</h4>
                    <p className="text-sm text-muted-foreground">
                      Combines current document data with retrieved similar cases and patterns
                    </p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-400 mb-2">Generation Phase</h4>
                    <p className="text-sm text-muted-foreground">
                      GPT-4o generates informed responses grounded in actual historical data
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="langchain">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <LangChainComponentsDiagram />
              <div className="mt-6 bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">LangChain Components</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">ChatOpenAI</h4>
                    <p className="text-sm text-muted-foreground">
                      GPT-4o model for document analysis, risk assessment, and conversational AI responses
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">OpenAIEmbeddings</h4>
                    <p className="text-sm text-muted-foreground">
                      text-embedding-3-small model creates 1536-dimensional vectors for semantic similarity
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">ChromaDB</h4>
                    <p className="text-sm text-muted-foreground">
                      Persistent vector store for document and fraud pattern embeddings with cosine similarity search
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">RAG Chain</h4>
                    <p className="text-sm text-muted-foreground">
                      Query → Retrieve → Augment → Generate pipeline for context-aware responses
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="flow">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <DataFlowDiagram />
              <div className="mt-6 bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Document Processing Flow</h3>
                <p className="text-muted-foreground mb-4">
                  When a document is uploaded, it goes through a comprehensive processing pipeline:
                </p>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { step: "1. Upload", desc: "Document received by Express, validated, forwarded to Flask" },
                    { step: "2. OCR", desc: "OpenAI Vision API extracts text fields with confidence scores" },
                    { step: "3. Risk Score", desc: "Algorithm calculates risk based on quality, confidence, patterns" },
                    { step: "4. Embed", desc: "Document converted to vector and stored in ChromaDB" },
                    { step: "5. Workflow", desc: "LangGraph runs multi-step verification analysis" },
                    { step: "6. Store", desc: "Final result saved to PostgreSQL with full audit trail" },
                  ].map((item) => (
                    <div key={item.step} className="bg-muted/50 rounded-lg p-3">
                      <div className="font-semibold text-sm">{item.step}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
