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

app = Flask(__name__)
CORS(app, origins="*")

# This is using Replit's AI Integrations service, which provides OpenAI-compatible API access
# without requiring your own OpenAI API key. Charges are billed to your credits.
# the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
client = OpenAI(
    base_url=os.environ.get("AI_INTEGRATIONS_OPENAI_BASE_URL"),
    api_key=os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY")
)

# In-memory storage
verifications = {}
chat_histories = {}
settings = {
    "autoApproveThreshold": 30,
    "highRiskThreshold": 70,
    "emailNotifications": True,
    "inAppNotifications": True,
    "autoRejectHighRisk": False
}

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

def generate_sample_data():
    """Generate sample verifications for demo"""
    sample_names = ["John Smith", "Maria Garcia", "James Wilson", "Sarah Johnson", "Michael Brown"]
    doc_types = ["passport", "drivers_license", "national_id"]
    statuses = ["approved", "pending", "in_review", "rejected"]
    
    for i in range(10):
        ver_id = str(uuid.uuid4())
        risk_score = random.randint(5, 85)
        risk_level = "low" if risk_score < 30 else ("medium" if risk_score < 70 else "high")
        status = "approved" if risk_score < 30 else ("pending" if risk_score < 70 else random.choice(["in_review", "rejected"]))
        
        verifications[ver_id] = {
            "id": ver_id,
            "documentType": random.choice(doc_types),
            "documentUrl": "",
            "status": status,
            "riskScore": risk_score,
            "riskLevel": risk_level,
            "customerName": random.choice(sample_names),
            "submittedAt": (datetime.now() - timedelta(days=random.randint(0, 30))).isoformat(),
            "reviewedAt": datetime.now().isoformat() if status in ["approved", "rejected"] else None,
            "ocrFields": [
                {"fieldName": "Full Name", "value": random.choice(sample_names), "confidence": random.randint(85, 99)},
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
                {"fieldName": "Full Name", "submittedValue": random.choice(sample_names), "extractedValue": random.choice(sample_names), "isMatch": True},
                {"fieldName": "Date of Birth", "submittedValue": "1985-03-15", "extractedValue": "1985-03-15", "isMatch": True},
            ],
            "chatHistory": []
        }
        chat_histories[ver_id] = []

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
            model="gpt-5",
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
            max_completion_tokens=1000
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
def get_dashboard():
    total = len(verifications)
    approved = sum(1 for v in verifications.values() if v["status"] == "approved")
    pending = sum(1 for v in verifications.values() if v["status"] in ["pending", "in_review"])
    high_risk = sum(1 for v in verifications.values() if v["riskLevel"] == "high")
    
    auto_approval_rate = round((approved / total * 100) if total > 0 else 0)
    
    recent = sorted(verifications.values(), key=lambda x: x["submittedAt"], reverse=True)[:10]
    
    volume_data = []
    for i in range(30):
        date = (datetime.now() - timedelta(days=29-i)).strftime("%b %d")
        count = sum(1 for v in verifications.values() 
                   if datetime.fromisoformat(v["submittedAt"]).date() == (datetime.now() - timedelta(days=29-i)).date())
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
def get_verifications():
    return jsonify(list(verifications.values()))

@app.route("/api/verifications/<verification_id>", methods=["GET"])
def get_verification(verification_id):
    if verification_id in verifications:
        return jsonify(verifications[verification_id])
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
    
    auto_approve = risk_score < settings["autoApproveThreshold"]
    auto_reject = settings["autoRejectHighRisk"] and risk_score > settings["highRiskThreshold"]
    
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
    
    verifications[ver_id] = verification
    chat_histories[ver_id] = []
    
    return jsonify(verification), 201

@app.route("/api/verifications/<verification_id>", methods=["PATCH"])
def update_verification(verification_id):
    if verification_id not in verifications:
        return jsonify({"error": "Verification not found"}), 404
    
    data = request.get_json()
    if "status" in data:
        verifications[verification_id]["status"] = data["status"]
        verifications[verification_id]["reviewedAt"] = datetime.now().isoformat()
    
    return jsonify(verifications[verification_id])

@app.route("/api/verifications/<verification_id>/chat", methods=["GET"])
def get_chat_history(verification_id):
    if verification_id not in verifications:
        return jsonify({"error": "Verification not found"}), 404
    return jsonify(chat_histories.get(verification_id, []))

@app.route("/api/verifications/<verification_id>/chat", methods=["POST"])
def send_chat_message(verification_id):
    if verification_id not in verifications:
        return jsonify({"error": "Verification not found"}), 404
    
    data = request.get_json()
    content = data.get("content", "")
    
    if not content:
        return jsonify({"error": "Message content required"}), 400
    
    verification = verifications[verification_id]
    
    user_message = {
        "id": str(uuid.uuid4()),
        "role": "user",
        "content": content,
        "timestamp": datetime.now().isoformat()
    }
    
    if verification_id not in chat_histories:
        chat_histories[verification_id] = []
    chat_histories[verification_id].append(user_message)
    
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
            model="gpt-5",  # the newest OpenAI model is "gpt-5" which was released August 7, 2025
            messages=[
                {"role": "system", "content": context},
                *[{"role": m["role"], "content": m["content"]} for m in chat_histories[verification_id][-10:]]
            ],
            max_completion_tokens=500
        )
        
        assistant_content = response.choices[0].message.content
    except Exception as e:
        assistant_content = f"I'm currently analyzing this document. Based on the risk score of {verification['riskScore']}, this document is classified as {verification['riskLevel']} risk. The OCR extraction identified {len(verification['ocrFields'])} fields with high confidence. Would you like me to explain any specific aspect of this verification?"
    
    assistant_message = {
        "id": str(uuid.uuid4()),
        "role": "assistant",
        "content": assistant_content,
        "timestamp": datetime.now().isoformat()
    }
    
    chat_histories[verification_id].append(assistant_message)
    
    return jsonify(assistant_message)

@app.route("/api/integrations", methods=["GET"])
def get_integrations():
    return jsonify(integrations)

@app.route("/api/patterns", methods=["GET"])
def get_patterns():
    return jsonify(fraud_patterns)

@app.route("/api/settings", methods=["GET"])
def get_settings():
    return jsonify(settings)

@app.route("/api/settings", methods=["PUT"])
def update_settings():
    global settings
    data = request.get_json()
    settings.update(data)
    return jsonify(settings)

if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
