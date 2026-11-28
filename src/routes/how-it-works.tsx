import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { HowSteps } from "@/components/HowSteps";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/how-it-works")({
  head: () => pageHead("How It Works", "Four steps to organise identity, tax, payout details and an employer-reviewed dossier with ClearPath Work Passport."),
  component: HowItWorks,
});

function HowItWorks() {
  return <AppShell><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Your path, made clearer</p><h1 className="mt-3 font-display text-4xl font-bold">How It Works</h1><p className="mt-5 mb-10 max-w-2xl leading-relaxed text-muted-foreground">From your first document to an organised employer dossier, each step brings your information together for a more informed onboarding decision.</p><HowSteps /><section className="mt-12 border-t pt-8"><h2 className="font-display text-xl font-bold">What the demonstration does — and doesn’t do</h2><div className="mt-4 grid gap-6 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2"><p>Document processing, authenticity, sanctions/PEP screening and payout checks are simulated. A valid KRA PIN format is not a tax-clearance result. No government or payment-provider verification is connected.</p><p>AI photo review provides advisory readability guidance only. Employer approval in this demo is not a legal work permit. Refugee registration alone does not grant work authorisation; applicable permissions must be reviewed separately.</p></div><p className="mt-4 text-sm text-muted-foreground">Files currently remain in this browser. Other devices do not receive them, and access is not protected by account sign-in. Use fictional details for demonstrations.</p></section><div className="mt-8 flex flex-wrap gap-3"><Button asChild><Link to="/onboarding">Get Started <ArrowRight /></Link></Button><Button variant="outline" asChild><Link to="/employer">Employer Portal</Link></Button></div></AppShell>;
}