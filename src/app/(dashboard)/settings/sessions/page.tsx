"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Monitor, MapPin, Clock, Trash2, LogOut, Info, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useSessions, useRevokeSession, useRevokeAllSessions } from "@/hooks/use-sessions";
import { Session } from "@/lib/types";

// ---- date helpers (no external dependency) --------------------------------

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function fmtDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

function timeAgo(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

function SessionDetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="break-all">{value ?? <span className="text-muted-foreground italic">Unknown</span>}</span>
    </div>
  );
}

function SessionDetailsDialog({
  session,
  open,
  onOpenChange,
}: {
  session: Session | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Session Details
            {session.isCurrent && <Badge variant="secondary">Current</Badge>}
          </DialogTitle>
          <DialogDescription>Full information for this session.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <SessionDetailRow label="Session ID" value={<code className="text-xs">{session.id}</code>} />
          <Separator />
          <SessionDetailRow label="IP Address" value={session.ipAddress} />
          <SessionDetailRow
            label="Location"
            value={
              session.city || session.country
                ? [session.city, session.country].filter(Boolean).join(", ")
                : null
            }
          />
          <Separator />
          <SessionDetailRow label="OS" value={session.os} />
          <SessionDetailRow label="Platform / Browser" value={session.platform} />
          <SessionDetailRow
            label="User Agent"
            value={
              session.userAgent ? (
                <span className="text-xs text-muted-foreground break-all">{session.userAgent}</span>
              ) : null
            }
          />
          <Separator />
          <SessionDetailRow
            label="Created"
            value={fmtDate(session.createdAt)}
          />
          <SessionDetailRow
            label="Last used"
            value={fmtDate(session.lastLogin)}
          />
          <SessionDetailRow
            label="Token expires"
            value={fmtDate(session.expires)}
          />
          <SessionDetailRow
            label="Refresh expires"
            value={fmtDate(session.refreshExpires)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SessionsPage() {
  const router = useRouter();
  const { data: sessions, isLoading, error } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAll = useRevokeAllSessions();

  const [detailSession, setDetailSession] = React.useState<Session | null>(null);
  const [revokeTarget, setRevokeTarget] = React.useState<Session | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = React.useState(false);
  const [revokeOthersOpen, setRevokeOthersOpen] = React.useState(false);

  const otherSessions = sessions?.filter((s) => !s.isCurrent) ?? [];

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    const isCurrentSession = revokeTarget.isCurrent;
    try {
      await revokeSession.mutateAsync(revokeTarget.id);
      toast.success("Session revoked successfully.");
      setRevokeTarget(null);
      if (isCurrentSession) {
        router.push("/login");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke session.");
    }
  };

  const handleRevokeAll = async () => {
    if (!sessions) return;
    try {
      await revokeAll.mutateAsync(sessions);
      toast.success("All sessions revoked.");
      setRevokeAllOpen(false);
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke all sessions.");
    }
  };

  const handleRevokeOthers = async () => {
    try {
      await revokeAll.mutateAsync(otherSessions);
      toast.success("All other sessions revoked.");
      setRevokeOthersOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to revoke other sessions.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">Manage your active sessions</p>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load sessions. Please refresh the page.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground">
          View and manage all devices where you are currently signed in.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Sessions list */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                {sessions?.length === 1
                  ? "1 active session"
                  : `${sessions?.length ?? 0} active sessions`}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {otherSessions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRevokeOthersOpen(true)}
                  disabled={revokeAll.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Revoke other sessions
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setRevokeAllOpen(true)}
                disabled={revokeAll.isPending || !sessions?.length}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Revoke all sessions
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {!sessions?.length ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                No active sessions found.
              </div>
            ) : (
              <div className="divide-y">
                {sessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    onDetails={() => setDetailSession(session)}
                    onRevoke={() => setRevokeTarget(session)}
                    isRevoking={revokeSession.isPending && revokeTarget?.id === session.id}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card>
          <CardContent className="flex items-start gap-3 py-4">
            <Shield className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              Revoking a session immediately signs that device out. If you revoke your current session,
              you will be redirected to the login page. Revoking all sessions logs you out everywhere.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Session details dialog */}
      <SessionDetailsDialog
        session={detailSession}
        open={!!detailSession}
        onOpenChange={(v) => { if (!v) setDetailSession(null); }}
      />

      {/* Revoke specific session confirmation */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => { if (!open && !revokeSession.isPending) setRevokeTarget(null); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke session?</AlertDialogTitle>
            <AlertDialogDescription>
              {revokeTarget?.isCurrent
                ? "This is your current session. Revoking it will sign you out immediately."
                : "The device associated with this session will be signed out immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeSession.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleRevoke(); }}
              disabled={revokeSession.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeSession.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Revoking...</>
              ) : (
                "Revoke session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke all confirmation */}
      <AlertDialog open={revokeAllOpen} onOpenChange={(v) => { if (!revokeAll.isPending) setRevokeAllOpen(v); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke all sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              All sessions, including your current one, will be immediately revoked. You will be
              redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeAll.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleRevokeAll(); }}
              disabled={revokeAll.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeAll.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Revoking...</>
              ) : (
                "Revoke all"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke other sessions confirmation */}
      <AlertDialog open={revokeOthersOpen} onOpenChange={(v) => { if (!revokeAll.isPending) setRevokeOthersOpen(v); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke all other sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              All sessions except your current one will be immediately revoked. You will remain
              signed in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeAll.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleRevokeOthers(); }}
              disabled={revokeAll.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokeAll.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Revoking...</>
              ) : (
                "Revoke others"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SessionRow({
  session,
  onDetails,
  onRevoke,
  isRevoking,
}: {
  session: Session;
  onDetails: () => void;
  onRevoke: () => void;
  isRevoking: boolean;
}) {
  const location = [session.city, session.country].filter(Boolean).join(", ") || null;
  const deviceLabel = [session.os, session.platform].filter(Boolean).join(" · ") || "Unknown device";
  const lastUsed = timeAgo(new Date(session.lastLogin));

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <Monitor className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium truncate">{deviceLabel}</span>
            {session.isCurrent && (
              <Badge variant="secondary" className="text-xs shrink-0">Current</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {location && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
            {session.ipAddress && (
              <span className="text-xs text-muted-foreground font-mono">{session.ipAddress}</span>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {lastUsed}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="sm" onClick={onDetails}>
          <Info className="h-4 w-4" />
          <span className="sr-only">Details</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRevoke}
          disabled={isRevoking}
        >
          {isRevoking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="sr-only">Revoke</span>
        </Button>
      </div>
    </div>
  );
}
