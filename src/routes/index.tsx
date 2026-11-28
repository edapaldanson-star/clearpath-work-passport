import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Globe2, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { HowSteps } from "@/components/HowSteps";
import { pageHead } from "@/lib/page-head";
import community from "@/assets/work-community.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => pageHead("Your Talent Deserves a Clear Path to Work", "ClearPath Work Passport helps refugees, displaced people, foreign residents and Kenyan job seekers organise employment eligibility, compliance documents and payout information."),
  component: Home,
});

function Home() {
  return <AppShell wide>
    <section className="relative isolate overflow-hidden bg-ink text-on-ink">
      <img src={community.url} alt="Three professionals working together in a bright Nairobi office" className="absolute inset-0 -z-20 h-full w-full object-cover object-center" fetchPriority="high" />
      <div className="hero-wash absolute inset-0 -z-10" />
      <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-on-ink-muted"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Opportunity beyond borders</p>
          <p className="mb-3 text-sm font-medium text-on-ink-muted">ClearPath Work Passport</p>
          <h1 className="font-display text-4xl leading-[1.16] font-extrabold sm:text-5xl">Your Talent Deserves a Clear Path to Work.</h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-on-ink-muted">Your skills matter. Your paperwork shouldn’t hold you back. Organise your employment eligibility, compliance documents and payment details — and take your next step with confidence.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="h-12"><Link to="/onboarding">Get Started <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline" className="h-12 border-on-ink/40 bg-transparent text-on-ink hover:bg-on-ink/10 hover:text-on-ink"><Link to="/employer">Employer Portal <ArrowUpRight /></Link></Button></div>
          <p className="mt-6 flex items-center gap-2 text-xs text-on-ink-muted"><Globe2 className="h-4 w-4 shrink-0" />For Kenya & the East African corridor</p>
        </div>
      </div>
    </section>
    <section className="border-b bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:grid-cols-3 lg:px-8">{[{ icon: Users, title: "Talent without borders", text: "Refugees, residents & Kenyan job seekers" }, { icon: ShieldCheck, title: "Clarity at every step", text: "One organised employment dossier" }, { icon: HeartHandshake, title: "A fairer way forward", text: "Supporting SDGs 8, 10 & 16" }].map(({ icon: Icon, title, text }) => <div key={title} className="flex items-center gap-3"><Icon className="h-6 w-6 shrink-0 text-primary" /><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{text}</p></div></div>)}</div></section>
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16"><div className="mb-9 grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto]"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">From paperwork to possibility</p><h2 className="mt-3 font-display text-3xl font-bold">A clearer journey. One step at a time.</h2></div><Link to="/how-it-works" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">How It Works <ArrowUpRight className="h-4 w-4" /></Link></div><HowSteps /></section>
    <section className="border-y bg-muted/60"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Built around people</p><h2 className="mt-3 font-display text-3xl font-bold">Different journeys. Shared opportunity.</h2><div className="mt-9 grid gap-8 md:grid-cols-3">{[{ icon: HeartHandshake, title: "Refugees & displaced talent", text: "Bring your experience forward. Organise registration and identity documents, with clear employer review of applicable work permissions." }, { icon: Users, title: "Job seekers & foreign residents", text: "Keep identity, tax and payout information together. Spend less time repeating your paperwork and more time preparing for your next opportunity." }, { icon: BriefcaseBusiness, title: "Employers & hiring teams", text: "Review organised candidate dossiers, follow compliance progress and record onboarding decisions in one clear workspace." }].map(({ icon: Icon, title, text }) => <div key={title} className="border-l-2 border-primary/30 pl-5"><Icon className="mb-4 h-6 w-6 text-primary" /><h3 className="font-display text-lg font-bold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></div>)}</div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8"><div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Purpose, not just paperwork</p><h2 className="mt-3 font-display text-3xl font-bold">A path toward more inclusive work.</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Our mission aligns with the UN Sustainable Development Goals. These are the outcomes we aim to support, not measured impact claims.</p></div><div className="grid gap-5 sm:grid-cols-3">{[{ n: "08", title: "Decent work", text: "Reduce administrative barriers to employment.", tone: "bg-sdg-work" }, { n: "10", title: "Reduced inequalities", text: "Make pathways more inclusive for displaced talent.", tone: "bg-sdg-equity" }, { n: "16", title: "Peace, justice & institutions", text: "Support clear documentation and accountable review.", tone: "bg-sdg-justice" }].map((goal) => <div key={goal.n}><span className={`mb-4 grid h-12 w-12 place-items-center rounded-sm font-display text-xl font-bold text-on-ink ${goal.tone}`}>{goal.n}</span><h3 className="text-sm font-bold">{goal.title}</h3><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{goal.text}</p></div>)}</div></div></section>
    <section className="bg-ink text-on-ink"><div className="mx-auto grid max-w-7xl items-center gap-7 px-5 py-10 sm:grid-cols-[minmax(0,1fr)_auto] lg:px-8"><div><h2 className="font-display text-2xl font-bold">Your next chapter starts with a clear path.</h2><p className="mt-2 text-sm text-on-ink-muted">Organise your file. Bring your talent. Move forward.</p></div><Button asChild size="lg" className="h-12"><Link to="/onboarding">Start Your Journey <ArrowRight /></Link></Button></div></section>
  </AppShell>;
}
