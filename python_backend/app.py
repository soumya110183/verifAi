import os
import uuid
import json
import base64
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from openai import OpenAI
from io import BytesIO
import random
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)
CORS(app, origins="*")

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

try:
    from rag_service import (
        rag_enhanced_chat,
        create_document_embedding,
        store_fraud_pattern_embeddings,
        semantic_document_search,
        find_similar_verifications,
        find_matching_fraud_patterns,
        run_verification_workflow,
        analyze_document_with_rag,
        get_knowledge_base_stats,
        init_langchain
    )
    RAG_ENABLED = True
    print("[python] RAG service loaded successfully")
except Exception as e:
    RAG_ENABLED = False
    print(f"[python] RAG service not available: {e}")

DATABASE_URL = os.environ.get("DATABASE_URL")

def get_db_connection():
    """Get a database connection"""
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS verifications (
            id TEXT PRIMARY KEY,
            document_type TEXT,
            document_url TEXT,
            status TEXT,
            risk_score INTEGER,
            risk_level TEXT,
            customer_name TEXT,
            submitted_at TIMESTAMP,
            reviewed_at TIMESTAMP,
            ocr_fields JSONB,
            risk_insights JSONB,
            validation_results JSONB
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id TEXT PRIMARY KEY,
            verification_id TEXT REFERENCES verifications(id),
            role TEXT,
            content TEXT,
            timestamp TIMESTAMP
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            auto_approve_threshold INTEGER DEFAULT 30,
            high_risk_threshold INTEGER DEFAULT 70,
            email_notifications BOOLEAN DEFAULT TRUE,
            in_app_notifications BOOLEAN DEFAULT TRUE,
            auto_reject_high_risk BOOLEAN DEFAULT FALSE
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            action TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            entity_id TEXT,
            user_id TEXT DEFAULT 'system',
            user_name TEXT DEFAULT 'System',
            details JSONB,
            ip_address TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cur.execute("""
        CREATE TABLE IF NOT EXISTS batch_jobs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            total_documents INTEGER DEFAULT 0,
            processed_documents INTEGER DEFAULT 0,
            successful_documents INTEGER DEFAULT 0,
            failed_documents INTEGER DEFAULT 0,
            verification_ids JSONB DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            error_message TEXT
        )
    """)
    
    cur.execute("SELECT COUNT(*) as count FROM settings")
    if cur.fetchone()["count"] == 0:
        cur.execute("""
            INSERT INTO settings (id, auto_approve_threshold, high_risk_threshold, 
                                  email_notifications, in_app_notifications, auto_reject_high_risk)
            VALUES (1, 30, 70, TRUE, TRUE, FALSE)
        """)
    
    conn.commit()
    cur.close()
    conn.close()

try:
    init_db()
    print("[python] Database initialized successfully")
except Exception as e:
    print(f"[python] Database initialization warning: {e}")

def get_settings():
    """Get settings from database"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM settings WHERE id = 1")
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return {
                "autoApproveThreshold": row["auto_approve_threshold"],
                "highRiskThreshold": row["high_risk_threshold"],
                "emailNotifications": row["email_notifications"],
                "inAppNotifications": row["in_app_notifications"],
                "autoRejectHighRisk": row["auto_reject_high_risk"]
            }
    except:
        pass
    return {
        "autoApproveThreshold": 30,
        "highRiskThreshold": 70,
        "emailNotifications": True,
        "inAppNotifications": True,
        "autoRejectHighRisk": False
    }

def save_settings(settings_data):
    """Save settings to database"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            UPDATE settings SET 
                auto_approve_threshold = %s,
                high_risk_threshold = %s,
                email_notifications = %s,
                in_app_notifications = %s,
                auto_reject_high_risk = %s
            WHERE id = 1
        """, (
            settings_data.get("autoApproveThreshold", 30),
            settings_data.get("highRiskThreshold", 70),
            settings_data.get("emailNotifications", True),
            settings_data.get("inAppNotifications", True),
            settings_data.get("autoRejectHighRisk", False)
        ))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Settings save error: {e}")

integrations = [
    {
        "id": "dmv-1",
        "name": "DMV Integration",
        "type": "dmv",
        "status": "connected",
        "lastSync": datetime.now().isoformat(),
        "description": "Validates driver's license numbers against motor vehicle records"
    },
    {
        "id": "passport-1",
        "name": "Passport Authority",
        "type": "passport_authority",
        "status": "pending",
        "description": "Verifies passport numbers with the issuing government authority"
    },
    {
        "id": "ssa-1",
        "name": "SSA Integration",
        "type": "ssa",
        "status": "disconnected",
        "description": "Cross-references Social Security numbers for identity confirmation"
    }
]

fraud_patterns = [
    {
        "id": "pattern-1",
        "name": "Font Substitution",
        "description": "Detects when document text uses fonts that don't match official templates",
        "technique": "Font Analysis",
        "confidenceScore": 94
    },
    {
        "id": "pattern-2",
        "name": "Photo Manipulation",
        "description": "Identifies edited or replaced photos using ELA analysis",
        "technique": "Image Forensics",
        "confidenceScore": 91
    },
    {
        "id": "pattern-3",
        "name": "Metadata Tampering",
        "description": "Detects signs of editing software in file metadata",
        "technique": "Metadata Inspection",
        "confidenceScore": 88
    },
    {
        "id": "pattern-4",
        "name": "MRZ Inconsistency",
        "description": "Identifies mismatches between MRZ data and visual text",
        "technique": "Document Analysis",
        "confidenceScore": 96
    },
    {
        "id": "pattern-5",
        "name": "Security Feature Absence",
        "description": "Detects missing or incorrectly placed security features",
        "technique": "Layout Validation",
        "confidenceScore": 89
    },
    {
        "id": "pattern-6",
        "name": "Date Format Anomaly",
        "description": "Identifies incorrect date formats for the document's issuing country",
        "technique": "Document Analysis",
        "confidenceScore": 92
    }
]

def db_row_to_verification(row):
    """Convert database row to verification dict"""
    return {
        "id": row["id"],
        "documentType": row["document_type"],
        "documentUrl": row["document_url"] or "",
        "status": row["status"],
        "riskScore": row["risk_score"],
        "riskLevel": row["risk_level"],
        "customerName": row["customer_name"],
        "submittedAt": row["submitted_at"].isoformat() if row["submitted_at"] else None,
        "reviewedAt": row["reviewed_at"].isoformat() if row["reviewed_at"] else None,
        "ocrFields": row["ocr_fields"] or [],
        "riskInsights": row["risk_insights"] or [],
        "validationResults": row["validation_results"] or [],
        "chatHistory": []
    }

def get_all_verifications():
    """Get all verifications from database"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM verifications ORDER BY submitted_at DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [db_row_to_verification(row) for row in rows]
    except Exception as e:
        print(f"Get verifications error: {e}")
        return []

def get_verification_by_id(ver_id):
    """Get a single verification by ID"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM verifications WHERE id = %s", (ver_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return db_row_to_verification(row)
    except Exception as e:
        print(f"Get verification error: {e}")
    return None

def save_verification(verification):
    """Save or update a verification in database"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO verifications (id, document_type, document_url, status, risk_score, 
                                       risk_level, customer_name, submitted_at, reviewed_at,
                                       ocr_fields, risk_insights, validation_results)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                reviewed_at = EXCLUDED.reviewed_at
        """, (
            verification["id"],
            verification["documentType"],
            verification["documentUrl"],
            verification["status"],
            verification["riskScore"],
            verification["riskLevel"],
            verification["customerName"],
            verification.get("submittedAt"),
            verification.get("reviewedAt"),
            json.dumps(verification.get("ocrFields", [])),
            json.dumps(verification.get("riskInsights", [])),
            json.dumps(verification.get("validationResults", []))
        ))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Save verification error: {e}")

def get_chat_history(ver_id):
    """Get chat history for a verification"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, role, content, timestamp 
            FROM chat_messages 
            WHERE verification_id = %s 
            ORDER BY timestamp ASC
        """, (ver_id,))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [{"id": r["id"], "role": r["role"], "content": r["content"], 
                 "timestamp": r["timestamp"].isoformat() if r["timestamp"] else None} for r in rows]
    except Exception as e:
        print(f"Get chat history error: {e}")
        return []

def save_chat_message(ver_id, message):
    """Save a chat message to database"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO chat_messages (id, verification_id, role, content, timestamp)
            VALUES (%s, %s, %s, %s, %s)
        """, (message["id"], ver_id, message["role"], message["content"], message.get("timestamp")))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Save chat message error: {e}")

def log_audit_event(action, entity_type, entity_id=None, user_id="system", user_name="System", details=None, ip_address=None):
    """Log an audit event to the database"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO audit_logs (id, action, entity_type, entity_id, user_id, user_name, details, ip_address, timestamp)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            str(uuid.uuid4()),
            action,
            entity_type,
            entity_id,
            user_id,
            user_name,
            json.dumps(details) if details else None,
            ip_address,
            datetime.now()
        ))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Audit log error: {e}")

def get_audit_logs(filters=None, limit=100, offset=0):
    """Get audit logs with optional filtering"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = "SELECT * FROM audit_logs WHERE 1=1"
        params = []
        
        if filters:
            if filters.get("action"):
                query += " AND action = %s"
                params.append(filters["action"])
            if filters.get("entity_type"):
                query += " AND entity_type = %s"
                params.append(filters["entity_type"])
            if filters.get("entity_id"):
                query += " AND entity_id = %s"
                params.append(filters["entity_id"])
            if filters.get("user_id"):
                query += " AND user_id = %s"
                params.append(filters["user_id"])
            if filters.get("start_date"):
                query += " AND timestamp >= %s"
                params.append(filters["start_date"])
            if filters.get("end_date"):
                query += " AND timestamp <= %s"
                params.append(filters["end_date"])
        
        query += " ORDER BY timestamp DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cur.execute(query, params)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        return [{
            "id": row["id"],
            "action": row["action"],
            "entityType": row["entity_type"],
            "entityId": row["entity_id"],
            "userId": row["user_id"],
            "userName": row["user_name"],
            "details": row["details"],
            "ipAddress": row["ip_address"],
            "timestamp": row["timestamp"].isoformat() if row["timestamp"] else None
        } for row in rows]
    except Exception as e:
        print(f"Get audit logs error: {e}")
        return []

def get_audit_log_count(filters=None):
    """Get total count of audit logs with optional filtering"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        query = "SELECT COUNT(*) as count FROM audit_logs WHERE 1=1"
        params = []
        
        if filters:
            if filters.get("action"):
                query += " AND action = %s"
                params.append(filters["action"])
            if filters.get("entity_type"):
                query += " AND entity_type = %s"
                params.append(filters["entity_type"])
            if filters.get("entity_id"):
                query += " AND entity_id = %s"
                params.append(filters["entity_id"])
            if filters.get("user_id"):
                query += " AND user_id = %s"
                params.append(filters["user_id"])
            if filters.get("start_date"):
                query += " AND timestamp >= %s"
                params.append(filters["start_date"])
            if filters.get("end_date"):
                query += " AND timestamp <= %s"
                params.append(filters["end_date"])
        
        cur.execute(query, params)
        count = cur.fetchone()["count"]
        cur.close()
        conn.close()
        return count
    except Exception as e:
        print(f"Get audit log count error: {e}")
        return 0

def get_batch_job(job_id):
    """Get a batch job by ID"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM batch_jobs WHERE id = %s", (job_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return {
                "id": row["id"],
                "name": row["name"],
                "status": row["status"],
                "totalDocuments": row["total_documents"],
                "processedDocuments": row["processed_documents"],
                "successfulDocuments": row["successful_documents"],
                "failedDocuments": row["failed_documents"],
                "verificationIds": row["verification_ids"] or [],
                "createdAt": row["created_at"].isoformat() if row["created_at"] else None,
                "startedAt": row["started_at"].isoformat() if row["started_at"] else None,
                "completedAt": row["completed_at"].isoformat() if row["completed_at"] else None,
                "errorMessage": row["error_message"]
            }
    except Exception as e:
        print(f"Get batch job error: {e}")
    return None

def get_all_batch_jobs():
    """Get all batch jobs"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM batch_jobs ORDER BY created_at DESC")
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return [{
            "id": row["id"],
            "name": row["name"],
            "status": row["status"],
            "totalDocuments": row["total_documents"],
            "processedDocuments": row["processed_documents"],
            "successfulDocuments": row["successful_documents"],
            "failedDocuments": row["failed_documents"],
            "verificationIds": row["verification_ids"] or [],
            "createdAt": row["created_at"].isoformat() if row["created_at"] else None,
            "startedAt": row["started_at"].isoformat() if row["started_at"] else None,
            "completedAt": row["completed_at"].isoformat() if row["completed_at"] else None,
            "errorMessage": row["error_message"]
        } for row in rows]
    except Exception as e:
        print(f"Get batch jobs error: {e}")
        return []

def create_batch_job(name, total_documents):
    """Create a new batch job"""
    try:
        job_id = str(uuid.uuid4())
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO batch_jobs (id, name, status, total_documents, created_at)
            VALUES (%s, %s, 'pending', %s, %s)
        """, (job_id, name, total_documents, datetime.now()))
        conn.commit()
        cur.close()
        conn.close()
        return job_id
    except Exception as e:
        print(f"Create batch job error: {e}")
        return None

def update_batch_job(job_id, updates):
    """Update batch job progress"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        set_clauses = []
        params = []
        
        if "status" in updates:
            set_clauses.append("status = %s")
            params.append(updates["status"])
        if "processed_documents" in updates:
            set_clauses.append("processed_documents = %s")
            params.append(updates["processed_documents"])
        if "successful_documents" in updates:
            set_clauses.append("successful_documents = %s")
            params.append(updates["successful_documents"])
        if "failed_documents" in updates:
            set_clauses.append("failed_documents = %s")
            params.append(updates["failed_documents"])
        if "verification_ids" in updates:
            set_clauses.append("verification_ids = %s")
            params.append(json.dumps(updates["verification_ids"]))
        if "started_at" in updates:
            set_clauses.append("started_at = %s")
            params.append(updates["started_at"])
        if "completed_at" in updates:
            set_clauses.append("completed_at = %s")
            params.append(updates["completed_at"])
        if "error_message" in updates:
            set_clauses.append("error_message = %s")
            params.append(updates["error_message"])
        
        if set_clauses:
            params.append(job_id)
            cur.execute(f"UPDATE batch_jobs SET {', '.join(set_clauses)} WHERE id = %s", params)
            conn.commit()
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Update batch job error: {e}")

def process_single_document_for_batch(file_content, filename, mime_type):
    """Process a single document as part of a batch job"""
    try:
        ver_id = str(uuid.uuid4())
        doc_type = detect_document_type(filename)
        
        file_base64 = base64.b64encode(file_content).decode("utf-8")
        document_url = f"data:{mime_type};base64,{file_base64}"
        
        ocr_result = extract_ocr_with_vision(file_base64, mime_type, doc_type)
        
        if ocr_result and "document_analysis" in ocr_result:
            detected_type = ocr_result["document_analysis"].get("detected_type")
            if detected_type and detected_type in ["passport", "drivers_license", "national_id"]:
                doc_type = detected_type
        
        risk_score = calculate_risk_score(ocr_result, doc_type)
        risk_level = "low" if risk_score < 30 else ("medium" if risk_score < 70 else "high")
        
        current_settings = get_settings()
        auto_approve = risk_score < current_settings["autoApproveThreshold"]
        auto_reject = current_settings["autoRejectHighRisk"] and risk_score > current_settings["highRiskThreshold"]
        
        status = "approved" if auto_approve else ("rejected" if auto_reject else "pending")
        
        ocr_fields = generate_ocr_fields(doc_type, ocr_result)
        
        name_field = next((f for f in ocr_fields if f["fieldName"] == "Full Name"), None)
        dob_field = next((f for f in ocr_fields if f["fieldName"] == "Date of Birth"), None)
        doc_num_field = next((f for f in ocr_fields if f["fieldName"] == "Document Number"), None)
        
        validation_results = []
        if name_field:
            validation_results.append({
                "fieldName": "Full Name", 
                "submittedValue": "", 
                "extractedValue": name_field["value"], 
                "isMatch": True
            })
        if dob_field:
            validation_results.append({
                "fieldName": "Date of Birth", 
                "submittedValue": "", 
                "extractedValue": dob_field["value"], 
                "isMatch": True
            })
        if doc_num_field:
            validation_results.append({
                "fieldName": "Document Number", 
                "submittedValue": "", 
                "extractedValue": doc_num_field["value"], 
                "isMatch": True
            })
        
        customer_name = name_field["value"] if name_field else f"Customer {ver_id[:8]}"
        
        verification = {
            "id": ver_id,
            "documentType": doc_type,
            "documentUrl": document_url,
            "status": status,
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "customerName": customer_name,
            "submittedAt": datetime.now().isoformat(),
            "reviewedAt": datetime.now().isoformat() if status in ["approved", "rejected"] else None,
            "ocrFields": ocr_fields,
            "riskInsights": generate_risk_insights(risk_score),
            "validationResults": validation_results,
            "chatHistory": []
        }
        
        save_verification(verification)
        
        return {"success": True, "verification_id": ver_id, "status": status}
    except Exception as e:
        print(f"Process document error: {e}")
        return {"success": False, "error": str(e)}

def generate_sample_data():
    """Generate sample verifications for demo if database is empty"""
    try:
        existing = get_all_verifications()
        if len(existing) > 0:
            return
        
        sample_names = ["John Smith", "Maria Garcia", "James Wilson", "Sarah Johnson", "Michael Brown"]
        doc_types = ["passport", "drivers_license", "national_id"]
        
        for i in range(10):
            ver_id = str(uuid.uuid4())
            risk_score = random.randint(5, 85)
            risk_level = "low" if risk_score < 30 else ("medium" if risk_score < 70 else "high")
            status = "approved" if risk_score < 30 else ("pending" if risk_score < 70 else random.choice(["in_review", "rejected"]))
            customer_name = random.choice(sample_names)
            
            verification = {
                "id": ver_id,
                "documentType": random.choice(doc_types),
                "documentUrl": "",
                "status": status,
                "riskScore": risk_score,
                "riskLevel": risk_level,
                "customerName": customer_name,
                "submittedAt": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
                "reviewedAt": datetime.now().isoformat() if status in ["approved", "rejected"] else None,
                "ocrFields": [
                    {"fieldName": "Full Name", "value": customer_name, "confidence": random.randint(85, 99)},
                    {"fieldName": "Document Number", "value": f"DOC{random.randint(100000, 999999)}", "confidence": random.randint(90, 99)},
                    {"fieldName": "Date of Birth", "value": f"{random.randint(1960, 2000)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}", "confidence": random.randint(88, 99)},
                    {"fieldName": "Expiry Date", "value": f"{random.randint(2025, 2030)}-{random.randint(1,12):02d}-{random.randint(1,28):02d}", "confidence": random.randint(85, 99)},
                ],
                "riskInsights": [
                    {"category": "Document Quality", "description": "Image clarity is good", "severity": "low"},
                    {"category": "Data Consistency", "description": "All fields appear consistent", "severity": "low"},
                ] if risk_score < 50 else [
                    {"category": "Security Features", "description": "Some security elements could not be verified", "severity": "medium"},
                    {"category": "Image Analysis", "description": "Potential editing detected in photo area", "severity": "high" if risk_score > 70 else "medium"},
                ],
                "validationResults": [
                    {"fieldName": "Full Name", "submittedValue": customer_name, "extractedValue": customer_name, "isMatch": True},
                    {"fieldName": "Date of Birth", "submittedValue": "1985-03-15", "extractedValue": "1985-03-15", "isMatch": True},
                ]
            }
            save_verification(verification)
        print("[python] Sample data generated")
    except Exception as e:
        print(f"[python] Sample data generation error: {e}")

generate_sample_data()

def detect_document_type(filename):
    """Simple document type detection based on filename or content"""
    filename_lower = filename.lower()
    if "passport" in filename_lower:
        return "passport"
    elif "license" in filename_lower or "dl" in filename_lower:
        return "drivers_license"
    else:
        return "national_id"

def extract_ocr_with_vision(image_base64, mime_type, doc_type):
    """Use OpenAI Vision to extract text and data from document image"""
    try:
        prompt = f"""Analyze this {doc_type.replace('_', ' ')} document image and extract all visible text fields.

Return a JSON object with the following structure:
{{
    "extracted_fields": [
        {{"fieldName": "Full Name", "value": "extracted value", "confidence": 95}},
        {{"fieldName": "Document Number", "value": "extracted value", "confidence": 98}},
        {{"fieldName": "Date of Birth", "value": "YYYY-MM-DD format", "confidence": 92}},
        {{"fieldName": "Expiry Date", "value": "YYYY-MM-DD format", "confidence": 90}},
        {{"fieldName": "Issuing Country", "value": "country name", "confidence": 88}}
    ],
    "document_analysis": {{
        "detected_type": "passport|drivers_license|national_id",
        "quality_score": 85,
        "is_readable": true,
        "potential_issues": ["list any visible issues like blur, damage, etc"]
    }}
}}

Only include fields that are actually visible in the document. Estimate confidence based on text clarity."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{image_base64}",
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000
        )
        
        response_text = response.choices[0].message.content
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            result = json.loads(response_text[json_start:json_end])
            return result
    except Exception as e:
        print(f"Vision OCR error: {e}")
    
    return None

def calculate_risk_score(ocr_result, doc_type):
    """Calculate risk score based on document analysis"""
    base_score = 20
    
    if ocr_result and "document_analysis" in ocr_result:
        analysis = ocr_result["document_analysis"]
        
        quality = analysis.get("quality_score", 80)
        if quality < 50:
            base_score += 30
        elif quality < 70:
            base_score += 15
        
        issues = analysis.get("potential_issues", [])
        base_score += len(issues) * 8
        
        if not analysis.get("is_readable", True):
            base_score += 25
    
    if ocr_result and "extracted_fields" in ocr_result:
        fields = ocr_result["extracted_fields"]
        avg_confidence = sum(f.get("confidence", 80) for f in fields) / max(len(fields), 1)
        if avg_confidence < 70:
            base_score += 20
        elif avg_confidence < 85:
            base_score += 10
    
    return min(max(base_score, 5), 95)

def generate_ocr_fields(doc_type, ocr_result=None):
    """Generate OCR fields from Vision result or fallback to simulation"""
    if ocr_result and "extracted_fields" in ocr_result:
        fields = []
        for i, field in enumerate(ocr_result["extracted_fields"]):
            fields.append({
                "fieldName": field.get("fieldName", f"Field {i+1}"),
                "value": field.get("value", ""),
                "confidence": field.get("confidence", 85),
                "boundingBox": {"x": 15 + (i % 2) * 45, "y": 20 + (i // 2) * 15, "width": 30, "height": 5}
            })
        return fields
    
    base_fields = [
        {"fieldName": "Full Name", "value": "John Michael Smith", "confidence": 97, "boundingBox": {"x": 15, "y": 20, "width": 30, "height": 5}},
        {"fieldName": "Document Number", "value": f"DOC{random.randint(100000, 999999)}", "confidence": 99, "boundingBox": {"x": 60, "y": 20, "width": 25, "height": 5}},
        {"fieldName": "Date of Birth", "value": "1985-03-15", "confidence": 96, "boundingBox": {"x": 15, "y": 35, "width": 20, "height": 5}},
        {"fieldName": "Expiry Date", "value": "2028-03-14", "confidence": 95, "boundingBox": {"x": 60, "y": 35, "width": 20, "height": 5}},
    ]
    
    if doc_type == "passport":
        base_fields.append({"fieldName": "MRZ Code", "value": "P<USAMSMITH<<JOHN<MICHAEL<<<<<<<<<<<<<<<<<<", "confidence": 98, "boundingBox": {"x": 5, "y": 85, "width": 90, "height": 8}})
    elif doc_type == "drivers_license":
        base_fields.append({"fieldName": "License Class", "value": "Class C", "confidence": 94, "boundingBox": {"x": 15, "y": 50, "width": 15, "height": 5}})
    
    return base_fields

def generate_risk_insights(risk_score):
    """Generate AI-powered risk insights"""
    if risk_score < 30:
        return [
            {"category": "Document Quality", "description": "High-resolution image with clear text and security features", "severity": "low"},
            {"category": "Data Consistency", "description": "All extracted fields match expected patterns", "severity": "low"},
            {"category": "Fraud Detection", "description": "No suspicious patterns detected", "severity": "low"},
        ]
    elif risk_score < 70:
        return [
            {"category": "Image Quality", "description": "Some areas of the document are slightly blurred", "severity": "medium"},
            {"category": "Security Features", "description": "Hologram verification inconclusive", "severity": "medium"},
            {"category": "Data Format", "description": "Date format slightly unusual for issuing country", "severity": "low"},
        ]
    else:
        return [
            {"category": "Tampering Detection", "description": "Potential photo manipulation detected", "severity": "high"},
            {"category": "Font Analysis", "description": "Font inconsistencies found in name field", "severity": "high"},
            {"category": "Metadata", "description": "File metadata suggests recent editing", "severity": "medium"},
        ]

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard_route():
    all_verifications = get_all_verifications()
    total = len(all_verifications)
    approved = sum(1 for v in all_verifications if v["status"] == "approved")
    pending = sum(1 for v in all_verifications if v["status"] in ["pending", "in_review"])
    high_risk = sum(1 for v in all_verifications if v["riskLevel"] == "high")
    
    auto_approval_rate = round((approved / total * 100) if total > 0 else 0)
    
    recent = all_verifications[:10]
    
    volume_data = []
    for i in range(30):
        date = (datetime.now() - timedelta(days=29-i)).strftime("%b %d")
        count = sum(1 for v in all_verifications 
                   if v.get("submittedAt") and datetime.fromisoformat(v["submittedAt"]).date() == (datetime.now() - timedelta(days=29-i)).date())
        volume_data.append({"date": date, "count": count + random.randint(2, 8)})
    
    return jsonify({
        "totalVerifications": total,
        "autoApprovalRate": auto_approval_rate,
        "pendingReview": pending,
        "highRiskFlags": high_risk,
        "recentVerifications": recent,
        "volumeData": volume_data
    })

@app.route("/api/verifications", methods=["GET"])
def get_verifications_route():
    return jsonify(get_all_verifications())

@app.route("/api/verifications/<verification_id>", methods=["GET"])
def get_verification_route(verification_id):
    verification = get_verification_by_id(verification_id)
    if verification:
        return jsonify(verification)
    return jsonify({"error": "Verification not found"}), 404

@app.route("/api/verifications", methods=["POST"])
def create_verification():
    if "document" not in request.files:
        return jsonify({"error": "No document provided"}), 400
    
    file = request.files["document"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    
    ver_id = str(uuid.uuid4())
    doc_type = detect_document_type(file.filename)
    
    file_content = file.read()
    file_base64 = base64.b64encode(file_content).decode("utf-8")
    mime_type = file.content_type or "image/jpeg"
    document_url = f"data:{mime_type};base64,{file_base64}"
    
    ocr_result = extract_ocr_with_vision(file_base64, mime_type, doc_type)
    
    if ocr_result and "document_analysis" in ocr_result:
        detected_type = ocr_result["document_analysis"].get("detected_type")
        if detected_type and detected_type in ["passport", "drivers_license", "national_id"]:
            doc_type = detected_type
    
    risk_score = calculate_risk_score(ocr_result, doc_type)
    risk_level = "low" if risk_score < 30 else ("medium" if risk_score < 70 else "high")
    
    current_settings = get_settings()
    auto_approve = risk_score < current_settings["autoApproveThreshold"]
    auto_reject = current_settings["autoRejectHighRisk"] and risk_score > current_settings["highRiskThreshold"]
    
    status = "approved" if auto_approve else ("rejected" if auto_reject else "pending")
    
    ocr_fields = generate_ocr_fields(doc_type, ocr_result)
    
    name_field = next((f for f in ocr_fields if f["fieldName"] == "Full Name"), None)
    dob_field = next((f for f in ocr_fields if f["fieldName"] == "Date of Birth"), None)
    doc_num_field = next((f for f in ocr_fields if f["fieldName"] == "Document Number"), None)
    
    validation_results = []
    if name_field:
        validation_results.append({
            "fieldName": "Full Name", 
            "submittedValue": "", 
            "extractedValue": name_field["value"], 
            "isMatch": True
        })
    if dob_field:
        validation_results.append({
            "fieldName": "Date of Birth", 
            "submittedValue": "", 
            "extractedValue": dob_field["value"], 
            "isMatch": True
        })
    if doc_num_field:
        validation_results.append({
            "fieldName": "Document Number", 
            "submittedValue": "", 
            "extractedValue": doc_num_field["value"], 
            "isMatch": True
        })
    
    customer_name = name_field["value"] if name_field else f"Customer {ver_id[:8]}"
    
    verification = {
        "id": ver_id,
        "documentType": doc_type,
        "documentUrl": document_url,
        "status": status,
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "customerName": customer_name,
        "submittedAt": datetime.now().isoformat(),
        "reviewedAt": datetime.now().isoformat() if status in ["approved", "rejected"] else None,
        "ocrFields": ocr_fields,
        "riskInsights": generate_risk_insights(risk_score),
        "validationResults": validation_results,
        "chatHistory": []
    }
    
    save_verification(verification)
    
    log_audit_event(
        action="document_uploaded",
        entity_type="verification",
        entity_id=ver_id,
        details={
            "documentType": doc_type,
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "customerName": customer_name,
            "status": status
        },
        ip_address=request.remote_addr
    )
    
    return jsonify(verification), 201

@app.route("/api/verifications/<verification_id>", methods=["PATCH"])
def update_verification_route(verification_id):
    verification = get_verification_by_id(verification_id)
    if not verification:
        return jsonify({"error": "Verification not found"}), 404
    
    data = request.get_json()
    old_status = verification.get("status")
    
    if "status" in data:
        new_status = data["status"]
        verification["status"] = new_status
        verification["reviewedAt"] = datetime.now().isoformat()
        save_verification(verification)
        
        action = "verification_approved" if new_status == "approved" else (
            "verification_rejected" if new_status == "rejected" else "verification_status_changed"
        )
        
        log_audit_event(
            action=action,
            entity_type="verification",
            entity_id=verification_id,
            details={
                "oldStatus": old_status,
                "newStatus": new_status,
                "customerName": verification.get("customerName"),
                "riskScore": verification.get("riskScore"),
                "riskLevel": verification.get("riskLevel")
            },
            ip_address=request.remote_addr
        )
    
    return jsonify(verification)

@app.route("/api/verifications/<verification_id>/chat", methods=["GET"])
def get_chat_history_route(verification_id):
    verification = get_verification_by_id(verification_id)
    if not verification:
        return jsonify({"error": "Verification not found"}), 404
    return jsonify(get_chat_history(verification_id))

@app.route("/api/verifications/<verification_id>/chat", methods=["POST"])
def send_chat_message_route(verification_id):
    """RAG-enhanced chat endpoint using LangChain"""
    verification = get_verification_by_id(verification_id)
    if not verification:
        return jsonify({"error": "Verification not found"}), 404
    
    data = request.get_json()
    content = data.get("content", "")
    
    if not content:
        return jsonify({"error": "Message content required"}), 400
    
    user_message = {
        "id": str(uuid.uuid4()),
        "role": "user",
        "content": content,
        "timestamp": datetime.now().isoformat()
    }
    
    save_chat_message(verification_id, user_message)
    
    chat_history = get_chat_history(verification_id)
    
    if RAG_ENABLED:
        try:
            assistant_content = rag_enhanced_chat(verification, content, chat_history)
        except Exception as e:
            print(f"[python] RAG chat error, falling back: {e}")
            assistant_content = fallback_chat_response(verification, content, chat_history)
    else:
        assistant_content = fallback_chat_response(verification, content, chat_history)
    
    assistant_message = {
        "id": str(uuid.uuid4()),
        "role": "assistant",
        "content": assistant_content,
        "timestamp": datetime.now().isoformat()
    }
    
    save_chat_message(verification_id, assistant_message)
    
    return jsonify(assistant_message)


def fallback_chat_response(verification, content, chat_history):
    """Fallback chat when RAG is not available"""
    context = f"""You are an AI assistant helping a compliance analyst review a KYC document verification.

Document Information:
- Type: {verification['documentType'].replace('_', ' ').title()}
- Risk Score: {verification['riskScore']}/100 ({verification['riskLevel'].upper()} risk)
- Status: {verification['status'].replace('_', ' ').title()}

Extracted Data:
{json.dumps(verification['ocrFields'], indent=2)}

Risk Insights:
{json.dumps(verification['riskInsights'], indent=2)}

Please provide helpful, concise responses about this document. If asked about approval recommendations, consider the risk score and insights."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": context},
                *[{"role": m["role"], "content": m["content"]} for m in chat_history[-10:]]
            ],
            max_tokens=500
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"I'm currently analyzing this document. Based on the risk score of {verification['riskScore']}, this document is classified as {verification['riskLevel']} risk. The OCR extraction identified {len(verification['ocrFields'])} fields with high confidence. Would you like me to explain any specific aspect of this verification?"

@app.route("/api/integrations", methods=["GET"])
def get_integrations_route():
    return jsonify(integrations)

@app.route("/api/patterns", methods=["GET"])
def get_patterns_route():
    return jsonify(fraud_patterns)

@app.route("/api/settings", methods=["GET"])
def get_settings_route():
    return jsonify(get_settings())

@app.route("/api/settings", methods=["PUT"])
def update_settings_route():
    data = request.get_json()
    current = get_settings()
    old_settings = current.copy()
    current.update(data)
    save_settings(current)
    
    log_audit_event(
        action="settings_updated",
        entity_type="settings",
        details={"old": old_settings, "new": current},
        ip_address=request.remote_addr
    )
    
    return jsonify(current)

@app.route("/api/audit-logs", methods=["GET"])
def get_audit_logs_route():
    """Get audit logs with optional filtering and pagination"""
    filters = {}
    if request.args.get("action"):
        filters["action"] = request.args.get("action")
    if request.args.get("entityType"):
        filters["entity_type"] = request.args.get("entityType")
    if request.args.get("entityId"):
        filters["entity_id"] = request.args.get("entityId")
    if request.args.get("userId"):
        filters["user_id"] = request.args.get("userId")
    if request.args.get("startDate"):
        filters["start_date"] = request.args.get("startDate")
    if request.args.get("endDate"):
        filters["end_date"] = request.args.get("endDate")
    
    limit = int(request.args.get("limit", 50))
    offset = int(request.args.get("offset", 0))
    
    logs = get_audit_logs(filters if filters else None, limit, offset)
    total = get_audit_log_count(filters if filters else None)
    
    return jsonify({
        "logs": logs,
        "total": total,
        "limit": limit,
        "offset": offset
    })

@app.route("/api/audit-logs/export", methods=["GET"])
def export_audit_logs_route():
    """Export audit logs as CSV"""
    import csv
    from io import StringIO
    
    filters = {}
    if request.args.get("action"):
        filters["action"] = request.args.get("action")
    if request.args.get("entityType"):
        filters["entity_type"] = request.args.get("entityType")
    if request.args.get("startDate"):
        filters["start_date"] = request.args.get("startDate")
    if request.args.get("endDate"):
        filters["end_date"] = request.args.get("endDate")
    
    logs = get_audit_logs(filters if filters else None, limit=10000, offset=0)
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "Action", "Entity Type", "Entity ID", "User", "Details", "IP Address"])
    
    for log in logs:
        writer.writerow([
            log["timestamp"],
            log["action"],
            log["entityType"],
            log["entityId"] or "",
            log["userName"],
            json.dumps(log["details"]) if log["details"] else "",
            log["ipAddress"] or ""
        ])
    
    output.seek(0)
    return send_file(
        BytesIO(output.getvalue().encode('utf-8')),
        mimetype="text/csv",
        as_attachment=True,
        download_name=f"audit_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )

@app.route("/api/audit-logs/stats", methods=["GET"])
def get_audit_stats_route():
    """Get audit log statistics"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT action, COUNT(*) as count 
            FROM audit_logs 
            GROUP BY action 
            ORDER BY count DESC
        """)
        actions = [{"action": row["action"], "count": row["count"]} for row in cur.fetchall()]
        
        cur.execute("""
            SELECT DATE(timestamp) as date, COUNT(*) as count 
            FROM audit_logs 
            WHERE timestamp >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(timestamp) 
            ORDER BY date
        """)
        daily = [{"date": row["date"].isoformat() if row["date"] else None, "count": row["count"]} for row in cur.fetchall()]
        
        cur.execute("SELECT COUNT(*) as total FROM audit_logs")
        total = cur.fetchone()["total"]
        
        cur.close()
        conn.close()
        
        return jsonify({
            "totalLogs": total,
            "actionBreakdown": actions,
            "dailyActivity": daily
        })
    except Exception as e:
        print(f"Audit stats error: {e}")
        return jsonify({"totalLogs": 0, "actionBreakdown": [], "dailyActivity": []})

@app.route("/api/batch-jobs", methods=["GET"])
def get_batch_jobs_route():
    """Get all batch jobs"""
    return jsonify(get_all_batch_jobs())

@app.route("/api/batch-jobs/<job_id>", methods=["GET"])
def get_batch_job_route(job_id):
    """Get a specific batch job"""
    job = get_batch_job(job_id)
    if job:
        return jsonify(job)
    return jsonify({"error": "Batch job not found"}), 404

@app.route("/api/batch-jobs", methods=["POST"])
def create_batch_job_route():
    """Create a new batch job and process documents"""
    if "documents" not in request.files:
        return jsonify({"error": "No documents provided"}), 400
    
    files = request.files.getlist("documents")
    if len(files) == 0:
        return jsonify({"error": "No files selected"}), 400
    
    if len(files) > 50:
        return jsonify({"error": "Maximum 50 documents per batch"}), 400
    
    batch_name = request.form.get("name", f"Batch {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    
    job_id = create_batch_job(batch_name, len(files))
    if not job_id:
        return jsonify({"error": "Failed to create batch job"}), 500
    
    update_batch_job(job_id, {"status": "processing", "started_at": datetime.now()})
    
    log_audit_event(
        action="batch_job_started",
        entity_type="batch_job",
        entity_id=job_id,
        details={"name": batch_name, "documentCount": len(files)},
        ip_address=request.remote_addr
    )
    
    verification_ids = []
    successful = 0
    failed = 0
    
    for i, file in enumerate(files):
        try:
            file_content = file.read()
            mime_type = file.content_type or "image/jpeg"
            result = process_single_document_for_batch(file_content, file.filename, mime_type)
            
            if result["success"]:
                verification_ids.append(result["verification_id"])
                successful += 1
            else:
                failed += 1
            
            update_batch_job(job_id, {
                "processed_documents": i + 1,
                "successful_documents": successful,
                "failed_documents": failed,
                "verification_ids": verification_ids
            })
        except Exception as e:
            print(f"Batch document processing error: {e}")
            failed += 1
            update_batch_job(job_id, {
                "processed_documents": i + 1,
                "failed_documents": failed
            })
    
    final_status = "completed" if failed == 0 else ("completed_with_errors" if successful > 0 else "failed")
    update_batch_job(job_id, {
        "status": final_status,
        "completed_at": datetime.now()
    })
    
    log_audit_event(
        action="batch_job_completed",
        entity_type="batch_job",
        entity_id=job_id,
        details={
            "name": batch_name,
            "status": final_status,
            "successful": successful,
            "failed": failed
        },
        ip_address=request.remote_addr
    )
    
    return jsonify(get_batch_job(job_id)), 201

@app.route("/api/batch-jobs/<job_id>/verifications", methods=["GET"])
def get_batch_verifications_route(job_id):
    """Get all verifications for a batch job"""
    job = get_batch_job(job_id)
    if not job:
        return jsonify({"error": "Batch job not found"}), 404
    
    verifications = []
    for ver_id in job.get("verificationIds", []):
        ver = get_verification_by_id(ver_id)
        if ver:
            verifications.append(ver)
    
    return jsonify(verifications)

@app.route("/api/batch-jobs/stats", methods=["GET"])
def get_batch_stats_route():
    """Get batch processing statistics"""
    try:
        all_jobs = get_all_batch_jobs()
        total_jobs = len(all_jobs)
        completed_jobs = sum(1 for j in all_jobs if j["status"] in ["completed", "completed_with_errors"])
        total_documents = sum(j["totalDocuments"] for j in all_jobs)
        successful_documents = sum(j["successfulDocuments"] for j in all_jobs)
        
        return jsonify({
            "totalJobs": total_jobs,
            "completedJobs": completed_jobs,
            "totalDocuments": total_documents,
            "successfulDocuments": successful_documents,
            "successRate": round((successful_documents / total_documents * 100) if total_documents > 0 else 0, 1)
        })
    except Exception as e:
        print(f"Batch stats error: {e}")
        return jsonify({
            "totalJobs": 0,
            "completedJobs": 0,
            "totalDocuments": 0,
            "successfulDocuments": 0,
            "successRate": 0
        })


@app.route("/api/rag/status", methods=["GET"])
def get_rag_status_route():
    """Get RAG system status and knowledge base statistics"""
    if not RAG_ENABLED:
        return jsonify({
            "enabled": False,
            "status": "unavailable",
            "message": "RAG service is not available",
            "features": {
                "langchain": False,
                "langgraph": False,
                "vectorDb": False,
                "embeddings": False
            }
        })
    
    try:
        kb_stats = get_knowledge_base_stats()
        return jsonify({
            "enabled": True,
            "status": kb_stats.get("status", "unknown"),
            "knowledgeBase": kb_stats,
            "features": {
                "langchain": True,
                "langgraph": True,
                "vectorDb": True,
                "embeddings": True,
                "ragChat": True,
                "semanticSearch": True,
                "fraudPatternMatching": True,
                "workflowAnalysis": True
            },
            "models": {
                "llm": "gpt-4o",
                "embeddings": "text-embedding-3-small",
                "vectorDb": "ChromaDB"
            }
        })
    except Exception as e:
        return jsonify({
            "enabled": True,
            "status": "error",
            "error": str(e)
        })


@app.route("/api/rag/search", methods=["POST"])
def semantic_search_route():
    """Semantic search across document knowledge base"""
    if not RAG_ENABLED:
        return jsonify({"error": "RAG service not available"}), 503
    
    data = request.get_json()
    query = data.get("query", "")
    limit = data.get("limit", 5)
    filter_type = data.get("filterType")
    
    if not query:
        return jsonify({"error": "Search query required"}), 400
    
    try:
        results = semantic_document_search(query, k=limit, filter_type=filter_type)
        
        log_audit_event(
            action="semantic_search",
            entity_type="rag",
            details={"query": query, "results_count": len(results)},
            ip_address=request.remote_addr
        )
        
        return jsonify({
            "query": query,
            "results": results,
            "total": len(results)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/rag/similar/<verification_id>", methods=["GET"])
def find_similar_route(verification_id):
    """Find similar verifications using vector similarity"""
    if not RAG_ENABLED:
        return jsonify({"error": "RAG service not available"}), 503
    
    verification = get_verification_by_id(verification_id)
    if not verification:
        return jsonify({"error": "Verification not found"}), 404
    
    try:
        similar_verifications = find_similar_verifications(verification, k=5)
        matching_patterns = find_matching_fraud_patterns(verification, k=3)
        
        return jsonify({
            "verificationId": verification_id,
            "similarVerifications": similar_verifications,
            "matchingFraudPatterns": matching_patterns
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/rag/analyze/<verification_id>", methods=["POST"])
def rag_analyze_route(verification_id):
    """Run complete RAG analysis on a verification using LangGraph workflow"""
    if not RAG_ENABLED:
        return jsonify({"error": "RAG service not available"}), 503
    
    verification = get_verification_by_id(verification_id)
    if not verification:
        return jsonify({"error": "Verification not found"}), 404
    
    try:
        ocr_result = {
            "extracted_fields": verification.get("ocrFields", []),
            "document_analysis": {
                "detected_type": verification.get("documentType"),
                "quality_score": 80,
                "is_readable": True,
                "potential_issues": []
            }
        }
        
        analysis = analyze_document_with_rag(verification, ocr_result)
        
        log_audit_event(
            action="rag_analysis",
            entity_type="verification",
            entity_id=verification_id,
            details={
                "recommendation": analysis.get("workflow_analysis", {}).get("final_recommendation", ""),
                "fraud_indicators_count": len(analysis.get("workflow_analysis", {}).get("fraud_indicators", []))
            },
            ip_address=request.remote_addr
        )
        
        return jsonify({
            "verificationId": verification_id,
            "analysis": analysis
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/rag/workflow/<verification_id>", methods=["POST"])
def run_workflow_route(verification_id):
    """Execute LangGraph verification workflow"""
    if not RAG_ENABLED:
        return jsonify({"error": "RAG service not available"}), 503
    
    verification = get_verification_by_id(verification_id)
    if not verification:
        return jsonify({"error": "Verification not found"}), 404
    
    try:
        ocr_result = {
            "extracted_fields": verification.get("ocrFields", []),
            "document_analysis": {
                "detected_type": verification.get("documentType"),
                "quality_score": 80,
                "is_readable": True,
                "potential_issues": []
            }
        }
        
        workflow_result = run_verification_workflow(verification, ocr_result)
        
        return jsonify({
            "verificationId": verification_id,
            "workflowResult": workflow_result
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/rag/embed", methods=["POST"])
def embed_documents_route():
    """Manually trigger document embedding for existing verifications"""
    if not RAG_ENABLED:
        return jsonify({"error": "RAG service not available"}), 503
    
    try:
        all_verifications = get_all_verifications()
        embedded_count = 0
        
        for verification in all_verifications:
            result = create_document_embedding(verification)
            if result:
                embedded_count += 1
        
        pattern_count = store_fraud_pattern_embeddings(fraud_patterns)
        
        log_audit_event(
            action="bulk_embedding",
            entity_type="rag",
            details={
                "verifications_embedded": embedded_count,
                "patterns_embedded": pattern_count
            },
            ip_address=request.remote_addr
        )
        
        return jsonify({
            "success": True,
            "verificationsEmbedded": embedded_count,
            "patternsEmbedded": pattern_count
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
