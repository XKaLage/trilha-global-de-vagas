import { describe, it, expect } from "vitest";
import { authorizationInput, jobInput, persistentJob, persistentEvaluation } from "./persistence-policy";
import { defaultRules, type Job } from "./rules";
const demo = { title: "DEMO Cook", employer: "DEMO Company", url: "https://example.com/job?utm_source=demo", location: "DEMO", country: "US" };
describe("persistent foundation policies", () => {
  it("rejects client ownership fields", () => { expect(jobInput.safeParse({ ...demo, owner_id: "other-user" }).success).toBe(false); });
  it("retains unknown sponsorship instead of inventing facts", () => { expect(persistentJob(demo).visa_sponsorship).toBeNull(); });
  it("retains unknown international eligibility", () => { expect(persistentJob(demo).international_eligible).toBeNull(); });
  it("deduplicates normalized URLs", () => { expect(persistentJob(demo).dedup_key).toBe(persistentJob({ ...demo, url: "http://www.example.com/job/" }).dedup_key); });
  it("requires explicit authorization", () => { expect(authorizationInput.safeParse({ applicationId: "00000000-0000-4000-8000-000000000001", confirmed: false, note: "DEMO" }).success).toBe(false); });
  it("requires a nonempty authorization record", () => { expect(authorizationInput.safeParse({ applicationId: "00000000-0000-4000-8000-000000000001", confirmed: true, note: " " }).success).toBe(false); });
  const job: Job = { ...demo, id: "demo", demo: true, status: "discovered", createdAt: "2026-11-01" };
  it("maps missing blockers to pending_information", () => { expect(persistentEvaluation(job, defaultRules()).classification).toBe("pending_information"); });
  it("maps confirmed mismatches to incompatible", () => { expect(persistentEvaluation({ ...job, internationalOk: false }, defaultRules()).classification).toBe("incompatible"); });
  it("maps complete compatible data without weakening blockers", () => { expect(persistentEvaluation({ ...job, internationalOk: true }, defaultRules()).classification).toBe("compatible"); });
});