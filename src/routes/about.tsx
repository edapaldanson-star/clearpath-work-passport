import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/about")({
  head: () => pageHead("About Us", "ClearPath Work Passport aims to reduce administrative barriers for refugees, displaced talent, foreign residents and Kenyan job seekers."),
  component: About,
});

function About() {
  return <AppShell><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Talent has no borders</p><h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight font-bold">About ClearPath Work Passport</h1><p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">Qualified people deserve a fair chance to work. Administrative uncertainty should not be the reason their talent goes unseen.</p><div className="mt-10 grid gap-10 border-t pt-8 md:grid-cols-2"><section><h2 className="font-display text-xl font-bold">Our purpose</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">We bring identity, tax information and payout preparation into a clearer onboarding journey for Kenya and the East African corridor. We welcome refugees, displaced people, foreign residents and Kenyan job seekers — and help employers review their information thoughtfully.</p><p className="mt-4 text-sm leading-relaxed text-muted-foreground">Our mission supports SDG 8 (decent work), SDG 10 (reduced inequalities) and SDG 16 (peace, justice and strong institutions).</p></section><section><h2 className="font-display text-xl font-bold">Trust through honesty</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">This is a hackathon demonstration, not a government service, recruitment agency or legal adviser. Checks are simulated except for the optional advisory AI document-photo review. Employment and immigration requirements need independent review.</p><Button asChild variant="outline" className="mt-5"><Link to="/privacy">Privacy & data information</Link></Button></section></div><section className="mt-10 border-t pt-8"><h2 className="font-display text-xl font-bold">Contact</h2><p className="mt-3 text-sm text-muted-foreground">Project by Edapal Danson. Public contact email will be added when confirmed.</p></section></AppShell>;
}