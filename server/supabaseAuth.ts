/** North Eastern Lawn visual system: Field Notes & Fine Lines. */
import type { IncomingHttpHeaders } from "node:http";

export type SupabasePortalUser = { id: string; email?: string | null };

export function extractSupabaseBearer(headers: IncomingHttpHeaders): string | null {
  const authorization = headers.authorization;
  const value = Array.isArray(authorization) ? authorization[0] : authorization;
  if (!value?.startsWith("Bearer ")) return null;
  return value.slice("Bearer ".length).trim() || null;
}

export async function verifySupabaseAccessToken(headers: IncomingHttpHeaders): Promise<SupabasePortalUser | null> {
  const accessToken = extractSupabaseBearer(headers);
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!accessToken || !url || !key) return null;

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: string; email?: string | null };
  return user.id ? { id: user.id, email: user.email ?? null } : null;
}
