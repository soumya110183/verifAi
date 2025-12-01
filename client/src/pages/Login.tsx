import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock, User } from "lucide-react";
import verifaiHero from "@assets/VerifAI (1)_1764611697534.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    login(
      { username, password },
      {
        onError: () => {
          setError("Invalid credentials. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-5xl flex items-stretch rounded-xl overflow-hidden shadow-2xl">
        <div className="hidden lg:flex lg:w-1/2 bg-[#050d1a] items-center justify-center">
          <img 
            src={verifaiHero} 
            alt="VerifAI - AI-Powered KYC Verification Platform" 
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="w-full lg:w-1/2 bg-white p-6 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6 lg:hidden">
              <h1 className="text-2xl font-bold text-slate-900">VerifAI</h1>
              <p className="text-slate-600 mt-1 text-sm">AI-Powered KYC Verification Platform</p>
            </div>

            <Card className="shadow-none border-0">
              <CardHeader className="space-y-1 px-0 pb-4">
                <CardTitle className="text-xl">Sign In</CardTitle>
                <CardDescription className="text-sm">
                  Enter your credentials to access the platform
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pt-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md text-sm" data-testid="error-login">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10"
                        data-testid="input-username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        data-testid="input-password"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoggingIn}
                    data-testid="button-login"
                  >
                    {isLoggingIn ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
