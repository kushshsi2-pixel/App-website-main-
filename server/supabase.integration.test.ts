import { describe, expect, it } from "vitest";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_ANON_KEY;

describe("Supabase configuration", () => {
  it("accepts the supplied publishable key at the authentication settings endpoint", async () => {
    expect(supabaseUrl).toMatch(/^https:\/\/[a-z0-9-]+\.supabase\.co$/);
    expect(publishableKey).toMatch(/^sb_publishable_/);

    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: publishableKey! },
    });

    expect(response.status).toBe(200);
    const settings = (await response.json()) as { external?: Record<string, unknown> };
    expect(settings).toBeTypeOf("object");
  });
});
