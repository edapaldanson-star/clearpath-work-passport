import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowUpRight, Menu, X, ShieldCheck } from "lucide-react";
import type { CheckStatus } from "@/lib/compliance";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/Brand";

const navigation = [
  { to: "/", label: "Home" }, { to: "/onboarding", label: "Candidate Onboarding" },
  { to: "/employer", label: "Employer Dashboard" }, { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About Us" },
] as const;

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen font-sans">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-card focus:p-3">Skip to content</a>
      <header className="no-print border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-5 px-5 py-4 lg:flex lg:justify-between lg:px-8">
          <Link to="/" aria-label="ClearPath Work Passport home" className="min-w-0"><Brand /></Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => <Link key={item.to} to={item.to} activeOptions={{ exact: true }} className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary" activeProps={{ className: "text-primary" }}>{item.label}</Link>)}
          </nav>
          <Button className="hidden lg:inline-flex" asChild><Link to="/onboarding">Get Started <ArrowUpRight /></Link></Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
        </div>
        {menuOpen && <nav id="mobile-nav" aria-label="Mobile navigation" className="grid gap-1 border-t px-5 py-3 lg:hidden">{navigation.map((item) => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="rounded-sm px-3 py-3 text-sm hover:bg-muted" activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-primary font-semibold" }}>{item.label}</Link>)}</nav>}
      </header>
      <main id="main-content" className={wide ? "" : "mx-auto max-w-6xl px-5 py-8 sm:py-10"}>{children}</main>
      <footer className="no-print border-t bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-[2fr_1fr_1fr] lg:px-8">
          <div><Brand /><p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">Talent has no borders. Opportunity should have a clear path.<br />Built for Kenya and the East African corridor.</p></div>
          <div><h2 className="text-sm font-semibold">Explore</h2><div className="mt-3 grid gap-3 text-sm text-muted-foreground"><Link to="/how-it-works">How It Works</Link><Link to="/about">About Us</Link><Link to="/employer">Employer Portal</Link></div></div>
          <div><h2 className="text-sm font-semibold">Trust & contact</h2><div className="mt-3 grid gap-3 text-sm text-muted-foreground"><Link to="/privacy">Privacy & data</Link><Link to="/about">Contact the project team</Link><span>SDG 8 · 10 · 16</span></div></div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t px-5 py-5 text-xs text-muted-foreground lg:px-8"><span>© 2026 ClearPath Work Passport</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 shrink-0" />Demonstration platform · no official verification</span></div>
      </footer>
    </div>
  );
}

export function StatusPill({ status, labels }: { status: CheckStatus; labels?: Partial<Record<CheckStatus, string>> }) {
    const text = labels?.[status] ?? { pending: "Pending", running: "Demo check…", passed: "Demo passed", flagged: "Needs review" }[status];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      status === "passed" && "bg-success/15 text-success",
      status === "flagged" && "bg-destructive/15 text-destructive",
      status === "running" && "bg-warning/20 text-accent-foreground animate-pulse",
      status === "pending" && "bg-muted text-muted-foreground")}>{text}</span>
  );
}
