import { useQuery } from "@tanstack/react-query";
import { Link2, CheckCircle, XCircle, Clock, Settings2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Integration } from "@shared/schema";

function StatusIndicator({ status }: { status: Integration["status"] }) {
  const config = {
    connected: { 
      icon: CheckCircle, 
      label: "Connected", 
      className: "text-green-600 dark:text-green-400",
      dotClass: "bg-green-500"
    },
    disconnected: { 
      icon: XCircle, 
      label: "Disconnected", 
      className: "text-red-600 dark:text-red-400",
      dotClass: "bg-red-500"
    },
    pending: { 
      icon: Clock, 
      label: "Pending", 
      className: "text-yellow-600 dark:text-yellow-400",
      dotClass: "bg-yellow-500"
    },
  };
  
  const { icon: Icon, label, className, dotClass } = config[status];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const getIcon = (type: Integration["type"]) => {
    switch (type) {
      case "dmv":
        return "DMV";
      case "passport_authority":
        return "PA";
      case "ssa":
        return "SSA";
      default:
        return "??";
    }
  };

  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <span className="font-semibold text-primary text-sm">{getIcon(integration.type)}</span>
            </div>
            <div>
              <h3 className="font-semibold">{integration.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
              {integration.lastSync && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last sync: {new Date(integration.lastSync).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <StatusIndicator status={integration.status} />
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid={`button-configure-${integration.id}`}>
                <Settings2 className="h-4 w-4 mr-2" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure {integration.name}</DialogTitle>
                <DialogDescription>
                  Enter your API credentials to connect to {integration.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input id="api-key" type="password" placeholder="Enter your API key" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api-secret">API Secret</Label>
                  <Input id="api-secret" type="password" placeholder="Enter your API secret" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint URL</Label>
                  <Input id="endpoint" placeholder="https://api.example.com/v1" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Test Connection</Button>
                <Button>Save Configuration</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Docs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Integrations() {
  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect to government databases for identity verification
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">External Data Sources</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cross-reference identity information with official databases
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {integrations?.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
              {(!integrations || integrations.length === 0) && (
                <div className="text-center py-12">
                  <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No integrations configured</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold">Need a custom integration?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Contact our team to add support for additional data sources.
              </p>
            </div>
            <Button variant="outline">Contact Support</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
