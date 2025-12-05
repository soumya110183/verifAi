import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopNavbar } from "@/components/TopNavbar";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import Upload from "@/pages/Upload";
import VerificationDetail from "@/pages/VerificationDetail";
import Integrations from "@/pages/Integrations";
import Patterns from "@/pages/Patterns";
import Settings from "@/pages/Settings";
import AuditTrail from "@/pages/AuditTrail";
import AIArchitecture from "@/pages/AIArchitecture";
import TechnicalDetails from "@/pages/TechnicalDetails";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/upload" component={Upload} />
      <Route path="/verification/:id" component={VerificationDetail} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/patterns" component={Patterns} />
      <Route path="/settings" component={Settings} />
      <Route path="/audit" component={AuditTrail} />
      <Route path="/ai-architecture" component={AIArchitecture} />
      <Route path="/technical-details" component={TechnicalDetails} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main>
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthenticatedApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
