import { describe, it, expect } from "vitest";
import { defaultRules, evaluate, isDuplicate, normalizeUrl, type Job } from "./rules";

const job = (p: Partial<Job> = {}): Job => ({
  id: "1", demo: true, url: "https://www.ex.com/jobs/1?utm_source=x", employer: "Acme", title: "Cook",
  location: "Banff, AB", country: "CA", internationalOk: true, status: "discovered", createdAt: "", ...p,
});

describe("rules", () => {
  it("blocks countries outside US/CA", () => {
    expect(evaluate(job({ country: "MX" }), defaultRules()).eligible).toBe(false);
  });
  it("blocks exclusion terms", () => {
    const r = defaultRules(); r.exclusions.value = ["unpaid"];
    expect(evaluate(job({ description: "Unpaid internship" }), r).eligible).toBe(false);
  });
  it("blocks when blocker info is missing", () => {
    expect(evaluate(job({ internationalOk: undefined }), defaultRules()).eligible).toBe(false);
  });
  it("distinguishes missing international acceptance from a mismatch", () => {
    const result = evaluate(job({ internationalOk: undefined }), defaultRules());
    expect(result.outcome).toBe("missing_information");
    expect(result.missingBlockers).toEqual(["internationalOk"]);
    expect(result.mismatchedBlockers).toEqual([]);
  });
  it("rejects explicitly incompatible international acceptance", () => {
    const result = evaluate(job({ internationalOk: false }), defaultRules());
    expect(result.eligible).toBe(false);
    expect(result.outcome).toBe("mismatch");
    expect(result.mismatchedBlockers).toEqual(["internationalOk"]);
  });
  it("applies selected yes values for visa and international applicants", () => {
    const rules = defaultRules();
    rules.visaSponsorship.mode = "blocker";
    const result = evaluate(job({ visaSponsorship: true, internationalOk: true }), rules);
    expect(result.eligible).toBe(true);
    expect(result.outcome).toBe("matched");
    expect(result.mismatchedBlockers).toEqual([]);
  });
  it("keeps missing visa sponsorship ineligible when required", () => {
    const rules = defaultRules();
    rules.visaSponsorship.mode = "blocker";
    const result = evaluate(job({ visaSponsorship: undefined }), rules);
    expect(result.eligible).toBe(false);
    expect(result.missingBlockers).toEqual(["visaSponsorship"]);
  });
  it("rejects a confirmed visa mismatch when required", () => {
    const rules = defaultRules();
    rules.visaSponsorship.mode = "blocker";
    expect(evaluate(job({ visaSponsorship: false }), rules).mismatchedBlockers).toEqual(["visaSponsorship"]);
  });
  it("does not turn missing preferences into blockers", () => {
    const result = evaluate(job({ housing: undefined, visaSponsorship: undefined }), defaultRules());
    expect(result.eligible).toBe(true);
    expect(result.outcome).toBe("matched");
    expect(result.score).toBe(38);
  });
  it("keeps confirmed mismatches visible even when another blocker is unknown", () => {
    const result = evaluate(job({ country: "MX", internationalOk: undefined }), defaultRules());
    expect(result.outcome).toBe("mismatch");
    expect(result.missingBlockers).toEqual(["internationalOk"]);
    expect(result.mismatchedBlockers).toEqual(["countries"]);
  });
  it("dedupes by normalized URL and fingerprint", () => {
    expect(normalizeUrl("https://www.ex.com/jobs/1/?utm_source=x")).toBe("ex.com/jobs/1");
    expect(isDuplicate(job({ id: "2", url: "https://ex.com/jobs/1" }), [job()])).toBeTruthy();
    expect(isDuplicate(job({ id: "3", url: "https://other.com/a", employer: " ACME ", title: "cook" }), [job()])).toBeTruthy();
  });
});
