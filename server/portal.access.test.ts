/** North Eastern Lawn visual system: Field Notes & Fine Lines. */
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("portal access control", () => {
  it("rejects a portal summary request without a verified Supabase user", async () => {
    const ctx = { user: null, supabaseUser: null, req: { headers: {} }, res: {} } as TrpcContext;
    const caller = appRouter.createCaller(ctx);
    await expect(caller.portal.summary()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
