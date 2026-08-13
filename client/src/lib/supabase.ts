/**
 * North Eastern Lawn visual system: Field Notes & Fine Lines.
 * This client keeps customer authentication and row-level data access in Supabase.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Property = {
  id: string;
  nickname: string | null;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
};

export type ServiceVisit = {
  id: string;
  scheduled_start: string | null;
  service_type: string;
  status: "scheduled" | "completed" | "weather_hold" | "cancelled";
  notes_for_customer: string | null;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  amount_cents: number;
  due_date: string | null;
  status: "draft" | "open" | "paid" | "void" | "overdue";
};
