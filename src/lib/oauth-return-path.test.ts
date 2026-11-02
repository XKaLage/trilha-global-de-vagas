import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "./oauth-return-path";
describe("OAuth return isolation", () => {
  it("preserves local consent id and fragment", () => expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=DEMO#decision")).toBe("/.lovable/oauth/consent?authorization_id=DEMO#decision"));
  it.each(["//outside.invalid", "/\\outside.invalid", "https://outside.invalid", "/\nunsafe", null])("rejects external or malformed returns %s", (value) => expect(oauthReturnPath(value)).toBe("/"));
});