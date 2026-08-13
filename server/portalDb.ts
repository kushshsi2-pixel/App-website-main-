/** North Eastern Lawn visual system: Field Notes & Fine Lines. */
import { Pool } from "pg";

let pool: Pool | null = null;

export type PortalQueryable = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount?: number | null }>;
};

function getPool() {
  if (!pool) {
    const connectionString = process.env.SUPABASE_DATABASE_URL;
    if (!connectionString) throw new Error("SUPABASE_DATABASE_URL is required for portal procedures");
    pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

export async function getCustomerPortalSummary(profileId: string, client: PortalQueryable = getPool()) {
  const [properties, visits, invoices, requests] = await Promise.all([
    client.query("select id, nickname, address_line1, city, state, postal_code from public.properties where profile_id = $1 order by created_at", [profileId]),
    client.query("select v.id, v.service_type, v.scheduled_start, v.status, v.notes_for_customer from public.service_visits v join public.properties p on p.id = v.property_id where p.profile_id = $1 order by v.scheduled_start nulls last limit 12", [profileId]),
    client.query("select id, invoice_number, amount_cents, due_date, status from public.invoices where profile_id = $1 order by due_date nulls last limit 12", [profileId]),
    client.query("select id, service_type, preferred_date, status, created_at from public.service_requests where profile_id = $1 order by created_at desc limit 12", [profileId]),
  ]);
  return { properties: properties.rows, visits: visits.rows, invoices: invoices.rows, requests: requests.rows };
}

export async function createCustomerServiceRequest(input: { profileId: string; propertyId: string; serviceType: string; preferredDate: string; notes?: string | null }, client: PortalQueryable = getPool()) {
  const property = await client.query("select id from public.properties where id = $1 and profile_id = $2", [input.propertyId, input.profileId]);
  if (!property.rowCount) throw new Error("Property not found for the signed-in customer");
  const result = await client.query(
    "insert into public.service_requests (profile_id, property_id, service_type, preferred_date, notes) values ($1, $2, $3, $4, $5) returning id, status, created_at",
    [input.profileId, input.propertyId, input.serviceType, input.preferredDate, input.notes ?? null]
  );
  return result.rows[0];
}
