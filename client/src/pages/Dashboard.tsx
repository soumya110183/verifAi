import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  FileCheck, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DashboardStats, Verification } from "@shared/schema";

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection,
  loading,
}: {
  title: string;
  value: string | number;
  icon: typeof FileCheck;
  trend?: string;
  trendDirection?: "up" | "down";
  loading?: boolean;
}) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              {trend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  trendDirection === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}>
                  {trendDirection === "up" ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {trend}
                </div>
              )}
            </div>
            <div className="text-4xl font-bold tracking-tight">{value}</div>
            <p className="text-sm text-muted-foreground mt-1">{title}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Verification["status"] }) {
  const variants: Record<Verification["status"], { label: string; className: string }> = {
    approved: { label: "Approved", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    in_review: { label: "In Review", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  };
  const { label, className } = variants[status];
  return (
    <Badge variant="outline" className={`${className} border-0 font-medium`}>
      {label}
    </Badge>
  );
}

function DocumentTypeBadge({ type }: { type: Verification["documentType"] }) {
  const labels: Record<Verification["documentType"], string> = {
    passport: "Passport",
    drivers_license: "Driver's License",
    national_id: "National ID",
  };
  return (
    <span className="text-sm text-muted-foreground">{labels[type]}</span>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard"],
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of KYC verification operations
          </p>
        </div>
        <Link href="/upload">
          <Button size="default" data-testid="button-new-verification">
            <Plus className="h-4 w-4 mr-2" />
            New Verification
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Verifications"
          value={stats?.totalVerifications ?? 0}
          icon={FileCheck}
          loading={isLoading}
        />
        <MetricCard
          title="Auto-Approval Rate"
          value={`${stats?.autoApprovalRate ?? 0}%`}
          icon={TrendingUp}
          loading={isLoading}
        />
        <MetricCard
          title="Pending Review"
          value={stats?.pendingReview ?? 0}
          icon={Clock}
          loading={isLoading}
        />
        <MetricCard
          title="High Risk Flags"
          value={stats?.highRiskFlags ?? 0}
          icon={AlertTriangle}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Verification Volume</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="text-xs">7D</Button>
              <Button variant="secondary" size="sm" className="text-xs">30D</Button>
              <Button variant="ghost" size="sm" className="text-xs">90D</Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <div className="h-80" data-testid="chart-volume">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.volumeData ?? []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Recent Verifications</CardTitle>
            <Link href="/verifications">
              <Button variant="ghost" size="sm" className="text-xs" data-testid="link-view-all">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {stats?.recentVerifications?.slice(0, 5).map((verification) => (
                  <Link
                    key={verification.id}
                    href={`/verification/${verification.id}`}
                  >
                    <div 
                      className="flex items-center justify-between py-3 cursor-pointer hover-elevate rounded-md -mx-2 px-2"
                      data-testid={`verification-item-${verification.id}`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {verification.customerName || `Document ${verification.id.slice(0, 8)}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <DocumentTypeBadge type={verification.documentType} />
                          <span className="text-xs text-muted-foreground">
                            {new Date(verification.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={verification.status} />
                    </div>
                  </Link>
                ))}
                {(!stats?.recentVerifications || stats.recentVerifications.length === 0) && (
                  <div className="py-8 text-center text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No verifications yet</p>
                    <Link href="/upload">
                      <Button variant="ghost" className="mt-2 underline" data-testid="link-start-first">
                        Start your first verification
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
