import { FileCheck2, ReceiptText, Wallet, UserCheck } from "lucide-react";

const steps = [
  { icon: FileCheck2, title: "Make your talent visible", text: "Start with your identity and eligibility documents, including refugee registration, Alien Card, national ID or passport." },
  { icon: ReceiptText, title: "Organise your tax details", text: "Add your KRA PIN or non-resident declaration and prepare the applicable tax information." },
  { icon: Wallet, title: "Choose how you get paid", text: "Prepare M-Pesa, local bank or cross-border payout details for your employer." },
  { icon: UserCheck, title: "Move forward together", text: "Submit a clear dossier. Your employer reviews your documents and applicable work permissions." },
];

export function HowSteps() {
  return <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{steps.map(({ icon: Icon, title, text }, i) => <li key={title} className="border-t pt-5"><div className="mb-4 flex items-center justify-between"><Icon className="h-7 w-7 text-primary" /><span className="font-mono text-xs text-muted-foreground">0{i + 1}</span></div><h3 className="font-display text-base font-bold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></li>)}</ol>;
}