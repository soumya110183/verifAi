import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Settings as SettingsIcon, Bell, Shield, Sliders, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";

export default function SettingsPage() {
  const { toast } = useToast();
  
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const [localSettings, setLocalSettings] = useState<Settings | null>(null);
  const currentSettings = localSettings ?? settings;

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Settings) => {
      return apiRequest("PUT", "/api/settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setLocalSettings(null);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!currentSettings) return;
    setLocalSettings({
      ...currentSettings,
      [key]: value,
    });
  };

  const hasChanges = localSettings !== null;

  const handleSave = () => {
    if (localSettings) {
      updateSettingsMutation.mutate(localSettings);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your verification preferences
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={updateSettingsMutation.isPending} data-testid="button-save-settings">
            {updateSettingsMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sliders className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Risk Thresholds</CardTitle>
              <CardDescription>Configure automatic approval and flagging boundaries</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-base">Auto-Approval Threshold</Label>
                <p className="text-sm text-muted-foreground">
                  Documents with risk scores below this value will be automatically approved
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold">{currentSettings?.autoApproveThreshold ?? 30}</span>
              </div>
            </div>
            <Slider
              value={[currentSettings?.autoApproveThreshold ?? 30]}
              onValueChange={([value]) => updateSetting("autoApproveThreshold", value)}
              max={100}
              step={5}
              className="w-full"
              data-testid="slider-auto-approve"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 (Very Strict)</span>
              <span>100 (Very Lenient)</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-base">High Risk Threshold</Label>
                <p className="text-sm text-muted-foreground">
                  Documents with risk scores above this value will be flagged for immediate attention
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold">{currentSettings?.highRiskThreshold ?? 70}</span>
              </div>
            </div>
            <Slider
              value={[currentSettings?.highRiskThreshold ?? 70]}
              onValueChange={([value]) => updateSetting("highRiskThreshold", value)}
              max={100}
              step={5}
              className="w-full"
              data-testid="slider-high-risk"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 (Sensitive)</span>
              <span>100 (Less Sensitive)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Automation Rules</CardTitle>
              <CardDescription>Configure automatic actions based on risk factors</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-Reject High Risk</Label>
              <p className="text-sm text-muted-foreground">
                Automatically reject documents that exceed the high risk threshold
              </p>
            </div>
            <Switch
              checked={currentSettings?.autoRejectHighRisk ?? false}
              onCheckedChange={(checked) => updateSetting("autoRejectHighRisk", checked)}
              data-testid="switch-auto-reject"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email alerts for high-risk submissions
              </p>
            </div>
            <Switch
              checked={currentSettings?.emailNotifications ?? true}
              onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
              data-testid="switch-email-notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-base">In-App Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications within the dashboard
              </p>
            </div>
            <Switch
              checked={currentSettings?.inAppNotifications ?? true}
              onCheckedChange={(checked) => updateSetting("inAppNotifications", checked)}
              data-testid="switch-in-app-notifications"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-semibold">Need help with configuration?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our team can help you optimize settings for your compliance needs.
              </p>
            </div>
            <Button variant="outline">Contact Support</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
