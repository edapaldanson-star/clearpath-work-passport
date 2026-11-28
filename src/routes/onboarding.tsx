import { createFileRoute } from "@tanstack/react-router";
import { CandidatePortal } from "@/components/CandidatePortal";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/onboarding")({
  head: () => pageHead("Candidate Onboarding", "Organise identity, tax and payout information for employer review in Kenya and East Africa. Demonstration checks are clearly labelled."),
  component: CandidatePortal,
});
