import type { Candidate, ReviewStatus } from "./compliance";

export function maskSensitive(value: string | null | undefined): string {
  return value ? `•••• ${value.slice(-4)}` : "Not provided";
}

export function redactAudit(action: string, candidate: Candidate): string {
  const values = [candidate.identity.extracted?.docNumber, candidate.identity.extracted?.dob,
    candidate.tax.kraPin, candidate.tax.foreignTin, candidate.payout.mpesaPhone,
    candidate.payout.accountNumber, candidate.payout.email, candidate.payout.branchCode];
  return values.filter((value): value is string => !!value).sort((a, b) => b.length - a.length)
    .reduce((text, value) => text.split(value).join("[private]"), action)
    .replace(/\b[AP]\d{9}[A-Z]\b/g, "[private]")
    .replace(/\+?254[17]\d{8}\b/g, "[private]");
}

export function safeDossier(candidate: Candidate): Candidate {
  const copy = structuredClone(candidate);
  if (copy.identity.extracted) {
    copy.identity.extracted.docNumber = maskSensitive(copy.identity.extracted.docNumber);
    copy.identity.extracted.dob = "[private]";
  }
  copy.tax.kraPin = maskSensitive(copy.tax.kraPin);
  copy.tax.foreignTin = maskSensitive(copy.tax.foreignTin);
  copy.payout.mpesaPhone = maskSensitive(copy.payout.mpesaPhone);
  copy.payout.accountNumber = maskSensitive(copy.payout.accountNumber);
  copy.payout.branchCode = "[private]";
  copy.payout.email = "[private]";
  copy.audit = copy.audit.map((event) => ({ ...event, action: redactAudit(event.action, candidate) }));
  return copy;
}

export function filterCandidates(candidates: Candidate[], query: string, status: ReviewStatus | "all", docType: string) {
  const q = query.trim().toLowerCase();
  return candidates.filter((c) => c.review.status !== "draft"
    && (status === "all" || c.review.status === status)
    && (docType === "all" || c.identity.docType === docType)
    && (!q || `${c.identity.extracted?.fullName ?? ""} ${c.id}`.toLowerCase().includes(q)));
}