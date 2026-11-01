import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Json } from "@/integrations/supabase/types";
import { jobInput, ruleInput, authorizationInput, persistentJob, persistentEvaluation } from "./persistence-policy";
import { databaseError, ownedCandidate, readOwnedTable } from "./persistence.server";
import type { Job } from "./rules";

export const getPersistenceStatus = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const fallback = { infrastructure: false, schema: false, version: 0, localMigrationEnabled: false, gmailEnabled: false, uploadsEnabled: false };
  if (!url || !key) return fallback;
  const db = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers); headers.set("apikey", key);
    if (headers.get("Authorization") === `Bearer ${key}` && key.startsWith("sb_")) headers.delete("Authorization");
    return fetch(input, { ...init, headers, signal: AbortSignal.timeout(8000) });
  } } });
  try {
    const { data, error } = await db.rpc("foundation_health");
    if (error) return { ...fallback, infrastructure: true };
    return z.object({ infrastructure: z.boolean(), schema: z.boolean(), version: z.number(), localMigrationEnabled: z.boolean(), gmailEnabled: z.boolean(), uploadsEnabled: z.boolean() }).parse(data);
  } catch { return fallback; }
});

export const readPersistentRecords = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ table: z.enum(["candidate_profiles", "candidate_experiences", "candidate_education", "candidate_certifications", "candidate_documents", "job_sources", "jobs", "job_evaluations", "rule_sets", "applications", "employer_messages", "audit_events"]), offset: z.number().int().nonnegative().default(0) }).strict().parse(input))
  .handler(async ({ data, context }) => { setResponseHeader("Cache-Control", "no-store"); return readOwnedTable(context.supabase, context.userId, data.table, data.offset); });

export const getPersistentAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => { setResponseHeader("Cache-Control", "no-store"); const candidate = await ownedCandidate(context.supabase, context.userId);
    const { data, error } = await context.supabase.rpc("foundation_admin"); databaseError(error);
    return { candidateId: candidate.id, provisioned: true, admin: data === true };
  });

export const savePersistentJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => jobInput.parse(input))
  .handler(async ({ data, context }) => { const result = await context.supabase.rpc("foundation_save_job", { p_job: persistentJob(data) }); databaseError(result.error); return result.data; });
export const savePersistentRules = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ rules: ruleInput, note: z.string().max(1000) }).strict().parse(input))
  .handler(async ({ data, context }) => { const result = await context.supabase.rpc("foundation_save_rules", { p_rules: data.rules as Json, p_note: data.note }); databaseError(result.error); return result.data; });
export const setPersistentRuleStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["testing", "active"]) }).strict().parse(input))
  .handler(async ({ data, context }) => { const result = await context.supabase.rpc("foundation_set_rule_status", { p_id: data.id, p_status: data.status }); databaseError(result.error); return { ok: true }; });
export const evaluatePersistentJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid(), ruleId: z.string().uuid() }).strict().parse(input))
  .handler(async ({ data, context }) => {
    const job = await context.supabase.from("jobs").select("*").eq("id", data.jobId).eq("owner_id", context.userId).maybeSingle();
    const rule = await context.supabase.from("rule_sets").select("*").eq("id", data.ruleId).eq("owner_id", context.userId).maybeSingle();
    if (job.error || rule.error || !job.data || !rule.data) throw new Error("Vaga ou regra indisponível para esta conta.");
    const row = job.data;
    const j: Job = { id: row.id, demo: false, url: row.original_url ?? "", employer: row.employer, title: row.title, location: row.location ?? "", country: row.country ?? "", status: "discovered", createdAt: row.collected_at,
      housing: row.housing ?? undefined, visaSponsorship: row.visa_sponsorship ?? undefined, internationalOk: row.international_eligible ?? undefined,
      description: row.description ?? undefined, payHourlyUsd: row.currency === "USD" && row.pay_period === "hour" ? row.pay_min ?? undefined : undefined,
      experienceYears: row.experience_years ?? undefined, languages: row.languages?.length ? row.languages : undefined };
    const evaluation = persistentEvaluation(j, ruleInput.parse(rule.data.rules));
    const result = await context.supabase.rpc("foundation_record_evaluation", { p_job: data.jobId, p_rule: data.ruleId, p_classification: evaluation.classification, p_score: evaluation.score, p_reasons: evaluation.reasons, p_missing: evaluation.missing });
    databaseError(result.error); return evaluation;
  });
export const selectPersistentJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid() }).strict().parse(input))
  .handler(async ({ data, context }) => { const result = await context.supabase.rpc("foundation_select_job", { p_job: data.jobId }); databaseError(result.error); return result.data; });
export const authorizePersistentApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => authorizationInput.parse(input))
  .handler(async ({ data, context }) => { const result = await context.supabase.rpc("foundation_authorize_application", { p_id: data.applicationId, p_confirmation: data.confirmed, p_note: data.note }); databaseError(result.error); return { authorized: true, submitted: false }; });