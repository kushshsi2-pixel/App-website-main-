import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { SupabasePortalUser, verifySupabaseAccessToken } from "../supabaseAuth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  supabaseUser?: SupabasePortalUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let supabaseUser: SupabasePortalUser | null = null;

  // The Railway deployment uses Supabase customer access rather than Manus
  // OAuth. Keep the legacy user field empty for backwards-compatible routers.
  user = null;

  try {
    supabaseUser = await verifySupabaseAccessToken(opts.req.headers);
  } catch {
    supabaseUser = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    supabaseUser,
  };
}
