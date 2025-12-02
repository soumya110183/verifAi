import { motion } from "framer-motion";
import { 
  Brain, 
  Database, 
  Search, 
  FileCheck, 
  Shield, 
  Workflow,
  MessageSquare,
  Eye,
  Layers,
  ArrowRight,
  ArrowDown,
  Zap,
  Server,
  Globe,
  HardDrive,
  Bot,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function SystemArchitectureDiagram() {
  return (
    <motion.div 
      className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Layers className="w-6 h-6 text-blue-400" />
        System Architecture
      </h3>
      
      <div className="space-y-4">
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-4 text-center shadow-lg"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe className="w-5 h-5" />
            <span className="font-semibold">Client Browser</span>
          </div>
          <span className="text-blue-200 text-sm">React SPA @ :5000</span>
        </motion.div>

        <motion.div className="flex justify-center" variants={fadeInUp}>
          <ArrowDown className="w-6 h-6 text-gray-400" />
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg p-4 shadow-lg"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Server className="w-5 h-5" />
            <span className="font-semibold">Express Server (:5000)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-700/50 rounded p-2 text-center text-sm">
              <div className="font-medium">Vite Dev</div>
              <div className="text-green-200 text-xs">Server</div>
            </div>
            <div className="bg-green-700/50 rounded p-2 text-center text-sm">
              <div className="font-medium">Session</div>
              <div className="text-green-200 text-xs">Auth</div>
            </div>
            <div className="bg-green-700/50 rounded p-2 text-center text-sm">
              <div className="font-medium">API Proxy</div>
              <div className="text-green-200 text-xs">to Flask</div>
            </div>
          </div>
        </motion.div>

        <motion.div className="flex justify-center" variants={fadeInUp}>
          <ArrowDown className="w-6 h-6 text-gray-400" />
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-purple-600 to-violet-500 rounded-lg p-4 shadow-lg"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Brain className="w-5 h-5" />
            <span className="font-semibold">Flask API Server (:5001)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-purple-700/50 rounded p-2 text-center text-sm">
              <div className="font-medium">Verification</div>
              <div className="text-purple-200 text-xs">Service</div>
            </div>
            <div className="bg-purple-700/50 rounded p-2 text-center text-sm">
              <div className="font-medium">OpenAI</div>
              <div className="text-purple-200 text-xs">Integration</div>
            </div>
            <div className="bg-purple-700/50 rounded p-2 text-center text-sm">
              <div className="font-medium">Risk</div>
              <div className="text-purple-200 text-xs">Engine</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-violet-700/50 rounded p-2 text-center text-sm">
              <Sparkles className="w-4 h-4 mx-auto mb-1" />
              <div className="font-medium">RAG Service</div>
              <div className="text-violet-200 text-xs">LangChain</div>
            </div>
            <div className="bg-violet-700/50 rounded p-2 text-center text-sm">
              <Workflow className="w-4 h-4 mx-auto mb-1" />
              <div className="font-medium">LangGraph</div>
              <div className="text-violet-200 text-xs">Workflow</div>
            </div>
            <div className="bg-violet-700/50 rounded p-2 text-center text-sm">
              <MessageSquare className="w-4 h-4 mx-auto mb-1" />
              <div className="font-medium">Chat</div>
              <div className="text-violet-200 text-xs">Service</div>
            </div>
          </div>
        </motion.div>

        <motion.div className="flex justify-center" variants={fadeInUp}>
          <ArrowDown className="w-6 h-6 text-gray-400" />
        </motion.div>

        <motion.div className="grid grid-cols-2 gap-4" variants={fadeInUp}>
          <div className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Database className="w-5 h-5" />
              <span className="font-semibold">PostgreSQL</span>
            </div>
            <div className="space-y-1 text-sm text-amber-100">
              <div className="bg-amber-700/50 rounded px-2 py-1 text-center">verifications</div>
              <div className="bg-amber-700/50 rounded px-2 py-1 text-center">chat_messages</div>
              <div className="bg-amber-700/50 rounded px-2 py-1 text-center">audit_logs</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-pink-600 to-rose-500 rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <HardDrive className="w-5 h-5" />
              <span className="font-semibold">ChromaDB</span>
            </div>
            <div className="space-y-1 text-sm text-pink-100">
              <div className="bg-pink-700/50 rounded px-2 py-1 text-center">Document Vectors</div>
              <div className="bg-pink-700/50 rounded px-2 py-1 text-center">Pattern Vectors</div>
              <div className="bg-pink-700/50 rounded px-2 py-1 text-center">Embeddings</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function LangGraphWorkflowDiagram() {
  const nodes = [
    { id: 1, name: "OCR Analysis", icon: Eye, color: "from-cyan-500 to-blue-500", desc: "Check field quality" },
    { id: 2, name: "Fraud Detection", icon: Shield, color: "from-red-500 to-pink-500", desc: "Pattern matching" },
    { id: 3, name: "Similar Docs", icon: Search, color: "from-purple-500 to-indigo-500", desc: "Vector search" },
    { id: 4, name: "Compliance", icon: FileCheck, color: "from-green-500 to-emerald-500", desc: "Validate rules" },
    { id: 5, name: "Recommendation", icon: CheckCircle, color: "from-amber-500 to-orange-500", desc: "Final decision" },
  ];

  return (
    <motion.div 
      className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Workflow className="w-6 h-6 text-purple-400" />
        LangGraph Verification Workflow
      </h3>

      <div className="flex flex-col items-center space-y-3">
        {nodes.map((node, index) => (
          <motion.div key={node.id} variants={fadeInUp} className="w-full max-w-xs">
            <div className={`bg-gradient-to-r ${node.color} rounded-lg p-4 shadow-lg`}>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2">
                  <node.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">{node.name}</div>
                  <div className="text-sm opacity-80">{node.desc}</div>
                </div>
              </div>
            </div>
            {index < nodes.length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-6 bg-slate-700/50 rounded-lg p-4"
        variants={fadeInUp}
      >
        <div className="text-center text-sm text-gray-300">
          <div className="font-semibold mb-2">Verification State (Accumulated)</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-600/50 rounded p-2">verification_id</div>
            <div className="bg-slate-600/50 rounded p-2">fraud_indicators[]</div>
            <div className="bg-slate-600/50 rounded p-2">similar_documents[]</div>
            <div className="bg-slate-600/50 rounded p-2">final_recommendation</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function RAGPipelineDiagram() {
  return (
    <motion.div 
      className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-6 h-6 text-yellow-400" />
        RAG Pipeline (Retrieval Augmented Generation)
      </h3>

      <div className="space-y-4">
        <motion.div 
          className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-4"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" />
            <span className="font-semibold">User Query</span>
          </div>
          <div className="bg-blue-700/50 rounded p-2 text-sm italic">
            "What are the risk factors for this document?"
          </div>
        </motion.div>

        <motion.div className="flex justify-center" variants={fadeInUp}>
          <ArrowDown className="w-6 h-6 text-gray-400" />
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg p-4"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5" />
            <span className="font-semibold">1. Retrieval Phase</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 bg-purple-700/50 rounded p-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Embed query with text-embedding-3-small</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-700/50 rounded p-2">
              <Database className="w-4 h-4 text-pink-300" />
              <span>Search ChromaDB for similar verifications</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-700/50 rounded p-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span>Find matching fraud patterns</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="flex justify-center" variants={fadeInUp}>
          <ArrowDown className="w-6 h-6 text-gray-400" />
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-lg p-4"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-5 h-5" />
            <span className="font-semibold">2. Augmentation Phase</span>
          </div>
          <div className="bg-green-700/50 rounded p-3 text-sm space-y-1">
            <div className="text-green-200">Context = Current Document +</div>
            <div className="pl-4">+ Similar Past Verifications</div>
            <div className="pl-4">+ Matching Fraud Patterns</div>
            <div className="pl-4">+ Chat History</div>
          </div>
        </motion.div>

        <motion.div className="flex justify-center" variants={fadeInUp}>
          <ArrowDown className="w-6 h-6 text-gray-400" />
        </motion.div>

        <motion.div 
          className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-lg p-4"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5" />
            <span className="font-semibold">3. Generation Phase</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4" />
            <span className="text-sm">GPT-4o generates informed response</span>
          </div>
          <div className="bg-amber-700/50 rounded p-2 text-sm italic">
            "Based on the analysis and 2 similar past cases, the main risk factors are: 1) Low OCR confidence on DOB field (72%)..."
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function LangChainComponentsDiagram() {
  const components = [
    { name: "ChatOpenAI", desc: "GPT-4o LLM", icon: Brain, color: "from-blue-500 to-indigo-500" },
    { name: "OpenAIEmbeddings", desc: "text-embedding-3-small", icon: Zap, color: "from-purple-500 to-pink-500" },
    { name: "ChromaDB", desc: "Vector Store", icon: Database, color: "from-green-500 to-emerald-500" },
    { name: "RAG Chain", desc: "Query → Retrieve → Generate", icon: Sparkles, color: "from-amber-500 to-orange-500" },
  ];

  return (
    <motion.div 
      className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Brain className="w-6 h-6 text-blue-400" />
        LangChain Components
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {components.map((comp) => (
          <motion.div
            key={comp.name}
            className={`bg-gradient-to-r ${comp.color} rounded-lg p-4 shadow-lg`}
            variants={fadeInUp}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 rounded-full p-2">
                <comp.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold">{comp.name}</span>
            </div>
            <div className="text-sm opacity-80 pl-11">{comp.desc}</div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-4"
        variants={fadeInUp}
      >
        <div className="text-center">
          <div className="font-semibold mb-2">Capabilities</div>
          <div className="flex flex-wrap justify-center gap-2">
            {["RAG Chat", "Semantic Search", "Fraud Matching", "Workflow Analysis"].map((cap) => (
              <span key={cap} className="bg-white/20 rounded-full px-3 py-1 text-sm">
                {cap}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function DataFlowDiagram() {
  const steps = [
    { step: 1, title: "Upload", desc: "Document uploaded", icon: FileText, color: "bg-blue-500" },
    { step: 2, title: "OCR", desc: "Vision API extraction", icon: Eye, color: "bg-purple-500" },
    { step: 3, title: "Risk Score", desc: "Calculate risk level", icon: AlertTriangle, color: "bg-amber-500" },
    { step: 4, title: "Embed", desc: "Store in ChromaDB", icon: Database, color: "bg-pink-500" },
    { step: 5, title: "Workflow", desc: "LangGraph analysis", icon: Workflow, color: "bg-green-500" },
    { step: 6, title: "Store", desc: "Save to PostgreSQL", icon: HardDrive, color: "bg-orange-500" },
  ];

  return (
    <motion.div 
      className="p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <h3 className="text-xl font-bold mb-6 text-center flex items-center justify-center gap-2">
        <Zap className="w-6 h-6 text-yellow-400" />
        Document Processing Flow
      </h3>

      <div className="flex flex-wrap justify-center gap-2">
        {steps.map((step, index) => (
          <motion.div key={step.step} variants={fadeInUp} className="flex items-center">
            <div className={`${step.color} rounded-lg p-3 text-center min-w-[100px]`}>
              <step.icon className="w-6 h-6 mx-auto mb-1" />
              <div className="font-semibold text-sm">{step.title}</div>
              <div className="text-xs opacity-80">{step.desc}</div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-gray-400 mx-1 flex-shrink-0" />
            )}
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="mt-6 grid grid-cols-2 gap-4"
        variants={fadeInUp}
      >
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">GPT-4o</div>
          <div className="text-sm text-gray-400">LLM Model</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-pink-400">1536</div>
          <div className="text-sm text-gray-400">Embedding Dimensions</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AllDiagrams() {
  return (
    <div className="space-y-8 p-6">
      <SystemArchitectureDiagram />
      <LangGraphWorkflowDiagram />
      <RAGPipelineDiagram />
      <LangChainComponentsDiagram />
      <DataFlowDiagram />
    </div>
  );
}
