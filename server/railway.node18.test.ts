import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Railway Node 18 production path", () => {
  it("uses fileURLToPath instead of the Node 20-only import.meta.dirname helper", () => {
    const source = readFileSync(new URL("./_core/vite.ts", import.meta.url), "utf8");

    expect(source).toContain('fileURLToPath(import.meta.url)');
    expect(source).not.toContain("import.meta.dirname");
    expect(source).toContain('import("vite")');
    expect(source).not.toContain('from "vite"');
  });
});
