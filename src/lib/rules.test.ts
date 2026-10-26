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
  it("dedupes by normalized URL and fingerprint", () => {
    expect(normalizeUrl("https://www.ex.com/jobs/1/?utm_source=x")).toBe("ex.com/jobs/1");
    expect(isDuplicate(job({ id: "2", url: "https://ex.com/jobs/1" }), [job()])).toBeTruthy();
    expect(isDuplicate(job({ id: "3", url: "https://other.com/a", employer: " ACME ", title: "cook" }), [job()])).toBeTruthy();
  });
});
