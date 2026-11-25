import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import type { CheckStatus } from "@/lib/compliance";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const tab = "px-4 py-1.5 text-sm rounded-sm transition-colors";
  return (
    <div className="min-h-screen font-sans">
      <header className="no-print border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div>
              <div className="font-display text-lg leading-none font-semibold">Corridor Clear</div>
              <div className="text-[11px] tracking-wide text-muted-foreground uppercase">Kenya · East Africa right-to-work & payouts</div>
            </div>
          </Link>
          <nav className="flex rounded-md border bg-muted p-1">
            <Link to="/" className={tab} activeOptions={{ exact: true }} activeProps={{ className: "bg-primary text-primary-foreground" }}>Candidate Portal</Link>
            <Link to="/employer" className={tab} activeProps={{ className: "bg-primary text-primary-foreground" }}>Employer Dashboard</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="no-print mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground">
        Advancing SDG 8 · 10 · 16 — decent work, reduced inequality, legal identity. Verification steps are simulated for demonstration.
      </footer>
    </div>
  );
}

export function StatusPill({ status, labels }: { status: CheckStatus; labels?: Partial<Record<CheckStatus, string>> }) {
  const text = labels?.[status] ?? { pending: "Pending", running: "Checking…", passed: "Passed", flagged: "Flagged" }[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      status === "passed" && "bg-success/15 text-success",
      status === "flagged" && "bg-destructive/15 text-destructive",
      status === "running" && "bg-warning/20 text-accent-foreground animate-pulse",
      status === "pending" && "bg-muted text-muted-foreground")}>{text}</span>
  );
}
