/** North Eastern Lawn visual system: Field Notes & Fine Lines. */
import { readFile } from "node:fs/promises";
import dns from "node:dns";
import { Client } from "pg";

dns.setDefaultResultOrder("ipv4first");

const connectionString = process.env.SUPABASE_DATABASE_URL;
if (!connectionString) throw new Error("SUPABASE_DATABASE_URL is required");

const sql = await readFile(new URL("../supabase/migrations/001_north_eastern_lawn.sql", import.meta.url), "utf8");
const directUrl = new URL(connectionString);
const projectRef = directUrl.hostname.split(".")[0].replace("db", "").replace(/^-/, "") || "oyvfkbosbjgtqvlcrfex";
const poolerHost = process.env.SUPABASE_POOLER_HOST || "aws-0-us-east-1.pooler.supabase.com";
const client = new Client({
  connectionString: directUrl.hostname.startsWith("db.") ? undefined : connectionString,
  host: directUrl.hostname.startsWith("db.") ? poolerHost : undefined,
  port: directUrl.hostname.startsWith("db.") ? 6543 : undefined,
  user: directUrl.hostname.startsWith("db.") ? `postgres.${projectRef}` : undefined,
  password: directUrl.hostname.startsWith("db.") ? decodeURIComponent(directUrl.password) : undefined,
  database: directUrl.hostname.startsWith("db.") ? directUrl.pathname.slice(1) : undefined,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
try {
  await client.query(sql);
  console.log("Supabase schema applied successfully.");
} finally {
  await client.end();
}
