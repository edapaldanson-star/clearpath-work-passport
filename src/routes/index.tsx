import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileText, Smartphone, Landmark, Globe, ScanLine, CircleCheck, LoaderCircle } from "lucide-react";
import { AppShell, StatusPill } from "@/components/AppShell";
import { Tracker } from "@/components/Tracker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  actions, useStore, DOC_LABELS, WORK_BASIS, BANKS, simulateOcr, validateUploadFile, validateExpiry, isValidKraPin, normalizeKenyanPhone,
  isValidBankAccount, isValidBranchCode, isValidEmail, stageStatus, type Candidate, type DocType, type PayoutRail,
} from "@/lib/compliance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Candidate Onboarding — Corridor Clear" },
      { name: "description", content: "Verify your identity, tax status and payout account to legally work and get paid in Kenya and East Africa." },
      { property: "og:title", content: "Candidate Onboarding — Corridor Clear" },
      { property: "og:description", content: "Right-to-work, KRA tax and M-Pesa/bank payout onboarding for nationals, foreign residents and refugees." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CandidatePortal,
});

const STEPS = ["Identity", "Tax", "Payout", "Submit"] as const;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function CandidatePortal() {
  const { candidates, activeId } = useStore();
  const c = candidates.find((x) => x.id === activeId);
  const [step, setStep] = useState(0);

  if (!c) {
    return (
      <AppShell>
        <section className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <p className="font-mono text-xs tracking-widest text-accent-foreground uppercase">SDG 8 · 10 · 16</p>
            <h1 className="mt-2 font-display text-4xl leading-tight font-semibold md:text-5xl">Get cleared to work and get paid — without the paperwork maze.</h1>
            <p className="mt-4 max-w-prose text-muted-foreground">One onboarding file for Kenyan nationals, foreign residents and refugee talent. Upload your ID, confirm tax status with KRA or a W-8BEN, and set up M-Pesa, Pesalink or a USD/EUR account.</p>
            <Button size="lg" className="mt-6" onClick={() => { actions.startNew(); setStep(0); }}>Start my onboarding</Button>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <h2 className="font-display text-lg font-semibold">Accepted documents</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {(Object.keys(DOC_LABELS) as DocType[]).map((d) => (
                <li key={d} className="border-l-2 border-accent pl-3"><div className="font-medium">{DOC_LABELS[d]}</div><div className="text-muted-foreground">{WORK_BASIS[d]}</div></li>
              ))}
            </ul>
          </div>
        </section>
      </AppShell>
    );
  }

  const st = stageStatus(c);
  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">File {c.id}</p>
          <h1 className="font-display text-3xl font-semibold">Your onboarding file</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/dossier/$id" params={{ id: c.id }}>View dossier</Link></Button>
          <Button variant="ghost" onClick={() => { actions.startNew(); setStep(0); }}>New file</Button>
        </div>
      </div>
      <div className="mb-6 rounded-lg border bg-card p-4"><Tracker c={c} /></div>
      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <nav className="flex gap-2 md:flex-col">
          {STEPS.map((s, i) => {
            const done = [st.documents, st.tax, st.payout, c.review.status !== "draft"][i];
            return (
              <button key={s} onClick={() => setStep(i)} className={cn("rounded-md border px-3 py-2 text-left text-sm", step === i ? "border-primary bg-primary text-primary-foreground" : "bg-card")}>
                <span className="font-mono">{i + 1}.</span> {s} {done && "✓"}
              </button>
            );
          })}
        </nav>
        <div className="rounded-lg border bg-card p-6">
          {step === 0 && <IdentityStep key={c.id} c={c} />}
          {step === 1 && <TaxStep c={c} />}
          {step === 2 && <PayoutStep c={c} />}
          {step === 3 && <SubmitStep c={c} />}
          {step < 3 && <div className="mt-6 flex justify-end"><Button variant="secondary" onClick={() => setStep(step + 1)}>Continue →</Button></div>}
        </div>
      </div>
    </AppShell>
  );
}

function IdentityStep({ c }: { c: Candidate }) {
  const i = c.identity;
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const upd = (fn: (x: Candidate) => Candidate, log?: string, actor = "Candidate") => actions.update(c.id, fn, log ? { actor, action: log } : undefined);

  const [uploadError, setUploadError] = useState<string | null>(null);
  async function onFile(file: File) {
    if (!i.docType || busy) return;
    const docType = i.docType;
    const err = validateUploadFile(file);
    if (err) { setUploadError(err); return; }
    setUploadError(null);
    setUploadProgress(0);
    setBusy(true);
    upd((x) => { x.identity = { ...x.identity, fileName: file.name, extracted: null, authenticity: "running", sanctions: "pending", pep: "pending", authenticityScore: null }; return x; }, `Uploaded ${DOC_LABELS[docType]} (${file.name})`);
    // Progress reflects the existing simulated processing, not a network transfer.
    for (const value of [10, 20, 30, 40, 50, 60]) {
      await wait(200);
      setUploadProgress(value);
    }
    const r = simulateOcr(docType, file.name);
    upd((x) => { x.identity.extracted = r.extracted; x.identity.authenticityScore = r.score; x.identity.authenticity = r.score >= 85 ? "passed" : "flagged"; x.identity.sanctions = "running"; x.identity.pep = "running"; return x; }, `OCR extracted fields; authenticity score ${r.score}%`, "OCR Engine");
    for (const value of [65, 70, 75, 80, 85, 95]) {
      await wait(200);
      setUploadProgress(value);
    }
    upd((x) => { x.identity.sanctions = "passed"; x.identity.pep = "passed"; return x; }, "Sanctions (UN/OFAC/EU) & PEP screening clear", "Screening");
    setUploadProgress(100);
    setBusy(false);
  }

  const processed = !!i.fileName && !!i.extracted && i.authenticity !== "running" && i.sanctions === "passed" && i.pep === "passed";

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-semibold">Identity & eligibility</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(DOC_LABELS) as DocType[]).map((d) => (
          <Button key={d} variant="outline" disabled={busy} onClick={() => { setUploadError(null); setUploadProgress(0); upd((x) => { x.identity.docType = d; return x; }); }}
            className={cn("block h-auto whitespace-normal rounded-md border p-3 text-left text-sm", i.docType === d ? "border-primary ring-2 ring-primary/30" : "")}>
            <div className="font-medium">{DOC_LABELS[d]}</div>
            <div className="text-xs text-muted-foreground">{WORK_BASIS[d]}</div>
          </Button>
        ))}
      </div>
      {i.docType && (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border-2 border-dashed p-6 text-sm text-muted-foreground hover:bg-muted">
          <Upload className="h-6 w-6" />
          {i.fileName ? <span className="max-w-full break-all text-center"><FileText className="mr-1 inline h-4 w-4" />{i.fileName}{busy ? "" : " — upload again to replace"}</span> : "Upload a photo or PDF of your document"}
          <span className="text-xs">JPG, PNG or PDF · 10 KB – 5 MB</span>
          <input aria-label="Upload identity document" type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void onFile(f); }} />
        </label>
      )}
      {busy && (
        <div className="space-y-2" role="status" aria-live="polite">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2"><LoaderCircle className="h-4 w-4 shrink-0 motion-safe:animate-spin" />{uploadProgress < 60 ? "Processing document" : "Running document checks"} (simulated)</span>
            <span className="font-mono tabular-nums">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} aria-label="Document processing progress" />
        </div>
      )}
      {!busy && processed && (
        <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-md border border-success/40 bg-success/10 p-3 text-sm">
          <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div className="min-w-0">
            <p className="font-medium text-success">Document uploaded successfully · 100%</p>
            <p className="break-all">{i.fileName}</p>
            <p className="mt-1 text-muted-foreground">Processing complete. Confirm the extracted details below.{i.authenticity === "flagged" ? " Manual review needed." : ""}</p>
          </div>
        </div>
      )}
      {uploadError && (
        <div role="alert" className="flex items-start justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <span>{uploadError}</span>
          <Button size="sm" variant="outline" onClick={() => setUploadError(null)}>Try again</Button>
        </div>
      )}
      {(i.authenticity !== "pending") && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">Authenticity</div><StatusPill status={i.authenticity} />{i.authenticityScore !== null && <span className="ml-2 font-mono text-sm">{i.authenticityScore}%</span>}</div>
          <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">Sanctions screening</div><StatusPill status={i.sanctions} /></div>
          <div className="rounded-md border p-3"><div className="text-xs text-muted-foreground">PEP check</div><StatusPill status={i.pep} /></div>
        </div>
      )}
      {i.authenticity === "flagged" && <p className="text-sm text-destructive">Image quality looks low. Retake in good light without glare, or your employer will review manually.</p>}
      {i.extracted && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><ScanLine className="h-4 w-4" /> Extracted details — please confirm</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["fullName", "docNumber", "dob", "nationality", "expiry"] as const).map((k) => (
              <div key={k}>
                <Label htmlFor={`f-${k}`} className="text-xs">{{ fullName: "Full name (as on document)", docNumber: "Document number", dob: "Date of birth", nationality: "Nationality", expiry: "Expiry" }[k]}</Label>
                <Input id={`f-${k}`} value={i.extracted?.[k] ?? ""} className="font-mono" onChange={(e) => upd((x) => { if (x.identity.extracted) x.identity.extracted[k] = e.target.value; return x; })} />
              </div>
            ))}
          </div>
          {(() => { const e = i.docType && i.extracted ? validateExpiry(i.docType, i.extracted.expiry) : null; return e && (
            <div role="alert" className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {e} You can correct the date above if it was misread, or upload a different document.
            </div>
          ); })()}
        </div>
      )}
    </div>
  );
}

function TaxStep({ c }: { c: Candidate }) {
  const t = c.tax;
  const upd = (fn: (x: Candidate) => Candidate, log?: string) => actions.update(c.id, fn, log ? { actor: "Candidate", action: log } : undefined);
  const name = c.identity.extracted?.fullName ?? "";
  const pinOk = isValidKraPin(t.kraPin);
  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-semibold">Tax compliance</h2>
      <div className="flex gap-2">
        {(["resident", "non_resident"] as const).map((r) => (
          <Button key={r} variant={t.residency === r ? "default" : "outline"} onClick={() => upd((x) => { x.tax.residency = r; return x; })}>
            {r === "resident" ? "Kenya tax resident (KRA PIN)" : "Non-resident / foreign payee"}
          </Button>
        ))}
      </div>
      {t.residency === "resident" && (
        <div className="max-w-sm">
          <Label>KRA PIN</Label>
          <Input className="font-mono uppercase" placeholder="A012345678Z" value={t.kraPin} maxLength={11}
            onChange={(e) => upd((x) => { x.tax.kraPin = e.target.value.toUpperCase(); return x; })}
            onBlur={() => { if (pinOk) upd((x) => x, `KRA PIN ${t.kraPin} validated`); }} />
          <p className={cn("mt-1 text-xs", pinOk ? "text-success" : "text-muted-foreground")}>{pinOk ? "Format valid — iTax lookup clear" : "11 characters: A or P, 9 digits, then a letter."}</p>
          <p className="mt-2 text-xs text-muted-foreground">Refugees with a Refugee ID can register a KRA PIN on iTax under "Non-Kenyan Resident".</p>
        </div>
      )}
      {t.residency === "non_resident" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Country of tax residence</Label><Input value={t.countryOfResidence} onChange={(e) => upd((x) => { x.tax.countryOfResidence = e.target.value; return x; })} /></div>
            <div><Label>Foreign tax ID (TIN)</Label><Input className="font-mono" value={t.foreignTin} onChange={(e) => upd((x) => { x.tax.foreignTin = e.target.value; return x; })} /></div>
          </div>
          <div className="rounded-md border bg-muted/50 p-4 text-sm">
            <h3 className="font-display text-lg font-semibold">Form W-8BEN — Certificate of Foreign Status</h3>
            <p className="mt-2 text-muted-foreground">I certify that I am the beneficial owner of the income, I am not a U.S. person, and the income is not effectively connected with a U.S. trade or business. Withholding applies at the statutory rate unless a treaty reduces it.</p>
            <label className="mt-3 flex items-center gap-2"><Checkbox checked={t.treatyClaim} onCheckedChange={(v) => upd((x) => { x.tax.treatyClaim = v === true; return x; })} /> Claim treaty benefits for my country of residence</label>
            {t.w8SignedAt ? (
              <p className="mt-4 font-display text-xl italic">{t.w8Signature} <span className="font-sans text-xs not-italic text-success">— signed {new Date(t.w8SignedAt).toLocaleString()}</span></p>
            ) : (
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <div className="flex-1"><Label>Type your full legal name to sign</Label><Input className="font-display italic" value={t.w8Signature} onChange={(e) => upd((x) => { x.tax.w8Signature = e.target.value; return x; })} /></div>
                <Button disabled={t.w8Signature.trim().length < 3 || !t.countryOfResidence.trim() || (!!name && t.w8Signature.trim().toLowerCase() !== name.trim().toLowerCase())}
                  onClick={() => upd((x) => { x.tax.w8SignedAt = new Date().toISOString(); return x; }, `W-8BEN e-signed${t.treatyClaim ? " (treaty benefits claimed)" : ""}`)}>Sign W-8BEN</Button>
              </div>
            )}
            {!t.w8SignedAt && name && <p className="mt-1 text-xs text-muted-foreground">Signature must match the name on your document: {name}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function PayoutStep({ c }: { c: Candidate }) {
  const p = c.payout;
  const [busy, setBusy] = useState(false);
  const upd = (fn: (x: Candidate) => Candidate, log?: string, actor = "Candidate") => actions.update(c.id, fn, log ? { actor, action: log } : undefined);
  const name = (c.identity.extracted?.fullName || "").toUpperCase();
  const rails: [PayoutRail, string, typeof Smartphone][] = [["mpesa", "M-Pesa", Smartphone], ["pesalink", "Local bank / Pesalink", Landmark], ["multicurrency", "USD / EUR account", Globe]];
  const phone = normalizeKenyanPhone(p.mpesaPhone);
  const valid = p.rail === "mpesa" ? !!phone : p.rail === "pesalink" ? !!p.bank && isValidBankAccount(p.accountNumber) && isValidBranchCode(p.branchCode) : p.rail === "multicurrency" ? isValidEmail(p.email) : false;

  async function verify() {
    setBusy(true);
    upd((x) => { x.payout.payoutVerified = "running"; return x; });
    await wait(1300);
    const holder = name || "ACCOUNT HOLDER";
    if (p.rail === "mpesa") upd((x) => { x.payout.mpesaPhone = phone!; x.payout.mpesaName = holder; x.payout.mpesaVerified = "passed"; x.payout.payoutVerified = "passed"; return x; }, `M-Pesa ${phone} registered name match: ${holder}`, "Safaricom M-Pesa");
    if (p.rail === "pesalink") upd((x) => { x.payout.accountName = holder; x.payout.payoutVerified = "passed"; return x; }, `Pesalink account lookup at ${p.bank}: ${holder}`, "Pesalink");
    if (p.rail === "multicurrency") upd((x) => { x.payout.payoutVerified = "passed"; return x; }, `${p.provider} ${p.currency} virtual account linked`, p.provider);
    setBusy(false);
  }
  const field = (fn: (x: Candidate) => void) => upd((x) => { fn(x); x.payout.payoutVerified = "pending"; return x; });

  return (
    <div className="space-y-5">
      <h2 className="font-display text-2xl font-semibold">Payout account</h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {rails.map(([r, label, Icon]) => (
          <button key={r} onClick={() => field((x) => { x.payout.rail = r; })} className={cn("flex items-center gap-2 rounded-md border p-3 text-sm", p.rail === r && "border-primary ring-2 ring-primary/30")}><Icon className="h-5 w-5 text-primary" />{label}</button>
        ))}
      </div>
      {p.rail === "mpesa" && (
        <div className="max-w-sm"><Label>Safaricom number registered for M-Pesa</Label><Input className="font-mono" placeholder="0712 345 678" value={p.mpesaPhone} onChange={(e) => field((x) => { x.payout.mpesaPhone = e.target.value; })} />
          {p.mpesaPhone && !phone && <p className="mt-1 text-xs text-destructive">Enter a Kenyan mobile number starting 07, 01 or +254.</p>}</div>
      )}
      {p.rail === "pesalink" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div><Label>Bank</Label>
            <select className="h-9 w-full rounded-md border bg-card px-2 text-sm" value={p.bank} onChange={(e) => field((x) => { x.payout.bank = e.target.value; })}>
              <option value="">Select bank</option>{BANKS.map((b) => <option key={b.code} value={b.name}>{b.name} ({b.code})</option>)}
            </select></div>
          <div><Label>Account number</Label><Input className="font-mono" value={p.accountNumber} onChange={(e) => field((x) => { x.payout.accountNumber = e.target.value; })} /></div>
          <div><Label>Branch code</Label><Input className="font-mono" maxLength={3} placeholder="000" value={p.branchCode} onChange={(e) => field((x) => { x.payout.branchCode = e.target.value; })} /></div>
        </div>
      )}
      {p.rail === "multicurrency" && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div><Label>Provider</Label><div className="flex gap-1">{(["Wise", "Deel"] as const).map((v) => <Button key={v} size="sm" variant={p.provider === v ? "default" : "outline"} onClick={() => field((x) => { x.payout.provider = v; })}>{v}</Button>)}</div></div>
          <div><Label>Currency</Label><div className="flex gap-1">{(["USD", "EUR"] as const).map((v) => <Button key={v} size="sm" variant={p.currency === v ? "default" : "outline"} onClick={() => field((x) => { x.payout.currency = v; })}>{v}</Button>)}</div></div>
          <div><Label>Account email</Label><Input value={p.email} onChange={(e) => field((x) => { x.payout.email = e.target.value; })} /></div>
        </div>
      )}
      {p.rail && (
        <div className="flex items-center gap-3">
          <Button disabled={!valid || busy} onClick={() => void verify()}>Verify account</Button>
          <StatusPill status={p.payoutVerified} labels={{ passed: "Verified" }} />
          {p.payoutVerified === "passed" && (p.mpesaName || p.accountName) && p.rail !== "multicurrency" && <span className="font-mono text-sm">{p.rail === "mpesa" ? p.mpesaName : p.accountName}</span>}
        </div>
      )}
    </div>
  );
}

function SubmitStep({ c }: { c: Candidate }) {
  const s = stageStatus(c);
  const ok = s.documents || c.identity.authenticity === "flagged";
  const canSubmit = ok && s.tax && s.payout && c.review.status === "draft";
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold">Review & submit</h2>
      <ul className="space-y-1 text-sm">
        <li>{s.documents ? "✓" : "○"} Identity verified</li>
        <li>{s.tax ? "✓" : "○"} Tax status confirmed</li>
        <li>{s.payout ? "✓" : "○"} Payout account verified</li>
      </ul>
      {c.review.status === "draft" ? (
        <Button disabled={!canSubmit} onClick={() => actions.update(c.id, (x) => { x.review.status = "submitted"; return x; }, { actor: "Candidate", action: "Dossier submitted for employer review" })}>Submit to employer</Button>
      ) : (
        <p className="rounded-md bg-muted p-3 text-sm">Status: <strong className="capitalize">{c.review.status}</strong>{c.review.note && ` — ${c.review.note}`}</p>
      )}
    </div>
  );
}
