import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ClipboardList, 
  Download, 
  Filter, 
  Search, 
  FileCheck,
  FileX,
  Upload,
  Settings,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userId: string;
  userName: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  timestamp: string;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

interface AuditStats {
  totalLogs: number;
  actionBreakdown: { action: string; count: number }[];
  dailyActivity: { date: string; count: number }[];
}

const actionLabels: Record<string, { label: string; icon: typeof FileCheck; color: string }> = {
  document_uploaded: { label: "Document Uploaded", icon: Upload, color: "bg-blue-500/10 text-blue-600" },
  verification_approved: { label: "Approved", icon: FileCheck, color: "bg-green-500/10 text-green-600" },
  verification_rejected: { label: "Rejected", icon: FileX, color: "bg-red-500/10 text-red-600" },
  verification_status_changed: { label: "Status Changed", icon: ClipboardList, color: "bg-amber-500/10 text-amber-600" },
  settings_updated: { label: "Settings Updated", icon: Settings, color: "bg-purple-500/10 text-purple-600" },
};

export default function AuditTrailPage() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const buildQueryKey = () => {
    const params = new URLSearchParams();
    if (actionFilter && actionFilter !== "all") params.set("action", actionFilter);
    if (entityTypeFilter && entityTypeFilter !== "all") params.set("entityType", entityTypeFilter);
    params.set("limit", limit.toString());
    params.set("offset", (page * limit).toString());
    return `/api/audit-logs?${params.toString()}`;
  };

  const { data: logsData, isLoading: logsLoading } = useQuery<AuditLogsResponse>({
    queryKey: [buildQueryKey()],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AuditStats>({
    queryKey: ["/api/audit-logs/stats"],
  });

  const handleExport = () => {
    const params = new URLSearchParams();
    if (actionFilter && actionFilter !== "all") params.set("action", actionFilter);
    if (entityTypeFilter && entityTypeFilter !== "all") params.set("entityType", entityTypeFilter);
    window.open(`/api/audit-logs/export?${params.toString()}`, "_blank");
  };

  const getActionDisplay = (action: string) => {
    const display = actionLabels[action] || { label: action, icon: ClipboardList, color: "bg-muted text-muted-foreground" };
    const IconComponent = display.icon;
    return (
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-md ${display.color}`}>
          <IconComponent className="h-3.5 w-3.5" />
        </div>
        <span className="font-medium">{display.label}</span>
      </div>
    );
  };

  const formatDetails = (details: Record<string, unknown> | null): string => {
    if (!details) return "-";
    const relevantKeys = ["customerName", "documentType", "oldStatus", "newStatus", "riskScore"];
    const parts: string[] = [];
    for (const key of relevantKeys) {
      if (details[key] !== undefined) {
        parts.push(`${key}: ${details[key]}`);
      }
    }
    return parts.length > 0 ? parts.join(", ") : JSON.stringify(details).slice(0, 100);
  };

  const filteredLogs = logsData?.logs.filter(log => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      log.userName.toLowerCase().includes(searchLower) ||
      log.entityId?.toLowerCase().includes(searchLower) ||
      formatDetails(log.details).toLowerCase().includes(searchLower)
    );
  }) || [];

  const totalPages = Math.ceil((logsData?.total || 0) / limit);

  if (logsLoading && statsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Audit Trail</h1>
          <p className="text-muted-foreground mt-1">
            Track all verification activities and compliance events
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" data-testid="button-export-logs">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-total-logs">
                  {stats?.totalLogs || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-approved-count">
                  {stats?.actionBreakdown.find(a => a.action === "verification_approved")?.count || 0}
                </p>
                <p className="text-sm text-muted-foreground">Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <FileX className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-rejected-count">
                  {stats?.actionBreakdown.find(a => a.action === "verification_rejected")?.count || 0}
                </p>
                <p className="text-sm text-muted-foreground">Rejections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-semibold">Activity Log</CardTitle>
              <CardDescription>
                Detailed record of all system activities
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px]"
                  data-testid="input-search-logs"
                />
              </div>
              <Select value={actionFilter} onValueChange={(val) => { setActionFilter(val); setPage(0); }}>
                <SelectTrigger className="w-[180px]" data-testid="select-action-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="document_uploaded">Document Uploaded</SelectItem>
                  <SelectItem value="verification_approved">Approved</SelectItem>
                  <SelectItem value="verification_rejected">Rejected</SelectItem>
                  <SelectItem value="verification_status_changed">Status Changed</SelectItem>
                  <SelectItem value="settings_updated">Settings Updated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={entityTypeFilter} onValueChange={(val) => { setEntityTypeFilter(val); setPage(0); }}>
                <SelectTrigger className="w-[160px]" data-testid="select-entity-filter">
                  <SelectValue placeholder="Entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No audit logs found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Activity logs will appear here as users interact with the system
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[200px]">Action</TableHead>
                      <TableHead className="w-[120px]">Entity Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="w-[120px]">User</TableHead>
                      <TableHead className="w-[120px]">IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-audit-${log.id}`}>
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {log.timestamp ? format(parseISO(log.timestamp), "MMM dd, HH:mm:ss") : "-"}
                          </div>
                        </TableCell>
                        <TableCell>{getActionDisplay(log.action)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {log.entityType}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                          {formatDetails(log.details)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{log.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {log.ipAddress || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {page * limit + 1} to {Math.min((page + 1) * limit, logsData?.total || 0)} of {logsData?.total || 0} entries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {page + 1} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= totalPages - 1}
                    data-testid="button-next-page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
