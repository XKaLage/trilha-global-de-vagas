import { z } from "zod";
import { evaluate, fingerprint, normalizeUrl, type Job, type RuleSet } from "./rules";

export const jobInput = z.object({
  title: z.string().trim().min(1).max(500), employer: z.string().trim().min(1).max(500),
  url: z.string().url().refine((url) => /^https?:\/\//i.test(url), "URL pública HTTP/HTTPS necessária"),
  location: z.string().max(500), country: z.string().max(80), description: z.string().max(20000).optional(),
  housing: z.boolean().nullable().optional(), visaSponsorship: z.boolean().nullable().optional(),
  internationalOk: z.boolean().nullable().optional(), payHourlyUsd: z.number().nonnegative().optional(),
  experienceYears: z.number().nonnegative().optional(), languages: z.array(z.string().max(80)).max(20).optional(),
}).strict();
export const criterion = <T extends z.ZodTypeAny>(value: T) => z.object({ mode: z.enum(["off", "blocker", "preference"]), weight: z.number().nonnegative().max(100), value });
export const ruleInput = z.object({
  countries: criterion(z.array(z.string())), titles: criterion(z.array(z.string())),
  minPayHourlyUsd: criterion(z.number().nonnegative()), maxExperienceYears: criterion(z.number().nonnegative()),
  languages: criterion(z.array(z.string())), housing: criterion(z.boolean()),
  visaSponsorship: criterion(z.boolean()), internationalOk: criterion(z.boolean()), exclusions: criterion(z.array(z.string())),
}).strict();
export const authorizationInput = z.object({ applicationId: z.string().uuid(), confirmed: z.literal(true), note: z.string().trim().min(1).max(1000) }).strict();
export function persistentJob(input: z.infer<typeof jobInput>) {
  return {
    title: input.title, employer: input.employer, original_url: input.url, canonical_url: normalizeUrl(input.url),
    dedup_key: normalizeUrl(input.url), fingerprint: fingerprint(input), location: input.location, country: input.country,
    description: input.description ?? null, housing: input.housing ?? null,
    visa_sponsorship: input.visaSponsorship ?? null, international_eligible: input.internationalOk ?? null,
    pay_min: input.payHourlyUsd ?? null, currency: input.payHourlyUsd === undefined ? null : "USD",
    pay_period: input.payHourlyUsd === undefined ? null : "hour", experience_years: input.experienceYears ?? null,
    languages: input.languages ?? [],
  };
}
export function persistentEvaluation(job: Job, rules: RuleSet) {
  const result = evaluate(job, rules);
  return { classification: result.outcome === "matched" ? "compatible" : result.outcome === "mismatch" ? "incompatible" : "pending_information",
    score: result.score, reasons: result.reasons.map((message) => ({ message })), missing: result.missingBlockers };
}