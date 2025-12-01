import { useQuery } from "@tanstack/react-query";
import { Shield, Eye, FileWarning, Scan, Type, Layers, Binary, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FraudPattern } from "@shared/schema";

const patternCategories = [
  { id: "all", label: "All Patterns" },
  { id: "document", label: "Document Analysis" },
  { id: "font", label: "Font Detection" },
  { id: "metadata", label: "Metadata" },
];

const detectionTechniques = [
  {
    icon: Type,
    title: "Font Analysis",
    description: "Detects inconsistent fonts, unusual character spacing, or font substitutions that indicate document tampering.",
    examples: ["Mismatched font weights", "Inconsistent kerning", "Non-standard character sets"],
  },
  {
    icon: Binary,
    title: "Metadata Inspection",
    description: "Examines file metadata for signs of editing software, modification dates, and creation timestamps.",
    examples: ["Adobe Photoshop signatures", "Edit history traces", "GPS location mismatches"],
  },
  {
    icon: Layers,
    title: "Layout Validation",
    description: "Analyzes document structure, alignment, and spacing to identify irregularities.",
    examples: ["Uneven margins", "Misaligned security features", "Incorrect template structure"],
  },
  {
    icon: Scan,
    title: "Image Forensics",
    description: "Uses advanced image analysis to detect splicing, cloning, and digital alterations.",
    examples: ["Copy-move detection", "ELA analysis", "Noise pattern analysis"],
  },
];

function PatternCard({ pattern }: { pattern: FraudPattern }) {
  return (
    <Card className="hover-elevate overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
          <FileWarning className="h-16 w-16 text-muted-foreground/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <Badge className="absolute bottom-3 left-3 bg-primary">
            {pattern.confidenceScore}% Detection Rate
          </Badge>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-2">{pattern.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{pattern.description}</p>
          <div className="pt-4 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground">Detection Method</span>
            <p className="text-sm mt-1">{pattern.technique}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TechniqueCard({ technique }: { technique: typeof detectionTechniques[0] }) {
  const Icon = technique.icon;
  
  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">{technique.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{technique.description}</p>
            <div className="flex flex-wrap gap-2">
              {technique.examples.map((example, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {example}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Patterns() {
  const { data: patterns, isLoading } = useQuery<FraudPattern[]>({
    queryKey: ["/api/patterns"],
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Fraud Detection Patterns</h1>
        <p className="text-muted-foreground mt-1">
          Learn about our AI-powered fraud detection capabilities
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Detection Techniques</CardTitle>
              <p className="text-sm text-muted-foreground">
                How VerifAI identifies fraudulent documents
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectionTechniques.map((technique, index) => (
              <TechniqueCard key={index} technique={technique} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">Known Fraud Patterns</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Common document fraud techniques our AI detects
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              {patternCategories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-80" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patterns?.map((pattern) => (
                    <PatternCard key={pattern.id} pattern={pattern} />
                  ))}
                  {(!patterns || patterns.length === 0) && (
                    <div className="col-span-full text-center py-12">
                      <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Pattern library loading...</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {["document", "font", "metadata"].map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {patterns?.filter(p => p.technique.toLowerCase().includes(category))
                    .map((pattern) => (
                      <PatternCard key={pattern.id} pattern={pattern} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold">Continuous Learning</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our AI models are continuously updated to detect new fraud patterns.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
