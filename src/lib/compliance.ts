import { useSyncExternalStore } from "react";

export type DocType = "national_id" | "passport" | "alien_card" | "unhcr";
export type CheckStatus = "pending" | "running" | "passed" | "flagged";
export type PayoutRail = "mpesa" | "pesalink" | "multicurrency";
export type ReviewStatus = "draft" | "submitted" | "approved" | "rejected";

export const DOC_LABELS: Record<DocType, string> = {
  national_id: "Kenyan National ID",
  passport: "Passport",
  alien_card: "Alien Card (Foreign National Certificate)",
  unhcr: "UNHCR Refugee Mandate / Refugee Registration Certificate",
};

export const WORK_BASIS: Record<DocType, string> = {
  national_id: "Kenyan citizen — unrestricted right to work",
  passport: "Foreign national — Class D/G work permit required",
  alien_card: "Foreign resident — work permit / dependant pass on file",
  unhcr: "Refugee — Class M permit eligible (Refugees Act 2021)",
};

export const BANKS = [
  { name: "KCB Bank", code: "01" },
  { name: "Equity Bank", code: "68" },
  { name: "Co-operative Bank", code: "11" },
  { name: "NCBA Bank", code: "07" },
  { name: "Absa Bank Kenya", code: "03" },
  { name: "Stanbic Bank", code: "31" },
  { name: "I&M Bank", code: "57" },
  { name: "Diamond Trust Bank", code: "63" },
];

export interface AuditEvent { at: string; actor: string; action: string }

export interface Candidate {
  id: string;
  createdAt: string;
  identity: {
    docType: DocType | null;
    fileName: string | null;
    extracted: { fullName: string; docNumber: string; dob: string; nationality: string; expiry: string } | null;
    authenticity: CheckStatus;
    authenticityScore: number | null;
    sanctions: CheckStatus;
    pep: CheckStatus;
  };
  tax: {
    residency: "resident" | "non_resident" | null;
    kraPin: string;
    countryOfResidence: string;
    foreignTin: string;
    treatyClaim: boolean;
    w8Signature: string;
    w8SignedAt: string | null;
  };
  payout: {
    rail: PayoutRail | null;
    mpesaPhone: string;
    mpesaName: string;
    mpesaVerified: CheckStatus;
    bank: string;
    accountNumber: string;
    branchCode: string;
    accountName: string;
    provider: "Wise" | "Deel";
    currency: "USD" | "EUR";
    email: string;
    payoutVerified: CheckStatus;
  };
  review: { status: ReviewStatus; reviewer: string | null; note: string };
  audit: AuditEvent[];
}

// ---------- validators (pure, tested) ----------
export const isValidKraPin = (v: string) => /^[AP]\d{9}[A-Z]$/.test(v.trim().toUpperCase());
export function normalizeKenyanPhone(v: string): string | null {
  const d = v.replace(/[\s-]/g, "");
  let m = d.match(/^\+?254([17]\d{8})$/);
  if (m) return `+254${m[1]}`;
  m = d.match(/^0([17]\d{8})$/);
  if (m) return `+254${m[1]}`;
  return null;
}
export const isValidBankAccount = (v: string) => /^\d{8,16}$/.test(v.replace(/\s/g, ""));
export const isValidBranchCode = (v: string) => /^\d{3}$/.test(v.trim());
export const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export type Stage = "documents" | "tax" | "payout" | "ready";
export function stageStatus(c: Candidate): Record<Stage, boolean> {
  const i = c.identity;
  const documents = !!i.extracted && i.authenticity === "passed" && i.sanctions === "passed" && i.pep === "passed" && !!i.docType && validateExpiry(i.docType, i.extracted.expiry) === null;
  const t = c.tax;
  const tax =
    (t.residency === "resident" && isValidKraPin(t.kraPin)) ||
    (t.residency === "non_resident" && t.countryOfResidence.trim() !== "" && !!t.w8SignedAt);
  const payout = c.payout.payoutVerified === "passed";
  return { documents, tax, payout, ready: documents && tax && payout && c.review.status === "approved" };
}
export function progressPct(c: Candidate) {
  const s = stageStatus(c);
  return [s.documents, s.tax, s.payout, s.ready].filter(Boolean).length * 25;
}

// ---------- store ----------
const KEY = "corridor-compliance-v1";
const now = () => new Date().toISOString();
export const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();

export function blankCandidate(): Candidate {
  return {
    id: "CND-" + uid(),
    createdAt: now(),
    identity: { docType: null, fileName: null, extracted: null, authenticity: "pending", authenticityScore: null, sanctions: "pending", pep: "pending" },
    tax: { residency: null, kraPin: "", countryOfResidence: "", foreignTin: "", treatyClaim: false, w8Signature: "", w8SignedAt: null },
    payout: { rail: null, mpesaPhone: "", mpesaName: "", mpesaVerified: "pending", bank: "", accountNumber: "", branchCode: "", accountName: "", provider: "Wise", currency: "USD", email: "", payoutVerified: "pending" },
    review: { status: "draft", reviewer: null, note: "" },
    audit: [{ at: now(), actor: "System", action: "Onboarding file opened" }],
  };
}

function seed(): Candidate[] {
  const a = blankCandidate();
  a.id = "CND-AMANI01"; a.createdAt = "2026-11-18T09:12:00Z";
  a.identity = { docType: "unhcr", fileName: "refugee_cert.jpg", extracted: { fullName: "Amani Mugisha", docNumber: "KAK-24-118903", dob: "1996-03-14", nationality: "DR Congo", expiry: "2028-06-30" }, authenticity: "passed", authenticityScore: 96, sanctions: "passed", pep: "passed" };
  a.tax = { residency: "resident", kraPin: "A012345678Z", countryOfResidence: "Kenya", foreignTin: "", treatyClaim: false, w8Signature: "", w8SignedAt: null };
  a.payout = { ...a.payout, rail: "mpesa", mpesaPhone: "+254712345678", mpesaName: "AMANI MUGISHA", mpesaVerified: "passed", payoutVerified: "passed" };
  a.review = { status: "submitted", reviewer: null, note: "" };
  a.audit = [
    { at: "2026-11-18T09:12:00Z", actor: "System", action: "Onboarding file opened" },
    { at: "2026-11-18T09:15:00Z", actor: "Candidate", action: "Uploaded UNHCR Refugee Registration Certificate" },
    { at: "2026-11-18T09:15:04Z", actor: "OCR Engine", action: "Extracted 5 fields (confidence 96%)" },
    { at: "2026-11-18T09:15:09Z", actor: "Screening", action: "Sanctions (UN/OFAC/EU) & PEP screening clear" },
    { at: "2026-11-18T09:20:00Z", actor: "Candidate", action: "KRA PIN A012345678Z validated" },
    { at: "2026-11-18T09:24:00Z", actor: "M-Pesa", action: "Account name match: AMANI MUGISHA" },
    { at: "2026-11-18T09:25:00Z", actor: "Candidate", action: "Dossier submitted for employer review" },
  ];
  const b = blankCandidate();
  b.id = "CND-SOFIA02"; b.createdAt = "2026-11-20T14:02:00Z";
  b.identity = { docType: "passport", fileName: "passport.pdf", extracted: { fullName: "Sofia Lindqvist", docNumber: "SE7731204", dob: "1990-11-02", nationality: "Sweden", expiry: "2031-01-15" }, authenticity: "passed", authenticityScore: 99, sanctions: "passed", pep: "passed" };
  b.tax = { residency: "non_resident", kraPin: "", countryOfResidence: "Sweden", foreignTin: "19901102-1234", treatyClaim: true, w8Signature: "Sofia Lindqvist", w8SignedAt: "2026-11-20T14:20:00Z" };
  b.payout = { ...b.payout, rail: "multicurrency", provider: "Wise", currency: "EUR", email: "sofia@example.se", payoutVerified: "passed" };
  b.review = { status: "approved", reviewer: "HR — Nairobi Office", note: "Class D permit ref on file." };
  b.audit = [
    { at: "2026-11-20T14:02:00Z", actor: "System", action: "Onboarding file opened" },
    { at: "2026-11-20T14:05:00Z", actor: "Candidate", action: "Uploaded Passport" },
    { at: "2026-11-20T14:20:00Z", actor: "Candidate", action: "W-8BEN e-signed (treaty benefits claimed)" },
    { at: "2026-11-20T14:26:00Z", actor: "Wise", action: "EUR virtual account linked" },
    { at: "2026-11-20T14:30:00Z", actor: "Candidate", action: "Dossier submitted for employer review" },
    { at: "2026-11-21T08:00:00Z", actor: "HR — Nairobi Office", action: "Onboarding approved" },
  ];
  const c = blankCandidate();
  c.id = "CND-JUMA03"; c.createdAt = "2026-11-23T11:00:00Z";
  c.identity = { docType: "national_id", fileName: "id_front.jpg", extracted: { fullName: "Juma Otieno", docNumber: "32145678", dob: "1999-07-21", nationality: "Kenya", expiry: "—" }, authenticity: "flagged", authenticityScore: 61, sanctions: "passed", pep: "passed" };
  c.review = { status: "submitted", reviewer: null, note: "" };
  c.audit = [
    { at: "2026-11-23T11:00:00Z", actor: "System", action: "Onboarding file opened" },
    { at: "2026-11-23T11:03:00Z", actor: "OCR Engine", action: "Authenticity score 61% — hologram region unclear, manual review advised" },
    { at: "2026-11-23T11:05:00Z", actor: "Candidate", action: "Dossier submitted for employer review" },
  ];
  return [a, b, c];
}

interface State { candidates: Candidate[]; activeId: string | null }
let state: State | null = null;
const listeners = new Set<() => void>();
const SERVER: State = { candidates: seed(), activeId: null };

function load(): State {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as State) : { candidates: seed(), activeId: null };
  } catch {
    state = { candidates: seed(), activeId: null };
  }
  return state;
}
function set(next: State) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export function useStore() {
  return useSyncExternalStore(subscribe, () => load(), () => SERVER);
}

export const actions = {
  startNew(): string {
    const c = blankCandidate();
    const s = load();
    set({ candidates: [c, ...s.candidates], activeId: c.id });
    return c.id;
  },
  update(id: string, fn: (c: Candidate) => Candidate, log?: { actor: string; action: string }) {
    const s = load();
    set({
      ...s,
      candidates: s.candidates.map((c) => {
        if (c.id !== id) return c;
        const n = fn(structuredClone(c));
        if (log) n.audit = [...n.audit, { at: now(), ...log }];
        return n;
      }),
    });
  },
  reset() { set({ candidates: seed(), activeId: null }); },
};

// Deterministic simulated OCR result from the chosen document type.
export function simulateOcr(docType: DocType, fileName: string) {
  const h = [...fileName].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const num = String(h).padStart(8, "0").slice(0, 8);
  const map: Record<DocType, { docNumber: string; nationality: string; expiry: string }> = {
    national_id: { docNumber: num, nationality: "Kenya", expiry: "—" },
    passport: { docNumber: "A" + num.slice(0, 7), nationality: "Uganda", expiry: "2030-08-31" },
    alien_card: { docNumber: "FNC-" + num.slice(0, 6), nationality: "Tanzania", expiry: "2027-12-31" },
    unhcr: { docNumber: "KAK-" + num.slice(0, 2) + "-" + num.slice(2, 8), nationality: "South Sudan", expiry: "2028-05-31" },
  };
  return {
    extracted: { fullName: "", dob: "1995-01-01", ...map[docType] },
    score: 82 + (h % 18),
  };
}

// ---------- upload validation ----------
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const MIN_UPLOAD_BYTES = 10 * 1024;
const ALLOWED_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "application/pdf": "pdf" };
const ALLOWED_EXT = ["jpg", "jpeg", "png", "pdf"];

export function validateUploadFile(f: { name: string; type: string; size: number }): string | null {
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(f.type in ALLOWED_TYPES) && !ALLOWED_EXT.includes(ext))
    return `"${f.name}" isn't a supported file. Upload a JPG, PNG or PDF.`;
  if (f.size > MAX_UPLOAD_BYTES)
    return `File is ${(f.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB — try a smaller photo or compressed PDF.`;
  if (f.size < MIN_UPLOAD_BYTES)
    return "File is too small to read (under 10 KB). Upload a clearer photo or scan.";
  return null;
}

/** Returns an error message, or null if the expiry is acceptable. "—" only allowed for National ID (no expiry). */
export function validateExpiry(docType: DocType, expiry: string, today = new Date()): string | null {
  const v = expiry.trim();
  if (v === "—" || v === "") return docType === "national_id" ? null : "Enter the expiry date shown on your document (YYYY-MM-DD).";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(Date.parse(v))) return "Expiry date must be in the format YYYY-MM-DD.";
  const t = today.toISOString().slice(0, 10);
  if (v <= t) return `This document expired on ${v}. Upload a valid, unexpired document.`;
  return null;
}
