import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, StatusPill } from "@/components/AppShell";
import { Tracker } from "@/components/Tracker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { actions, useStore, DOC_LABELS, WORK_BASIS, progressPct, stageStatus } from "@/lib/compliance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/employer")({
  head: () => ({
    meta: [
      { title: "Employer Compliance Dashboard — Corridor Clear" },
      { name: "description", content: "Review candidate right-to-work dossiers, tax forms and payout verification, then approve onboarding." },
      { property: "og:title", content: "Employer Compliance Dashboard — Corridor Clear" },
      { property: "og:description", content: "Approve compliant hires across Kenya and East Africa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Employer,
});

function Employer() {
  const { candidates } = useStore();
  const list = candidates.filter((c) => c.review.status !== "draft");
  const [sel, setSel] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const c = list.find((x) => x.id === sel) ?? list[0];
  const counts = { submitted: list.filter((x) => x.review.status === "submitted").length, approved: list.filter((x) => x.review.status === "approved").length, rejected: list.filter((x) => x.review.status === "rejected").length };

  function decide(status: "approved" | "rejected") {
    if (!c) return;
    actions.update(c.id, (x) => { x.review = { status, reviewer: "HR — Nairobi Office", note }; return x; }, { actor: "HR — Nairobi Office", action: `Onboarding ${status}${note ? `: ${note}` : ""}` });
    setNote("");
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Compliance review queue</h1>
        <div className="flex gap-4 font-mono text-sm">
          <span>Awaiting <strong>{counts.submitted}</strong></span><span className="text-success">Approved <strong>{counts.approved}</strong></span><span className="text-destructive">Rejected <strong>{counts.rejected}</strong></span>
          <button className="text-xs text-muted-foreground underline" onClick={() => actions.reset()}>Reset demo</button>
        </div>
      </div>
      {list.length === 0 ? <p className="text-muted-foreground">No submitted dossiers yet.</p> : (
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <ul className="space-y-2">
            {list.map((x) => (
              <li key={x.id}>
                <button onClick={() => setSel(x.id)} className={cn("w-full rounded-md border bg-card p-3 text-left", c?.id === x.id && "border-primary ring-2 ring-primary/30")}>
                  <div className="flex justify-between"><span className="font-medium">{x.identity.extracted?.fullName || "Unnamed"}</span><span className={cn("text-xs capitalize", x.review.status === "approved" ? "text-success" : x.review.status === "rejected" ? "text-destructive" : "text-accent-foreground")}>{x.review.status}</span></div>
                  <div className="text-xs text-muted-foreground">{x.identity.docType ? DOC_LABELS[x.identity.docType] : "—"}</div>
                  <div className="mt-2 h-1.5 rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${progressPct(x)}%` }} /></div>
                </button>
              </li>
            ))}
          </ul>
          {c && (
            <div className="space-y-5 rounded-lg border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div><p className="font-mono text-xs text-muted-foreground">{c.id}</p><h2 className="font-display text-2xl font-semibold">{c.identity.extracted?.fullName}</h2><p className="text-sm text-muted-foreground">{c.identity.docType && WORK_BASIS[c.identity.docType]}</p></div>
                <Button variant="outline" asChild><Link to="/dossier/$id" params={{ id: c.id }}>Open audit dossier</Link></Button>
              </div>
              <Tracker c={c} />
              <div className="grid gap-4 lg:grid-cols-3">
                <section className="rounded-md border p-3 text-sm">
                  <h3 className="mb-2 font-semibold">Identity</h3>
                  <dl className="space-y-1 font-mono text-xs">
                    <div>No: {c.identity.extracted?.docNumber}</div><div>DOB: {c.identity.extracted?.dob}</div><div>Nat: {c.identity.extracted?.nationality}</div><div>Exp: {c.identity.extracted?.expiry}</div>
                  </dl>
                  <div className="mt-2 space-y-1"><div>Authenticity <StatusPill status={c.identity.authenticity} /> {c.identity.authenticityScore}%</div><div>Sanctions <StatusPill status={c.identity.sanctions} /></div><div>PEP <StatusPill status={c.identity.pep} /></div></div>
                </section>
                <section className="rounded-md border p-3 text-sm">
                  <h3 className="mb-2 font-semibold">Tax form</h3>
                  {c.tax.residency === "resident" && <p>KRA PIN <span className="font-mono">{c.tax.kraPin}</span></p>}
                  {c.tax.residency === "non_resident" && <div className="space-y-1"><p>W-8BEN · {c.tax.countryOfResidence}</p><p className="font-mono text-xs">TIN {c.tax.foreignTin || "—"}</p><p>Treaty claim: {c.tax.treatyClaim ? "Yes" : "No"}</p>{c.tax.w8SignedAt && <p className="font-display italic">Signed: {c.tax.w8Signature}</p>}</div>}
                  {!c.tax.residency && <p className="text-destructive">Not provided</p>}
                </section>
                <section className="rounded-md border p-3 text-sm">
                  <h3 className="mb-2 font-semibold">Payout</h3>
                  {c.payout.rail === "mpesa" && <p>M-Pesa <span className="font-mono">{c.payout.mpesaPhone}</span><br />{c.payout.mpesaName}</p>}
                  {c.payout.rail === "pesalink" && <p>{c.payout.bank}<br /><span className="font-mono">{c.payout.accountNumber} / {c.payout.branchCode}</span></p>}
                  {c.payout.rail === "multicurrency" && <p>{c.payout.provider} {c.payout.currency}<br />{c.payout.email}</p>}
                  <div className="mt-2"><StatusPill status={c.payout.payoutVerified} labels={{ passed: "Verified" }} /></div>
                </section>
              </div>
              <section className="rounded-md border bg-muted/40 p-3 text-sm">
                <h3 className="mb-1 font-semibold">Engagement contract</h3>
                <p className="text-muted-foreground">Fixed-term services agreement · Nairobi, Kenya · governed by the Employment Act 2007. Pay via {c.payout.rail ?? "—"}; PAYE / withholding per {c.tax.residency === "non_resident" ? "W-8BEN & non-resident rates" : "KRA iTax"}.</p>
              </section>
              {c.review.status === "submitted" ? (
                <div className="space-y-2">
                  {!stageStatus(c).documents && <p className="text-sm text-destructive">Identity checks are not all clear — manual verification required before approving.</p>}
                  <Textarea placeholder="Reviewer note (e.g. Class M permit ref)" value={note} onChange={(e) => setNote(e.target.value)} />
                  <div className="flex gap-2"><Button onClick={() => decide("approved")}>Approve onboarding</Button><Button variant="destructive" onClick={() => decide("rejected")}>Reject</Button></div>
                </div>
              ) : <p className="text-sm">Decision: <strong className="capitalize">{c.review.status}</strong> by {c.review.reviewer}{c.review.note && ` — ${c.review.note}`}</p>}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
