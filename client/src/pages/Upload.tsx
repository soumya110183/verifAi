import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileText, X, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Verification, DocumentType } from "@shared/schema";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>("");

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setProcessingStage("Uploading document...");
      setUploadProgress(20);
      
      const response = await fetch("/api/verifications", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      
      setProcessingStage("Analyzing document with AI...");
      setUploadProgress(60);
      
      const data = await response.json();
      
      setProcessingStage("Extracting data...");
      setUploadProgress(90);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(100);
      setProcessingStage("Complete!");
      
      return data as Verification;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/verifications"] });
      toast({
        title: "Document uploaded successfully",
        description: "Redirecting to verification details...",
      });
      setTimeout(() => {
        setLocation(`/verification/${data.id}`);
      }, 1000);
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      setProcessingStage("");
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && isValidFile(droppedFile)) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const isValidFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 10 * 1024 * 1024;
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or PDF file.",
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleUpload = () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append("document", file);
    uploadMutation.mutate(formData);
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setProcessingStage("");
  };

  const isProcessing = uploadMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">New Verification</h1>
        <p className="text-muted-foreground mt-1">
          Upload a document to begin the KYC verification process
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          {!file ? (
            <div
              className={`relative flex flex-col items-center justify-center min-h-64 rounded-xl border-2 border-dashed transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-testid="dropzone"
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                data-testid="input-file"
              />
              <div className="flex flex-col items-center text-center p-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Drag and drop your document
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse files
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPG, PNG, PDF (max 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isProcessing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    data-testid="button-remove-file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isProcessing && (
                <div className="space-y-3">
                  <Progress value={uploadProgress} className="h-2" data-testid="progress-upload" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {uploadProgress < 100 ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <span data-testid="text-processing-stage">{processingStage}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={removeFile}
                  disabled={isProcessing}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="flex-1"
                  data-testid="button-upload"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Verification"
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Supported Document Types</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Passport", description: "International travel document" },
              { name: "Driver's License", description: "State-issued ID" },
              { name: "National ID", description: "Government-issued ID card" },
            ].map((doc) => (
              <div
                key={doc.name}
                className="p-4 rounded-lg border border-border hover-elevate"
              >
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-muted-foreground">{doc.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
