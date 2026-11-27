import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, LoaderCircle, CircleCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateUploadFile, DOC_LABELS, type DocType } from "@/lib/compliance";
import { reviewDocument, type DocReview } from "@/lib/doc-review.functions";
import { cn } from "@/lib/utils";

const toBase64 = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result).split(",")[1] ?? "");
  r.onerror = () => rej(r.error);
  r.readAsDataURL(f);
});
const MIME: Record<string, "image/jpeg" | "image/png" | "application/pdf"> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", pdf: "application/pdf" };

export function AiDocReview({ docType }: { docType: DocType }) {
  const review = useServerFn(reviewDocument);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocReview | null>(null);
  const [announce, setAnnounce] = useState("");

  async function onFile(file: File) {
    setError(null); setResult(null);
    const err = validateUploadFile(file);
    if (err) { setError(err); setAnnounce(err); return; }
    const mimeType = MIME[file.type.split("/")[1] ?? ""] ?? MIME[file.name.split(".").pop()?.toLowerCase() ?? ""];
    if (!mimeType) { setError("Upload a JPG, PNG or PDF."); return; }
    setBusy(true); setAnnounce(`Checking ${file.name} for missing or unreadable details.`);
    try {
      const r = await review({ data: { docType, mimeType, fileName: file.name, base64: await toBase64(file) } });
      if (r.ok) {
        setResult(r.review);
        const bad = r.review.fields.filter((f) => f.status !== "readable").length;
        setAnnounce(r.review.readyToSubmit ? "Check complete. Your document looks ready to submit." : `Check complete. ${bad} field${bad === 1 ? "" : "s"} need attention. See guidance below.`);
      } else { setError(r.error); setAnnounce(r.error); }
    } catch {
      setError("We couldn't review this document. Please try again."); setAnnounce("Review failed.");
    } finally { setBusy(false); }
  }

  return (
    <section className="rounded-md border border-dashed p-4" aria-labelledby="ai-review-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="ai-review-title" className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Check my document photo with AI</h3>
          <p className="text-xs text-muted-foreground">Before submitting your {DOC_LABELS[docType]}, find out if any details are missing or hard to read.</p>
        </div>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Checking…</> : result || error ? "Check another photo" : "Choose photo to check"}
        </Button>
        <input ref={input} type="file" className="sr-only" aria-label="Choose document photo for AI check" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void onFile(f); }} />
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{announce}</p>
      {error && <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {result && (
        <div className="mt-4 space-y-3 text-sm">
          <p className={cn("flex items-center gap-2 font-medium", result.readyToSubmit ? "text-success" : "text-destructive")}>
            {result.readyToSubmit ? <CircleCheck className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
            {result.readyToSubmit ? "Looks good — this document should be readable." : "Some details need attention before you submit."}
            <span className="font-normal text-muted-foreground">Image quality: {result.overallQuality}</span>
          </p>
          {!result.documentMatchesType && <p className="text-destructive">This doesn't look like a {DOC_LABELS[docType]}. Check you picked the right document type.</p>}
          <ul className="grid gap-1 sm:grid-cols-2">
            {result.fields.map((f) => (
              <li key={f.field} className="flex justify-between gap-2 rounded border px-2 py-1">
                <span>{f.field}{f.note ? <span className="block text-xs text-muted-foreground">{f.note}</span> : null}</span>
                <span className={cn("text-xs font-semibold uppercase", f.status === "readable" ? "text-success" : "text-destructive")}>{f.status}</span>
              </li>
            ))}
          </ul>
          {result.issues.length > 0 && <div><p className="font-semibold">Problems found</p><ul className="list-disc pl-5">{result.issues.map((x) => <li key={x}>{x}</li>)}</ul></div>}
          {result.guidance.length > 0 && <div><p className="font-semibold">How to retake or resubmit</p><ol className="list-decimal pl-5">{result.guidance.map((x) => <li key={x}>{x}</li>)}</ol></div>}
          <p className="text-xs text-muted-foreground">AI suggestions can be wrong. Your employer still reviews every document.</p>
        </div>
      )}
    </section>
  );
}
