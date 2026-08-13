/** North Eastern Lawn visual system: Field Notes & Fine Lines. */
import { Client } from "pg";
import { describe, expect, it } from "vitest";

const connectionString = process.env.SUPABASE_DATABASE_URL;

describe("Supabase database configuration", () => {
  it("connects through the supplied pooler without exposing database contents", async () => {
    expect(connectionString).toContain("pooler.supabase.com");

    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const result = await client.query<{ now: string }>("select now()::text as now");
      expect(result.rowCount).toBe(1);
      expect(result.rows[0]?.now).toBeTypeOf("string");
    } finally {
      await client.end();
    }
  });
});
