import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Railway static production server", () => {
  it("serves the built SPA with Node core modules and the platform-assigned port", () => {
    const source = readFileSync(new URL("./railway-server.mjs", import.meta.url), "utf8");
    expect(source).toContain('resolve(process.cwd(), "dist", "public")');
    expect(source).toContain('process.env.PORT || "3000"');
    expect(source).toContain('listen(port, "0.0.0.0"');
    expect(source).not.toContain("express");
  });
});
