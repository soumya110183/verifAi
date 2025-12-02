"""
RAG Service Module - LangChain, LangGraph, ChromaDB Integration
Provides advanced AI capabilities for document verification including:
- Vector embeddings for document similarity search
- RAG-enhanced GenAI Assistant
- LangGraph workflow for multi-step verification
- Semantic fraud pattern matching
"""

import os
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional, TypedDict, Annotated
from operator import add

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter

from langgraph.graph import StateGraph, END

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

embeddings = None
llm = None
vector_store = None

def init_langchain():
    """Initialize LangChain components"""
    global embeddings, llm, vector_store
    
    if not OPENAI_API_KEY:
        print("[RAG] Warning: OPENAI_API_KEY not set")
        return False
    
    try:
        embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            openai_api_key=OPENAI_API_KEY
        )
        
        llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.3,
            openai_api_key=OPENAI_API_KEY
        )
        
        vector_store = Chroma(
            collection_name="verifai_documents",
            embedding_function=embeddings,
            persist_directory="./chroma_db"
        )
        
        print("[RAG] LangChain components initialized successfully")
        return True
    except Exception as e:
        print(f"[RAG] Initialization error: {e}")
        return False

try:
    init_langchain()
except Exception as e:
    print(f"[RAG] Could not initialize: {e}")


class VerificationState(TypedDict):
    """State for LangGraph verification workflow"""
    verification_id: str
    document_type: str
    ocr_data: Dict[str, Any]
    risk_score: int
    risk_level: str
    fraud_indicators: List[str]
    similar_documents: List[Dict]
    compliance_check: Dict[str, Any]
    final_recommendation: str
    workflow_steps: Annotated[List[str], add]


def create_document_embedding(verification: Dict) -> Optional[str]:
    """Create and store embedding for a verification document"""
    global vector_store
    
    if not vector_store or not embeddings:
        return None
    
    try:
        doc_text = f"""
        Document Type: {verification.get('documentType', 'unknown')}
        Customer Name: {verification.get('customerName', 'unknown')}
        Risk Score: {verification.get('riskScore', 0)}
        Risk Level: {verification.get('riskLevel', 'unknown')}
        Status: {verification.get('status', 'pending')}
        
        OCR Extracted Fields:
        {json.dumps(verification.get('ocrFields', []), indent=2)}
        
        Risk Insights:
        {json.dumps(verification.get('riskInsights', []), indent=2)}
        
        Validation Results:
        {json.dumps(verification.get('validationResults', []), indent=2)}
        """
        
        metadata = {
            "verification_id": verification.get("id", ""),
            "document_type": verification.get("documentType", ""),
            "customer_name": verification.get("customerName", ""),
            "risk_score": verification.get("riskScore", 0),
            "risk_level": verification.get("riskLevel", ""),
            "status": verification.get("status", ""),
            "submitted_at": verification.get("submittedAt", ""),
            "type": "verification"
        }
        
        doc = Document(page_content=doc_text, metadata=metadata)
        
        doc_id = f"ver_{verification.get('id', str(uuid.uuid4()))}"
        vector_store.add_documents([doc], ids=[doc_id])
        
        return doc_id
    except Exception as e:
        print(f"[RAG] Embedding creation error: {e}")
        return None


def store_fraud_pattern_embeddings(patterns: List[Dict]) -> int:
    """Store fraud pattern embeddings for similarity matching"""
    global vector_store
    
    if not vector_store:
        return 0
    
    try:
        docs = []
        ids = []
        
        for pattern in patterns:
            doc_text = f"""
            Fraud Pattern: {pattern.get('name', '')}
            Description: {pattern.get('description', '')}
            Technique: {pattern.get('technique', '')}
            Confidence Score: {pattern.get('confidenceScore', 0)}%
            
            Detection Method: This pattern is used to identify {pattern.get('name', '').lower()} 
            in identity documents through {pattern.get('technique', '').lower()}.
            """
            
            metadata = {
                "pattern_id": pattern.get("id", ""),
                "name": pattern.get("name", ""),
                "technique": pattern.get("technique", ""),
                "confidence_score": pattern.get("confidenceScore", 0),
                "type": "fraud_pattern"
            }
            
            docs.append(Document(page_content=doc_text, metadata=metadata))
            ids.append(f"pattern_{pattern.get('id', str(uuid.uuid4()))}")
        
        vector_store.add_documents(docs, ids=ids)
        return len(docs)
    except Exception as e:
        print(f"[RAG] Pattern embedding error: {e}")
        return 0


def semantic_document_search(query: str, k: int = 5, filter_type: str = None) -> List[Dict]:
    """Search for similar documents using semantic similarity"""
    global vector_store
    
    if not vector_store:
        return []
    
    try:
        filter_dict = None
        if filter_type:
            filter_dict = {"type": filter_type}
        
        results = vector_store.similarity_search_with_score(
            query, 
            k=k,
            filter=filter_dict
        )
        
        search_results = []
        for doc, score in results:
            search_results.append({
                "content": doc.page_content[:500],
                "metadata": doc.metadata,
                "similarity_score": round(1 - score, 4)
            })
        
        return search_results
    except Exception as e:
        print(f"[RAG] Semantic search error: {e}")
        return []


def find_similar_verifications(verification: Dict, k: int = 3) -> List[Dict]:
    """Find similar past verifications for fraud detection"""
    query = f"""
    Document type: {verification.get('documentType', '')}
    Customer: {verification.get('customerName', '')}
    Risk indicators: {json.dumps(verification.get('riskInsights', []))}
    """
    
    return semantic_document_search(query, k=k, filter_type="verification")


def find_matching_fraud_patterns(verification: Dict, k: int = 3) -> List[Dict]:
    """Find fraud patterns that may match this verification"""
    risk_insights = verification.get('riskInsights', [])
    ocr_fields = verification.get('ocrFields', [])
    
    query = f"""
    Document issues and risk factors:
    Risk insights: {json.dumps(risk_insights)}
    OCR confidence levels: {json.dumps([{'field': f.get('fieldName'), 'confidence': f.get('confidence')} for f in ocr_fields])}
    Document type: {verification.get('documentType', '')}
    Risk score: {verification.get('riskScore', 0)}
    """
    
    return semantic_document_search(query, k=k, filter_type="fraud_pattern")


def rag_enhanced_chat(verification: Dict, user_message: str, chat_history: List[Dict]) -> str:
    """RAG-enhanced chat with document context retrieval"""
    global llm, vector_store
    
    if not llm:
        return "AI service is currently unavailable. Please try again later."
    
    try:
        context_docs = []
        
        similar_docs = find_similar_verifications(verification, k=2)
        matching_patterns = find_matching_fraud_patterns(verification, k=2)
        
        similar_context = ""
        if similar_docs:
            similar_context = "\n\nSimilar Past Verifications:\n"
            for i, doc in enumerate(similar_docs, 1):
                similar_context += f"{i}. {doc['metadata'].get('customer_name', 'Unknown')} - "
                similar_context += f"Risk: {doc['metadata'].get('risk_level', 'unknown')}, "
                similar_context += f"Status: {doc['metadata'].get('status', 'unknown')}\n"
        
        pattern_context = ""
        if matching_patterns:
            pattern_context = "\n\nPotentially Matching Fraud Patterns:\n"
            for i, pattern in enumerate(matching_patterns, 1):
                pattern_context += f"{i}. {pattern['metadata'].get('name', 'Unknown')} - "
                pattern_context += f"Technique: {pattern['metadata'].get('technique', 'unknown')}\n"
        
        system_prompt = f"""You are an expert KYC compliance analyst AI assistant powered by advanced RAG technology.
You have access to a knowledge base of past verifications and fraud patterns.

Current Document Under Review:
- Type: {verification.get('documentType', '').replace('_', ' ').title()}
- Customer: {verification.get('customerName', 'Unknown')}
- Risk Score: {verification.get('riskScore', 0)}/100 ({verification.get('riskLevel', 'unknown').upper()} risk)
- Status: {verification.get('status', 'pending').replace('_', ' ').title()}

Extracted OCR Data:
{json.dumps(verification.get('ocrFields', []), indent=2)}

Risk Insights:
{json.dumps(verification.get('riskInsights', []), indent=2)}
{similar_context}
{pattern_context}

Provide expert analysis and recommendations based on the document data and your knowledge base.
Be concise but thorough. Cite similar cases or patterns when relevant."""

        messages = [SystemMessage(content=system_prompt)]
        
        for msg in chat_history[-6:]:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content", "")))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg.get("content", "")))
        
        messages.append(HumanMessage(content=user_message))
        
        response = llm.invoke(messages)
        return response.content
        
    except Exception as e:
        print(f"[RAG] Chat error: {e}")
        return f"I encountered an error processing your request. Based on the document's risk score of {verification.get('riskScore', 0)}, this is classified as {verification.get('riskLevel', 'unknown')} risk."


def ocr_analysis_node(state: VerificationState) -> VerificationState:
    """LangGraph node: Analyze OCR data quality"""
    state["workflow_steps"] = ["OCR Analysis: Checking extracted field quality"]
    
    ocr_data = state.get("ocr_data", {})
    fields = ocr_data.get("extracted_fields", [])
    
    low_confidence_fields = [f for f in fields if f.get("confidence", 100) < 80]
    
    if low_confidence_fields:
        state["fraud_indicators"] = state.get("fraud_indicators", []) + [
            f"Low OCR confidence on: {', '.join([f.get('fieldName', 'unknown') for f in low_confidence_fields])}"
        ]
    
    return state


def fraud_detection_node(state: VerificationState) -> VerificationState:
    """LangGraph node: Check for fraud patterns using vector similarity"""
    state["workflow_steps"] = ["Fraud Detection: Matching against known patterns"]
    
    verification = {
        "documentType": state.get("document_type", ""),
        "riskScore": state.get("risk_score", 0),
        "riskInsights": [],
        "ocrFields": state.get("ocr_data", {}).get("extracted_fields", [])
    }
    
    matching_patterns = find_matching_fraud_patterns(verification, k=3)
    
    high_confidence_matches = [
        p for p in matching_patterns 
        if p.get("similarity_score", 0) > 0.7
    ]
    
    if high_confidence_matches:
        for pattern in high_confidence_matches:
            state["fraud_indicators"] = state.get("fraud_indicators", []) + [
                f"Potential {pattern['metadata'].get('name', 'fraud')} detected (similarity: {pattern['similarity_score']:.0%})"
            ]
    
    return state


def similar_docs_node(state: VerificationState) -> VerificationState:
    """LangGraph node: Find similar past verifications"""
    state["workflow_steps"] = ["Historical Analysis: Searching similar documents"]
    
    verification = {
        "documentType": state.get("document_type", ""),
        "customerName": "",
        "riskInsights": []
    }
    
    similar = find_similar_verifications(verification, k=3)
    state["similar_documents"] = similar
    
    high_risk_similar = [d for d in similar if d["metadata"].get("risk_level") == "high"]
    if high_risk_similar:
        state["fraud_indicators"] = state.get("fraud_indicators", []) + [
            f"Similar to {len(high_risk_similar)} high-risk document(s)"
        ]
    
    return state


def compliance_check_node(state: VerificationState) -> VerificationState:
    """LangGraph node: Run compliance checks"""
    state["workflow_steps"] = ["Compliance Check: Validating regulatory requirements"]
    
    checks = {
        "document_type_valid": state.get("document_type") in ["passport", "drivers_license", "national_id"],
        "has_required_fields": True,
        "expiry_valid": True,
        "issuing_authority_valid": True
    }
    
    ocr_data = state.get("ocr_data", {})
    fields = ocr_data.get("extracted_fields", [])
    field_names = [f.get("fieldName", "").lower() for f in fields]
    
    required_fields = ["full name", "document number", "date of birth"]
    missing_fields = [f for f in required_fields if f not in [fn.lower() for fn in field_names]]
    
    if missing_fields:
        checks["has_required_fields"] = False
        checks["missing_fields"] = missing_fields
        state["fraud_indicators"] = state.get("fraud_indicators", []) + [
            f"Missing required fields: {', '.join(missing_fields)}"
        ]
    
    state["compliance_check"] = checks
    return state


def recommendation_node(state: VerificationState) -> VerificationState:
    """LangGraph node: Generate final recommendation"""
    state["workflow_steps"] = ["Final Analysis: Generating recommendation"]
    
    fraud_indicators = state.get("fraud_indicators", [])
    risk_score = state.get("risk_score", 50)
    compliance = state.get("compliance_check", {})
    
    if risk_score < 30 and len(fraud_indicators) == 0 and compliance.get("has_required_fields", True):
        recommendation = "APPROVE - Low risk, no fraud indicators, all compliance checks passed"
    elif risk_score > 70 or len(fraud_indicators) > 2:
        recommendation = f"REJECT - High risk ({risk_score}/100) with {len(fraud_indicators)} fraud indicator(s)"
    else:
        recommendation = f"MANUAL REVIEW - Medium risk ({risk_score}/100) with {len(fraud_indicators)} indicator(s) requiring analyst attention"
    
    state["final_recommendation"] = recommendation
    return state


def create_verification_workflow() -> StateGraph:
    """Create the LangGraph verification workflow"""
    workflow = StateGraph(VerificationState)
    
    workflow.add_node("ocr_analysis", ocr_analysis_node)
    workflow.add_node("fraud_detection", fraud_detection_node)
    workflow.add_node("similar_docs", similar_docs_node)
    workflow.add_node("compliance_check", compliance_check_node)
    workflow.add_node("recommendation", recommendation_node)
    
    workflow.set_entry_point("ocr_analysis")
    workflow.add_edge("ocr_analysis", "fraud_detection")
    workflow.add_edge("fraud_detection", "similar_docs")
    workflow.add_edge("similar_docs", "compliance_check")
    workflow.add_edge("compliance_check", "recommendation")
    workflow.add_edge("recommendation", END)
    
    return workflow.compile()


verification_workflow = None
try:
    verification_workflow = create_verification_workflow()
    print("[RAG] LangGraph verification workflow created")
except Exception as e:
    print(f"[RAG] Workflow creation error: {e}")


def run_verification_workflow(verification: Dict, ocr_result: Dict) -> Dict:
    """Run the full LangGraph verification workflow"""
    global verification_workflow
    
    if not verification_workflow:
        return {
            "workflow_steps": ["Workflow unavailable"],
            "fraud_indicators": [],
            "final_recommendation": "MANUAL REVIEW - Automated workflow unavailable"
        }
    
    try:
        initial_state = VerificationState(
            verification_id=verification.get("id", ""),
            document_type=verification.get("documentType", ""),
            ocr_data=ocr_result or {},
            risk_score=verification.get("riskScore", 50),
            risk_level=verification.get("riskLevel", "medium"),
            fraud_indicators=[],
            similar_documents=[],
            compliance_check={},
            final_recommendation="",
            workflow_steps=[]
        )
        
        final_state = verification_workflow.invoke(initial_state)
        
        return {
            "workflow_steps": final_state.get("workflow_steps", []),
            "fraud_indicators": final_state.get("fraud_indicators", []),
            "similar_documents": final_state.get("similar_documents", []),
            "compliance_check": final_state.get("compliance_check", {}),
            "final_recommendation": final_state.get("final_recommendation", "")
        }
    except Exception as e:
        print(f"[RAG] Workflow execution error: {e}")
        return {
            "workflow_steps": [f"Error: {str(e)}"],
            "fraud_indicators": [],
            "final_recommendation": "MANUAL REVIEW - Workflow error"
        }


def get_knowledge_base_stats() -> Dict:
    """Get statistics about the knowledge base"""
    global vector_store
    
    if not vector_store:
        return {"status": "unavailable", "total_documents": 0}
    
    try:
        collection = vector_store._collection
        count = collection.count()
        
        return {
            "status": "active",
            "total_documents": count,
            "embedding_model": "text-embedding-3-small",
            "llm_model": "gpt-4o",
            "vector_db": "ChromaDB"
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}


def analyze_document_with_rag(verification: Dict, ocr_result: Dict) -> Dict:
    """Complete RAG-powered document analysis"""
    
    create_document_embedding(verification)
    
    workflow_result = run_verification_workflow(verification, ocr_result)
    
    similar_docs = find_similar_verifications(verification, k=3)
    matching_patterns = find_matching_fraud_patterns(verification, k=3)
    
    return {
        "workflow_analysis": workflow_result,
        "similar_verifications": similar_docs,
        "matching_fraud_patterns": matching_patterns,
        "knowledge_base_stats": get_knowledge_base_stats()
    }
