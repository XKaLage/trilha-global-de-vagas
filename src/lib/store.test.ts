import { beforeEach, describe, expect, it } from "vitest";
import { actions } from "./store";
import type { AppState } from "./store";

const read = (): AppState => JSON.parse(localStorage.getItem("rci-state-v1") ?? "{}");
const input = {
  demo: false, url: "https://bdvsolutions.com/test", employer: "bdvsolutions.com",
  title: "Find a U.S. EB-3 Unskilled Visa Sponsor", location: "", country: "US",
  visaSponsorship: true, internationalOk: true,
};

describe("job registration evaluation", () => {
  beforeEach(() => actions.resetAll());

  it("leaves jobs unevaluated rather than rejected when only a draft exists", () => {
    expect(actions.addJob(input).ok).toBe(true);
    const saved = read().jobs[0];
    expect(saved?.visaSponsorship).toBe(true);
    expect(saved?.internationalOk).toBe(true);
    expect(saved?.eligible).toBeUndefined();
    expect(saved?.ruleVersionId).toBeUndefined();
    expect(saved?.reasons).toBeUndefined();
  });

  it("applies saved visa and international selections once rules are explicitly activated", () => {
    actions.addJob(input);
    actions.setVersionStatus("v1", "testing");
    actions.setVersionStatus("v1", "active");
    actions.reevaluate();
    const saved = read().jobs[0];
    expect(saved?.eligible).toBe(true);
    expect(saved?.ruleVersionId).toBe("v1");
    expect(saved?.score).toBe(75);
    expect(saved?.reasons?.length).toBe(6);
  });

  it("evaluates new jobs with the active version and keeps unknown blockers ineligible", () => {
    actions.setVersionStatus("v1", "active");
    actions.addJob({ ...input, internationalOk: undefined });
    const saved = read().jobs[0];
    expect(saved?.eligible).toBe(false);
    expect(saved?.ruleVersionId).toBe("v1");
  });
});