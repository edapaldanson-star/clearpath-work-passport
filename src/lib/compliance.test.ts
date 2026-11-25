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
