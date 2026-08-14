import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Railway startup contract", () => {
  it("does not load the Manus OAuth SDK during production startup", () => {
    const entry = readFileSync(new URL("./_core/index.ts", import.meta.url), "utf8");
    const context = readFileSync(new URL("./_core/context.ts", import.meta.url), "utf8");

    expect(entry).not.toContain('from "./oauth"');
    expect(entry).not.toContain("registerOAuthRoutes(app)");
    expect(entry).toContain('server.listen(port, "0.0.0.0"');
    expect(entry).not.toContain("findAvailablePort");
    expect(context).not.toContain('from "./sdk"');
  });
});
