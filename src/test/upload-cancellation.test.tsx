import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { actions, type Candidate, useStore } from "@/lib/compliance";
import { Route } from "@/routes/index";

// Keep the real portal and store; only remove navigation/layout dependencies.
vi.mock("@/components/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <>{children}</>,
  StatusPill: () => null,
}));
vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...await importOriginal<typeof import("@tanstack/react-router")>(),
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}));

let current: Candidate | undefined;
function StoreProbe() {
  const store = useStore();
  current = store.candidates.find((candidate) => candidate.id === store.activeId);
  return null;
}
function candidate() {
  if (!current) throw new Error("Expected an active candidate");
  return current;
}
function upload(name: string) {
  const file = new File([new Uint8Array(20_000)], name, { type: "application/pdf" });
  fireEvent.change(screen.getByLabelText("Upload identity document"), { target: { files: [file] } });
}
async function advance(milliseconds: number) {
  // Flush each awaited processing tick separately so both stages run normally.
  for (let elapsed = 0; elapsed < milliseconds; elapsed += 200) {
    await act(async () => { await vi.advanceTimersByTimeAsync(200); });
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  actions.reset();
  const id = actions.startNew();
  actions.update(id, (c) => { c.identity.docType = "passport"; return c; });
  const Portal = Route.options.component;
  if (!Portal) throw new Error("Candidate portal component missing");
  render(<><Portal /><StoreProbe /></>);
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  current = undefined;
});

const STAGES = [
  { stage: "processing start", elapsed: 0, extracted: false },
  { stage: "document processing", elapsed: 600, extracted: false },
  { stage: "screening start", elapsed: 1200, extracted: true },
  { stage: "screening in progress", elapsed: 1800, extracted: true },
  { stage: "final screening tick", elapsed: 2200, extracted: true },
];

describe("Candidate upload cancellation", () => {
  it.each(STAGES)("stops a first upload at $stage without saving partial results", async ({ elapsed, extracted }) => {
    const original = structuredClone(candidate().identity);
    upload("cancelled.pdf");
    await advance(elapsed);
    expect(candidate().identity.extracted !== null).toBe(extracted);
    expect(candidate().identity.sanctions).toBe(extracted ? "running" : "pending");

    fireEvent.click(screen.getByRole("button", { name: "Cancel upload" }));
    const cancelled = structuredClone(candidate());
    expect(cancelled.identity).toEqual(original);
    expect(cancelled.audit.at(-1)?.action).toBe("Cancelled document upload (cancelled.pdf)");
    // Test the accessibility outcome, not a snapshot of visible copy.
    expect(screen.getByRole("status").textContent).toContain("document upload cancelled");
    await advance(3000);
    expect(candidate()).toEqual(cancelled);
    expect(screen.getByLabelText("Upload identity document")).toBeEnabled();
    expect(screen.getByLabelText("Upload identity document")).toHaveFocus();
  });

  it.each(STAGES)("keeps the entire completed document intact when a replacement is cancelled at $stage", async ({ elapsed, extracted }) => {
    upload("completed.pdf");
    await advance(2400);
    fireEvent.change(screen.getByLabelText("Full name (as on document)"), { target: { value: "Amani Mugisha" } });
    const completed = structuredClone(candidate().identity);
    expect(completed.fileName).toBe("completed.pdf");
    expect(completed.extracted?.fullName).toBe("Amani Mugisha");
    expect(completed.sanctions).toBe("passed");
    expect(completed.pep).toBe("passed");

    upload("replacement.pdf");
    await advance(elapsed);
    expect(candidate().identity.fileName).toBe("replacement.pdf");
    expect(candidate().identity.extracted !== null).toBe(extracted);
    fireEvent.click(screen.getByRole("button", { name: "Cancel upload" }));
    expect(candidate().identity).toEqual(completed);
    const cancelled = structuredClone(candidate());
    await advance(3000);
    expect(candidate()).toEqual(cancelled);
    const persisted = JSON.parse(localStorage.getItem("corridor-compliance-v1") ?? "null") as { candidates: Candidate[] } | null;
    expect(persisted?.candidates.find((c) => c.id === cancelled.id)?.identity).toEqual(completed);
  });

  it("allows an immediate retry without the cancelled run overwriting its results", async () => {
    upload("cancelled.pdf");
    await advance(1200);
    fireEvent.click(screen.getByRole("button", { name: "Cancel upload" }));
    upload("retry.pdf");
    await advance(2400);
    expect(candidate().identity.fileName).toBe("retry.pdf");
    expect(candidate().identity.extracted).not.toBeNull();
    expect(candidate().identity.sanctions).toBe("passed");
    expect(candidate().identity.pep).toBe("passed");
    expect(candidate().audit.filter((event) => event.actor === "Screening")).toHaveLength(1);
  });

  it("does not offer cancellation after a file has completed", async () => {
    upload("completed.pdf");
    await advance(2400);
    const completed = structuredClone(candidate());
    expect(screen.queryByRole("button", { name: "Cancel upload" })).toBeNull();
    await advance(3000);
    expect(candidate()).toEqual(completed);
  });
});