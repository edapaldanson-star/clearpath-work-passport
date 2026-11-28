import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("Privacy & Data", "Understand browser-only storage, sensitive-data masking and optional AI document review in the ClearPath Work Passport demonstration."),
  component: Privacy,
});

function Privacy() {
  return <AppShell><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Know where your information goes</p><h1 className="mt-3 font-display text-4xl font-bold">Privacy & Data</h1><div className="mt-8 max-w-3xl space-y-8 text-sm leading-relaxed">{[
    ["Use fictional information for this demo", "ClearPath Work Passport does not yet have account-based access controls or shared dossier storage. Anyone using the same browser can access its saved candidate files. Do not enter real identity, tax or financial details on a shared device."],
    ["Browser-only records", "Candidate details and audit history are saved in this browser’s local storage. They are not synchronised to other devices. The simulated upload stores the filename and generated fields, not a reusable original document image. Clearing site data may remove your saved files."],
    ["Optional AI document review", "When you choose a document for AI review, that file is sent to a server-side model through Lovable AI Gateway for readability guidance. This is separate from the simulated onboarding upload. Avoid sending sensitive documents until you have reviewed the service’s data-handling terms; this project makes no claim about provider retention."],
    ["Safer summaries and exports", "Document numbers, tax identifiers, birth dates and payout details are hidden or masked in employer summaries and default dossier downloads. The dossier has an explicit option to reveal private details. Revealing them also includes them in printouts and downloads, so share carefully. Masking is not encryption or access control."],
    ["No official verification", "OCR, sanctions/PEP, tax and payout status are demonstrations or information-completeness checks. They are not evidence of government clearance, a valid bank account or legal permission to work."],
  ].map(([title, text]) => <section key={title} className="border-t pt-5"><h2 className="font-display text-lg font-bold">{title}</h2><p className="mt-3 text-muted-foreground">{text}</p></section>)}</div></AppShell>;
}