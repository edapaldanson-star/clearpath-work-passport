import { describe, it, expect } from "vitest";
import { isValidKraPin, normalizeKenyanPhone, stageStatus, blankCandidate } from "./compliance";

describe("compliance rules", () => {
  it("accepts KRA PIN format A/P + 9 digits + letter", () => {
    expect(isValidKraPin("A012345678Z")).toBe(true);
    expect(isValidKraPin("B012345678Z")).toBe(false);
    expect(isValidKraPin("A01234567Z")).toBe(false);
  });
  it("normalizes Safaricom numbers to +254", () => {
    expect(normalizeKenyanPhone("0712 345 678")).toBe("+254712345678");
    expect(normalizeKenyanPhone("254112345678")).toBe("+254112345678");
    expect(normalizeKenyanPhone("0612345678")).toBeNull();
  });
  it("is not ready to work until employer approves", () => {
    const c = blankCandidate();
    expect(stageStatus(c).ready).toBe(false);
  });
});
import { validateUploadFile, validateExpiry } from "./compliance";
describe("upload validation", () => {
  it("rejects unsupported file types", () => {
    expect(validateUploadFile({ name: "id.docx", type: "application/msword", size: 50_000 })).not.toBeNull();
    expect(validateUploadFile({ name: "id.jpg", type: "image/jpeg", size: 50_000 })).toBeNull();
  });
  it("rejects files over 5 MB", () => {
    expect(validateUploadFile({ name: "id.pdf", type: "application/pdf", size: 6 * 1024 * 1024 })).not.toBeNull();
  });
  it("rejects expired documents", () => {
    const today = new Date("2026-11-25T00:00:00Z");
    expect(validateExpiry("passport", "2025-01-01", today)).not.toBeNull();
    expect(validateExpiry("passport", "2030-01-01", today)).toBeNull();
    expect(validateExpiry("national_id", "—", today)).toBeNull();
    expect(validateExpiry("passport", "—", today)).not.toBeNull();
  });
});
