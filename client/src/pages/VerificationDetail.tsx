import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { GenAIAssistant } from "@/components/GenAIAssistant";
import type { Verification, OcrField, RiskInsight, ValidationResult } from "@shared/schema";
import { Link } from "wouter";

function RiskScoreGauge({ score, level }: { score: number; level: string }) {
  const getColor = () => {
    if (score < 30) return "text-green-500";
    if (score < 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getBackgroundColor = () => {
    if (score < 30) return "bg-green-500";
    if (score < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-muted"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 314} 314`}
            className={getColor()}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${getColor()}`}>{score}</span>
        </div>
      </div>
      <Badge 
        variant="outline" 
        className={`mt-3 ${getBackgroundColor()} text-white border-0 uppercase text-xs font-semibold`}
      >
        {level} Risk
      </Badge>
    </div>
  );
}

function OcrFieldDisplay({ field }: { field: OcrField }) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 dark:text-green-400";
    if (confidence >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{field.fieldName}</span>
        <Badge variant="outline" className={`text-xs ${getConfidenceColor(field.confidence)}`}>
          {field.confidence}%
        </Badge>
      </div>
      <p className="font-mono text-base">{field.value}</p>
    </div>
  );
}

function ValidationRow({ result }: { result: ValidationResult }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-border last:border-0">
      <div>
        <span className="text-sm font-medium text-muted-foreground">{result.fieldName}</span>
      </div>
      <div className="font-mono text-sm">{result.submittedValue || "-"}</div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">{result.extractedValue}</span>
        {result.isMatch ? (
          <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
        )}
      </div>
    </div>
  );
}

export default function VerificationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [zoom, setZoom] = useState(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);

  const { data: verification, isLoading } = useQuery<Verification>({
    queryKey: ["/api/verifications", id],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: "approved" | "rejected") => {
      return apiRequest("PATCH", `/api/verifications/${id}`, { status });
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["/api/verifications", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: `Verification ${status}`,
        description: `The document has been ${status}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <Skeleton className="h-[500px]" />
          </div>
          <div className="col-span-4">
            <Skeleton className="h-[500px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold mb-2">Verification not found</h2>
        <p className="text-muted-foreground mb-4">
          The requested verification could not be found.
        </p>
        <Link href="/">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isPending = verification.status === "pending" || verification.status === "in_review";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              {verification.customerName || `Verification ${verification.id.slice(0, 8)}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              Submitted {new Date(verification.submittedAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        {isPending && (
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" data-testid="button-reject">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Verification</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject this verification? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => updateStatusMutation.mutate("rejected")}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Reject"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button data-testid="button-approve">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Verification</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to approve this verification? This will mark the document as verified.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => updateStatusMutation.mutate("approved")}>
                    {updateStatusMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Approve"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <CardTitle className="text-lg font-semibold">Document Viewer</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  data-testid="button-zoom-out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                  data-testid="button-zoom-in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setZoom(1)}
                  data-testid="button-reset-zoom"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative overflow-auto bg-muted/30 min-h-[400px] flex items-center justify-center p-4">
                <div
                  className="relative"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                >
                  {verification.documentUrl ? (
                    <img
                      src={verification.documentUrl}
                      alt="Document"
                      className="max-w-full rounded-lg shadow-lg"
                      data-testid="img-document"
                    />
                  ) : (
                    <div className="w-[400px] h-[300px] bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Document preview unavailable</p>
                    </div>
                  )}
                  
                  {showBoundingBoxes && verification.ocrFields?.map((field, index) => (
                    field.boundingBox && (
                      <div
                        key={index}
                        className="absolute border-2 border-primary/80 bg-primary/10 rounded"
                        style={{
                          left: `${field.boundingBox.x}%`,
                          top: `${field.boundingBox.y}%`,
                          width: `${field.boundingBox.width}%`,
                          height: `${field.boundingBox.height}%`,
                        }}
                        title={`${field.fieldName}: ${field.value}`}
                      />
                    )
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <GenAIAssistant verificationId={verification.id} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Risk Assessment</h3>
              <RiskScoreGauge score={verification.riskScore} level={verification.riskLevel} />
              
              {verification.riskInsights && verification.riskInsights.length > 0 && (
                <Accordion type="single" collapsible className="mt-6">
                  <AccordionItem value="insights" className="border-0">
                    <AccordionTrigger className="text-sm font-medium py-2">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        AI Insights ({verification.riskInsights.length})
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {verification.riskInsights.map((insight, index) => (
                          <div key={index} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {insight.category}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  insight.severity === "low" 
                                    ? "text-green-600 dark:text-green-400" 
                                    : insight.severity === "medium"
                                    ? "text-yellow-600 dark:text-yellow-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {insight.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="ocr" className="w-full">
                <TabsList className="w-full rounded-none border-b h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="ocr" 
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                    data-testid="tab-ocr"
                  >
                    OCR Extraction
                  </TabsTrigger>
                  <TabsTrigger 
                    value="validation" 
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                    data-testid="tab-validation"
                  >
                    Validation
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="ocr" className="p-6 space-y-4 mt-0">
                  {verification.ocrFields?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {verification.ocrFields.map((field, index) => (
                        <OcrFieldDisplay key={index} field={field} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No OCR data available
                    </p>
                  )}
                </TabsContent>
                
                <TabsContent value="validation" className="p-6 mt-0">
                  {verification.validationResults?.length ? (
                    <div>
                      <div className="grid grid-cols-3 gap-4 pb-2 border-b border-border text-sm font-medium text-muted-foreground">
                        <span>Field</span>
                        <span>Submitted</span>
                        <span>Extracted</span>
                      </div>
                      {verification.validationResults.map((result, index) => (
                        <ValidationRow key={index} result={result} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No validation data available
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
