import { z } from "zod";

export const DocumentTypeEnum = z.enum(["passport", "drivers_license", "national_id"]);
export type DocumentType = z.infer<typeof DocumentTypeEnum>;

export const VerificationStatusEnum = z.enum(["pending", "approved", "rejected", "in_review"]);
export type VerificationStatus = z.infer<typeof VerificationStatusEnum>;

export const RiskLevelEnum = z.enum(["low", "medium", "high"]);
export type RiskLevel = z.infer<typeof RiskLevelEnum>;

export const ocrFieldSchema = z.object({
  fieldName: z.string(),
  value: z.string(),
  confidence: z.number().min(0).max(100),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
});
export type OcrField = z.infer<typeof ocrFieldSchema>;

export const riskInsightSchema = z.object({
  category: z.string(),
  description: z.string(),
  severity: RiskLevelEnum,
});
export type RiskInsight = z.infer<typeof riskInsightSchema>;

export const validationResultSchema = z.object({
  fieldName: z.string(),
  submittedValue: z.string(),
  extractedValue: z.string(),
  isMatch: z.boolean(),
});
export type ValidationResult = z.infer<typeof validationResultSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const verificationSchema = z.object({
  id: z.string(),
  documentType: DocumentTypeEnum,
  documentUrl: z.string(),
  status: VerificationStatusEnum,
  riskScore: z.number().min(0).max(100),
  riskLevel: RiskLevelEnum,
  ocrFields: z.array(ocrFieldSchema),
  riskInsights: z.array(riskInsightSchema),
  validationResults: z.array(validationResultSchema),
  chatHistory: z.array(chatMessageSchema),
  customerName: z.string().optional(),
  submittedAt: z.string(),
  reviewedAt: z.string().optional(),
});
export type Verification = z.infer<typeof verificationSchema>;

export const insertVerificationSchema = verificationSchema.omit({ 
  id: true, 
  ocrFields: true, 
  riskInsights: true, 
  validationResults: true, 
  chatHistory: true,
  riskScore: true,
  riskLevel: true,
  reviewedAt: true,
});
export type InsertVerification = z.infer<typeof insertVerificationSchema>;

export const integrationSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["dmv", "passport_authority", "ssa"]),
  status: z.enum(["connected", "disconnected", "pending"]),
  lastSync: z.string().optional(),
  description: z.string(),
});
export type Integration = z.infer<typeof integrationSchema>;

export const fraudPatternSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  technique: z.string(),
  confidenceScore: z.number().min(0).max(100),
  beforeExample: z.string().optional(),
  afterExample: z.string().optional(),
});
export type FraudPattern = z.infer<typeof fraudPatternSchema>;

export const settingsSchema = z.object({
  autoApproveThreshold: z.number().min(0).max(100),
  highRiskThreshold: z.number().min(0).max(100),
  emailNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
  autoRejectHighRisk: z.boolean(),
});
export type Settings = z.infer<typeof settingsSchema>;

export const dashboardStatsSchema = z.object({
  totalVerifications: z.number(),
  autoApprovalRate: z.number(),
  pendingReview: z.number(),
  highRiskFlags: z.number(),
  recentVerifications: z.array(verificationSchema),
  volumeData: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
});
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

export const users = {
  id: "",
  username: "",
  password: "",
};
export type User = typeof users;
export type InsertUser = Omit<User, "id">;
