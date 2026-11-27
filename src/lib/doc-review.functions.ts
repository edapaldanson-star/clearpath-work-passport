import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  docType: z.enum(["national_id", "passport", "alien_card", "unhcr"]),
  mimeType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
  fileName: z.string().max(200),
  base64: z.string().min(100).max(7_500_000),
});

const FieldSchema = z.object({
  field: z.string(),
  status: z.enum(["readable", "unreadable", "missing"]),
  value: z.string().nullable(),
  note: z.string().nullable(),
});
const ReviewSchema = z.object({
  documentMatchesType: z.boolean(),
  overallQuality: z.enum(["good", "fair", "poor"]),
  fields: z.array(FieldSchema),
  issues: z.array(z.string()),
  guidance: z.array(z.string()),
  readyToSubmit: z.boolean(),
});
export type DocReview = z.infer<typeof ReviewSchema>;
export type DocReviewResult = { ok: true; review: DocReview } | { ok: false; error: string };

const LABELS = {
  national_id: "Kenyan National ID card",
  passport: "passport",
  alien_card: "Kenyan Alien Card (Foreign National Certificate)",
  unhcr: "UNHCR Refugee Mandate / Kenyan Refugee Registration Certificate",
} as const;

export const reviewDocument = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }): Promise<DocReviewResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, error: "The document review service isn't configured yet." };
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const { createLovableAiGatewayRunIdFetch } = await import("./ai/run-id.server");
    const runId = createLovableAiGatewayRunIdFetch();
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runId.fetch,
    });
    const part = data.mimeType === "application/pdf"
      ? ({ type: "file", filename: data.fileName, data: data.base64, mediaType: "application/pdf" } as const)
      : ({ type: "image", image: new URL(`data:${data.mimeType};base64,${data.base64}`) } as const);
    const expiryRule = data.docType === "national_id" ? "Kenyan National IDs have no expiry date; mark expiry as readable with value null if absent." : "Expiry date is required.";
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        system: `You review identity documents for a Kenya work-onboarding app. The candidate says this is a ${LABELS[data.docType]}. Check these fields: Full name, Document number, Date of birth, Nationality, Expiry date. For each, say whether it is readable, unreadable (present but blurred, glared, cropped, obscured) or missing. Give values only when clearly readable (dates as YYYY-MM-DD). ${expiryRule} List image problems (blur, glare, cropping, wrong document, low light, wrong side). Give short, practical resubmission steps in plain English a non-technical person can follow on a phone. Never invent values.`,
        messages: [{ role: "user", content: [{ type: "text", text: "Review this document upload." }, part] }],
        output: Output.object({ schema: ReviewSchema }),
        maxRetries: 0,
        providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", store: false, include: ["reasoning.encrypted_content"] } },
      });
      const review = await result.output;
      return { ok: true, review };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("reviewDocument failed", status, e);
      if (status === 429) return { ok: false, error: "Too many reviews right now. Please wait a minute and try again." };
      if (status === 402 || status === 403) return { ok: false, error: "AI document review is unavailable because the workspace's AI credits or access are exhausted." };
      return { ok: false, error: "We couldn't review this document. Please try again." };
    }
  });
