import { Check } from "lucide-react";
import { stageStatus, type Candidate } from "@/lib/compliance";
import { cn } from "@/lib/utils";

const STAGES = [
  ["documents", "Document Check"],
  ["tax", "Tax Clearance"],
  ["payout", "Payout Verified"],
  ["ready", "Ready to Work"],
] as const;

export function Tracker({ c }: { c: Candidate }) {
  const s = stageStatus(c);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {STAGES.map(([k, label], i) => (
        <li key={k} className="flex flex-col items-center text-center">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-full border-2 font-mono text-sm",
            s[k] ? "border-success bg-success text-primary-foreground" : "border-border bg-card text-muted-foreground")}>
            {s[k] ? <Check className="h-4 w-4" /> : i + 1}
          </div>
          <span className={cn("mt-1 text-xs", s[k] ? "font-medium" : "text-muted-foreground")}>{label}</span>
        </li>
      ))}
    </ol>
  );
}
