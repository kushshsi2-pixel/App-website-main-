/** North Eastern Lawn visual system: Field Notes & Fine Lines. */
import { Client } from "pg";
import { describe, expect, it } from "vitest";

const connectionString = process.env.SUPABASE_DATABASE_URL;
const requiredTables = ["profiles", "properties", "service_plans", "service_visits", "invoices", "service_requests", "quote_requests"];

describe("North Eastern Lawn Supabase schema", () => {
  it("creates every customer portal table with row-level security enabled", async () => {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      const result = await client.query<{ tablename: string; rowsecurity: boolean }>(
        "select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename = any($1::text[])",
        [requiredTables]
      );
      expect(result.rows).toHaveLength(requiredTables.length);
      expect(result.rows.map(row => row.tablename).sort()).toEqual([...requiredTables].sort());
      expect(result.rows.every(row => row.rowsecurity)).toBe(true);
    } finally {
      await client.end();
    }
  });
});
