import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Tracker } from "@/components/Tracker";
import { Button } from "@/components/ui/button";
import { useStore, DOC_LABELS, WORK_BASIS, stageStatus } from "@/lib/compliance";

export const Route = createFileRoute("/dossier/$id")({
  head: () => ({
    meta: [
      { title: "Compliance Certificate & Audit Dossier — Corridor Clear" },
      { name: "description", content: "Right-to-work and payment compliance certificate with a full audit trail." },
      { property: "og:title", content: "Compliance Certificate & Audit Dossier" },
      { property: "og:description", content: "Verifiable right-to-work and payout compliance record." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dossier,
});

function Dossier() {
  const { id } = Route.useParams();
  const c = useStore().candidates.find((x) => x.id === id);
  if (!c) return <AppShell><p>Dossier not found. <Link className="underline" to="/employer">Back</Link></p></AppShell>;
  const s = stageStatus(c);
  const download = () => {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${c.id}-dossier.json`; a.click();
  };
  return (
    <AppShell>
      <div className="no-print mb-4 flex gap-2"><Button onClick={() => window.print()}>Print / Save PDF</Button><Button variant="outline" onClick={download}>Download JSON</Button></div>
      <article className="rounded-lg border-2 border-primary bg-card p-8">
        <header className="border-b pb-4 text-center">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Certificate of compliance clearance</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">{c.identity.extracted?.fullName || "Unnamed candidate"}</h1>
          <p className="mt-1 text-sm">{c.identity.docType && DOC_LABELS[c.identity.docType]} · <span className="font-mono">{c.identity.extracted?.docNumber}</span></p>
          <p className={`mt-3 inline-block rounded px-3 py-1 text-sm font-semibold ${s.ready ? "bg-success/15 text-success" : "bg-warning/20 text-accent-foreground"}`}>{s.ready ? "CLEARED — READY TO WORK" : `IN PROGRESS — ${c.review.status.toUpperCase()}`}</p>
        </header>
        <div className="my-6"><Tracker c={c} /></div>
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-xs text-muted-foreground">Right-to-work basis</dt><dd>{c.identity.docType && WORK_BASIS[c.identity.docType]}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Tax</dt><dd>{c.tax.residency === "resident" ? `KRA PIN ${c.tax.kraPin}` : c.tax.residency === "non_resident" ? `W-8BEN (${c.tax.countryOfResidence}) signed ${c.tax.w8SignedAt?.slice(0, 10) ?? "—"}` : "—"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Payout rail</dt><dd>{c.payout.rail === "mpesa" ? `M-Pesa ${c.payout.mpesaPhone}` : c.payout.rail === "pesalink" ? `Pesalink · ${c.payout.bank} ****${c.payout.accountNumber.slice(-4)}` : c.payout.rail === "multicurrency" ? `${c.payout.provider} ${c.payout.currency}` : "—"}</dd></div>
        </dl>
        <h2 className="mt-8 mb-2 font-display text-xl font-semibold">Audit trail</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted-foreground"><th className="py-1">Timestamp (UTC)</th><th>Actor</th><th>Event</th></tr></thead>
          <tbody>{c.audit.map((e, i) => <tr key={i} className="border-b align-top"><td className="py-1.5 pr-3 font-mono text-xs whitespace-nowrap">{e.at.replace("T", " ").slice(0, 19)}</td><td className="pr-3">{e.actor}</td><td>{e.action}</td></tr>)}</tbody>
        </table>
        <p className="mt-6 font-mono text-xs text-muted-foreground">Dossier {c.id} · opened {c.createdAt.slice(0, 10)} · verification simulated for demonstration</p>
      </article>
    </AppShell>
  );
}
