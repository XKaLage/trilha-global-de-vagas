import { describe, expect, it } from "vitest";
import { INTEGRATIONS } from "./integrations";

describe("integration safety policy", () => {
  it("keeps Gmail pending rather than connected", () => {
    expect(INTEGRATIONS.find((integration) => integration.id === "gmail")?.status).toBe("pending");
  });

  it("permits only gmail.readonly", () => {
    expect(INTEGRATIONS.find((integration) => integration.id === "gmail")?.scopes?.allowed).toEqual(["gmail.readonly"]);
  });

  it("keeps notifications disabled without authorizing outbound mail", () => {
    expect(INTEGRATIONS.find((integration) => integration.id === "notifications")?.status).toBe("disabled_by_policy");
  });

  it("reports the explicitly enabled database infrastructure without claiming runtime verification", () => {
    expect(INTEGRATIONS.find((integration) => integration.id === "database")?.status).toBe("infrastructure_enabled");
  });
});