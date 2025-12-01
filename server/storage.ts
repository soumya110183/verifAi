import type { 
  Verification, 
  InsertVerification, 
  Settings, 
  Integration, 
  FraudPattern,
  ChatMessage,
  DashboardStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getVerification(id: string): Promise<Verification | undefined>;
  getVerifications(): Promise<Verification[]>;
  createVerification(verification: InsertVerification): Promise<Verification>;
  updateVerification(id: string, updates: Partial<Verification>): Promise<Verification | undefined>;
  
  getSettings(): Promise<Settings>;
  updateSettings(settings: Settings): Promise<Settings>;
  
  getIntegrations(): Promise<Integration[]>;
  
  getPatterns(): Promise<FraudPattern[]>;
  
  getChatHistory(verificationId: string): Promise<ChatMessage[]>;
  addChatMessage(verificationId: string, message: ChatMessage): Promise<ChatMessage>;
  
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private verifications: Map<string, Verification>;
  private settings: Settings;
  private integrations: Integration[];
  private patterns: FraudPattern[];
  private chatHistories: Map<string, ChatMessage[]>;

  constructor() {
    this.verifications = new Map();
    this.chatHistories = new Map();
    
    this.settings = {
      autoApproveThreshold: 30,
      highRiskThreshold: 70,
      emailNotifications: true,
      inAppNotifications: true,
      autoRejectHighRisk: false
    };

    this.integrations = [
      {
        id: "dmv-1",
        name: "DMV Integration",
        type: "dmv",
        status: "connected",
        lastSync: new Date().toISOString(),
        description: "Validates driver's license numbers against motor vehicle records"
      },
      {
        id: "passport-1",
        name: "Passport Authority",
        type: "passport_authority",
        status: "pending",
        description: "Verifies passport numbers with the issuing government authority"
      },
      {
        id: "ssa-1",
        name: "SSA Integration",
        type: "ssa",
        status: "disconnected",
        description: "Cross-references Social Security numbers for identity confirmation"
      }
    ];

    this.patterns = [
      {
        id: "pattern-1",
        name: "Font Substitution",
        description: "Detects when document text uses fonts that don't match official templates",
        technique: "Font Analysis",
        confidenceScore: 94
      },
      {
        id: "pattern-2",
        name: "Photo Manipulation",
        description: "Identifies edited or replaced photos using ELA analysis",
        technique: "Image Forensics",
        confidenceScore: 91
      },
      {
        id: "pattern-3",
        name: "Metadata Tampering",
        description: "Detects signs of editing software in file metadata",
        technique: "Metadata Inspection",
        confidenceScore: 88
      },
      {
        id: "pattern-4",
        name: "MRZ Inconsistency",
        description: "Identifies mismatches between MRZ data and visual text",
        technique: "Document Analysis",
        confidenceScore: 96
      },
      {
        id: "pattern-5",
        name: "Security Feature Absence",
        description: "Detects missing or incorrectly placed security features",
        technique: "Layout Validation",
        confidenceScore: 89
      },
      {
        id: "pattern-6",
        name: "Date Format Anomaly",
        description: "Identifies incorrect date formats for the document's issuing country",
        technique: "Document Analysis",
        confidenceScore: 92
      }
    ];
  }

  async getVerification(id: string): Promise<Verification | undefined> {
    return this.verifications.get(id);
  }

  async getVerifications(): Promise<Verification[]> {
    return Array.from(this.verifications.values());
  }

  async createVerification(insertVerification: InsertVerification): Promise<Verification> {
    const id = randomUUID();
    const verification: Verification = {
      ...insertVerification,
      id,
      riskScore: 0,
      riskLevel: "low",
      ocrFields: [],
      riskInsights: [],
      validationResults: [],
      chatHistory: []
    };
    this.verifications.set(id, verification);
    this.chatHistories.set(id, []);
    return verification;
  }

  async updateVerification(id: string, updates: Partial<Verification>): Promise<Verification | undefined> {
    const verification = this.verifications.get(id);
    if (!verification) return undefined;
    
    const updated = { ...verification, ...updates };
    this.verifications.set(id, updated);
    return updated;
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(settings: Settings): Promise<Settings> {
    this.settings = settings;
    return this.settings;
  }

  async getIntegrations(): Promise<Integration[]> {
    return this.integrations;
  }

  async getPatterns(): Promise<FraudPattern[]> {
    return this.patterns;
  }

  async getChatHistory(verificationId: string): Promise<ChatMessage[]> {
    return this.chatHistories.get(verificationId) || [];
  }

  async addChatMessage(verificationId: string, message: ChatMessage): Promise<ChatMessage> {
    const history = this.chatHistories.get(verificationId) || [];
    history.push(message);
    this.chatHistories.set(verificationId, history);
    return message;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const verifications = Array.from(this.verifications.values());
    const total = verifications.length;
    const approved = verifications.filter(v => v.status === "approved").length;
    const pending = verifications.filter(v => v.status === "pending" || v.status === "in_review").length;
    const highRisk = verifications.filter(v => v.riskLevel === "high").length;
    
    return {
      totalVerifications: total,
      autoApprovalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      pendingReview: pending,
      highRiskFlags: highRisk,
      recentVerifications: verifications.slice(-10).reverse(),
      volumeData: []
    };
  }
}

export const storage = new MemStorage();
