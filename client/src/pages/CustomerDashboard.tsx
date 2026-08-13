/**
 * North Eastern Lawn visual system: Field Notes & Fine Lines.
 * A warm, operational customer portal built around the next useful property-care action.
 */
import { Button } from "@/components/ui/button";
import { canCreateServiceRequest, formatCurrencyFromCents } from "@/lib/portalData";
import { Invoice, Property, ServiceVisit, supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, ChevronRight, CircleDollarSign, ClipboardList, Home, Leaf, Loader2, LogOut, MapPin, Plus, Sprout, Wrench } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type PortalMode = "loading" | "signed-out" | "ready";

function shortDate(value: string | null) {
  if (!value) return "To be scheduled";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function statusLabel(status: string) {
  return status.replace("_", " ");
}

export default function CustomerDashboard() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<PortalMode>("loading");
  const [firstName, setFirstName] = useState("there");
  const [properties, setProperties] = useState<Property[]>([]);
  const [visits, setVisits] = useState<ServiceVisit[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const nextVisit = useMemo(() => visits.find(visit => visit.status === "scheduled" || visit.status === "weather_hold") ?? null, [visits]);
  const outstanding = useMemo(() => invoices.filter(invoice => ["open", "overdue"].includes(invoice.status)), [invoices]);

  async function loadPortal() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      setMode("signed-out");
      return;
    }

    setFirstName((user.user_metadata.full_name || user.email || "there").split(" ")[0]);
    await supabase.from("profiles").upsert({ id: user.id, full_name: user.user_metadata.full_name || null }, { onConflict: "id" });

    const [propertyResult, visitResult, invoiceResult] = await Promise.all([
      supabase.from("properties").select("id,nickname,address_line1,city,state,postal_code").order("created_at", { ascending: true }),
      supabase.from("service_visits").select("id,scheduled_start,service_type,status,notes_for_customer").order("scheduled_start", { ascending: true }).limit(8),
      supabase.from("invoices").select("id,invoice_number,amount_cents,due_date,status").order("due_date", { ascending: true }).limit(8),
    ]);

    setProperties((propertyResult.data ?? []) as Property[]);
    setVisits((visitResult.data ?? []) as ServiceVisit[]);
    setInvoices((invoiceResult.data ?? []) as Invoice[]);
    setError(propertyResult.error?.message || visitResult.error?.message || invoiceResult.error?.message || "");
    setMode("ready");
  }

  useEffect(() => {
    void loadPortal();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void loadPortal(); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setLocation("/");
  }

  async function addProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    if (!userId) { setLocation("/login"); return; }
    const { error: insertError } = await supabase.from("properties").insert({
      profile_id: userId,
      nickname: String(form.get("nickname") || "My property"),
      address_line1: String(form.get("address") || ""),
      city: String(form.get("city") || ""),
      state: String(form.get("state") || ""),
      postal_code: String(form.get("postalCode") || ""),
    });
    setBusy(false);
    if (insertError) { setError(insertError.message); return; }
    setShowPropertyForm(false); setNotice("Property details saved."); await loadPortal();
  }

  async function requestService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    const input = { propertyId: String(form.get("propertyId") || ""), serviceType: String(form.get("serviceType") || ""), preferredDate: String(form.get("preferredDate") || "") };
    if (!userId || !canCreateServiceRequest(input)) { setBusy(false); setError("Choose a property, service, and preferred date."); return; }
    const { error: insertError } = await supabase.from("service_requests").insert({
      profile_id: userId,
      property_id: input.propertyId,
      service_type: input.serviceType,
      preferred_date: input.preferredDate,
      notes: String(form.get("notes") || "") || null,
    });
    setBusy(false);
    if (insertError) { setError(insertError.message); return; }
    setShowRequestForm(false); setNotice("Request received. Our team will confirm the next step.");
  }

  if (mode === "loading") return <div className="min-h-screen grid place-items-center bg-[#f3f1ea]"><Loader2 className="h-8 w-8 animate-spin text-[#143c2a]" /></div>;
  if (mode === "signed-out") {
    return <main className="min-h-screen grid place-items-center bg-[#f3f1ea] px-5"><div className="paper-card max-w-md text-center p-10"><div className="mx-auto h-12 w-12 rounded-full bg-[#dff0b8] grid place-items-center"><Sprout className="h-6 w-6" /></div><p className="eyebrow mt-7">CUSTOMER PORTAL</p><h1 className="display mt-3 text-4xl">Sign in to see your plan.</h1><p className="mt-4 leading-7 text-[#5c705f]">Your property details and visits are available through a secure email sign-in.</p><button onClick={() => setLocation("/login")} className="brand-button mt-8 w-full justify-center">Continue to sign-in <ArrowUpRight className="h-4 w-4" /></button><button onClick={() => setLocation("/")} className="mt-5 text-sm font-bold underline underline-offset-4">Return to website</button></div></main>;
  }

  return (
    <main className="min-h-screen bg-[#f3f1ea] text-[#143c2a]">
      <header className="sticky top-0 z-30 bg-[#f3f1ea]/90 backdrop-blur-lg border-b border-[#dfe3da]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-[74px] flex items-center justify-between gap-4">
          <button onClick={() => setLocation("/")} className="flex items-center gap-3 group"><img src="/manus-storage/north-eastern-mark_65290f75.png" alt="" className="h-10 w-10" /><span className="font-black tracking-tight text-lg">NORTH EASTERN <span className="font-normal">LAWN</span></span></button>
          <div className="flex items-center gap-3"><span className="hidden sm:inline text-sm text-[#5c705f]">Customer portal</span><button onClick={handleSignOut} className="icon-button" title="Sign out"><LogOut className="h-4 w-4" /></button></div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-8 sm:py-11 grid xl:grid-cols-[220px_minmax(0,1fr)] gap-8">
        <aside className="xl:pt-5">
          <p className="eyebrow mb-4">ACCOUNT MENU</p>
          <nav className="flex xl:flex-col gap-2 overflow-x-auto pb-1"><a href="#overview" className="portal-nav active"><Home className="h-4 w-4" />Overview</a><a href="#schedule" className="portal-nav"><CalendarDays className="h-4 w-4" />Schedule</a><a href="#property" className="portal-nav"><MapPin className="h-4 w-4" />Property</a><a href="#billing" className="portal-nav"><CircleDollarSign className="h-4 w-4" />Billing</a></nav>
          <div className="hidden xl:block mt-12 rounded-2xl overflow-hidden"><img src="/manus-storage/north-eastern-portal_97320165.jpg" alt="A maintained residential property" className="h-52 w-full object-cover" /><div className="bg-[#143c2a] p-5 text-white"><p className="text-xs uppercase tracking-[.15em] text-[#b7e34b]">Need something else?</p><p className="mt-3 text-sm leading-6 text-[#d6e4d6]">A quick request is the fastest way to get your property on our board.</p></div></div>
        </aside>

        <div className="min-w-0 space-y-8">
          <section id="overview" className="relative overflow-hidden rounded-[1.8rem] bg-[#143c2a] px-6 py-8 sm:px-10 sm:py-11 text-white">
            <div className="absolute inset-0 field-grid opacity-15" />
            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">
              <div><p className="eyebrow text-[#b7e34b]">PROPERTY CARE / ACTIVE</p><h1 className="display mt-4 text-4xl sm:text-5xl">Good to see you, <em>{firstName}.</em></h1><p className="mt-4 text-[#cdd9cf] max-w-xl leading-7">Everything about your service plan, in one clear place.</p></div>
              <button onClick={() => setShowRequestForm(true)} className="brand-button shrink-0">Request service <ArrowUpRight className="h-4 w-4" /></button>
            </div>
          </section>

          {notice ? <div className="flex items-center gap-3 rounded-2xl bg-[#dff0b8] px-5 py-4 text-sm font-semibold"><Check className="h-5 w-5" />{notice}</div> : null}
          {error ? <div className="rounded-2xl bg-[#f4ddd6] px-5 py-4 text-sm text-[#8a2d1c]">{error}</div> : null}

          <section id="schedule" className="grid lg:grid-cols-[1.35fr_.65fr] gap-5">
            <div className="paper-card p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">UP NEXT</p><h2 className="display mt-3 text-3xl">{nextVisit ? nextVisit.service_type : "Your next visit"}</h2></div><span className="h-11 w-11 rounded-full bg-[#dff0b8] grid place-items-center"><CalendarDays className="h-5 w-5" /></span></div>
              {nextVisit ? <div className="mt-8 grid sm:grid-cols-3 gap-4 border-t border-[#dde2d9] pt-6"><div><p className="metric-label">Date</p><p className="mt-2 font-bold">{shortDate(nextVisit.scheduled_start)}</p></div><div><p className="metric-label">Status</p><p className="mt-2 font-bold capitalize">{statusLabel(nextVisit.status)}</p></div><div><p className="metric-label">Service note</p><p className="mt-2 text-sm leading-6 text-[#5c705f]">{nextVisit.notes_for_customer || "Details will appear before your visit."}</p></div></div> : <div className="mt-7 rounded-2xl bg-[#edf0e8] p-5 text-[#5c705f]"><p className="font-bold text-[#143c2a]">Nothing on the calendar yet.</p><p className="mt-1 text-sm leading-6">Send us a request and we’ll confirm the best service window for your property.</p></div>}
            </div>
            <div className="rounded-[1.5rem] bg-[#dd784d] p-6 text-[#143c2a] flex flex-col justify-between"><ClipboardList className="h-7 w-7" /><div><p className="eyebrow text-[#143c2a]">ACCOUNT ACTION</p><h2 className="display mt-3 text-3xl">Need a change?</h2><button onClick={() => setShowRequestForm(true)} className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold border-b-2 border-[#143c2a] pb-1">Send a service request <ChevronRight className="h-4 w-4" /></button></div></div>
          </section>

          <section id="property" className="grid lg:grid-cols-[1.1fr_.9fr] gap-5">
            <div className="paper-card p-6 sm:p-8"><div className="flex justify-between gap-4"><div><p className="eyebrow">YOUR PROPERTIES</p><h2 className="display mt-3 text-3xl">Care starts with context.</h2></div><button onClick={() => setShowPropertyForm(true)} className="icon-button"><Plus className="h-5 w-5" /></button></div>
              {properties.length ? <div className="mt-7 divide-y divide-[#dde2d9]">{properties.map(property => <div key={property.id} className="py-4 flex justify-between gap-4"><div><p className="font-bold">{property.nickname || "Property"}</p><p className="mt-1 text-sm text-[#5c705f]">{property.address_line1}, {property.city}, {property.state} {property.postal_code}</p></div><MapPin className="h-4 w-4 mt-1 text-[#4b743c]" /></div>)}</div> : <div className="mt-7 rounded-2xl border border-dashed border-[#b6c2b5] p-5"><p className="font-bold">Add your first property.</p><p className="mt-1 text-sm leading-6 text-[#5c705f]">This gives the team the right starting point before you request a service.</p><button onClick={() => setShowPropertyForm(true)} className="mt-4 text-sm font-bold underline underline-offset-4">Add property details</button></div>}
            </div>
            <div className="relative overflow-hidden rounded-[1.5rem] min-h-[280px]"><img src="/manus-storage/north-eastern-service_3e586567.jpg" alt="Professional mowing in progress" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#143c2a]/90 via-[#143c2a]/20 to-transparent" /><div className="absolute bottom-0 p-7 text-white"><Leaf className="h-6 w-6 text-[#b7e34b]" /><p className="eyebrow mt-4 text-[#b7e34b]">HOW WE WORK</p><p className="mt-2 font-medium leading-7 max-w-xs">Tell us what your property needs. We’ll turn it into a clear plan.</p></div></div>
          </section>

          <section id="billing" className="paper-card p-6 sm:p-8"><div className="flex items-start justify-between"><div><p className="eyebrow">BILLING</p><h2 className="display mt-3 text-3xl">Invoice overview.</h2></div><CircleDollarSign className="h-6 w-6 text-[#4b743c]" /></div>
            {outstanding.length ? <div className="mt-7 divide-y divide-[#dde2d9]">{outstanding.map(invoice => <div key={invoice.id} className="py-4 flex items-center justify-between gap-4"><div><p className="font-bold">{invoice.invoice_number}</p><p className="mt-1 text-sm text-[#5c705f]">Due {shortDate(invoice.due_date)} · {statusLabel(invoice.status)}</p></div><p className="font-bold">{formatCurrencyFromCents(invoice.amount_cents)}</p></div>)}</div> : <div className="mt-7 flex items-center gap-3 rounded-2xl bg-[#edf0e8] p-5"><Check className="h-5 w-5 text-[#4b743c]" /><div><p className="font-bold">No outstanding invoices.</p><p className="mt-1 text-sm text-[#5c705f]">Billing records will appear here when available.</p></div></div>}
          </section>
        </div>
      </div>

      {showPropertyForm ? <div className="modal-scrim"><form onSubmit={addProperty} className="modal-card"><div className="flex justify-between gap-4"><div><p className="eyebrow">PROPERTY SETUP</p><h2 className="display mt-2 text-3xl">Where do we care for?</h2></div><button type="button" onClick={() => setShowPropertyForm(false)} className="icon-button">×</button></div><div className="mt-7 grid gap-4"><input name="nickname" required placeholder="Property name (e.g. Home)" className="portal-input" /><input name="address" required placeholder="Street address" className="portal-input" /><div className="grid grid-cols-2 gap-4"><input name="city" required placeholder="City" className="portal-input" /><input name="state" required placeholder="State" className="portal-input" /></div><input name="postalCode" required placeholder="ZIP code" className="portal-input" /></div><button disabled={busy} className="brand-button mt-7 w-full justify-center">{busy ? "Saving…" : "Save property"} <ArrowUpRight className="h-4 w-4" /></button></form></div> : null}

      {showRequestForm ? <div className="modal-scrim"><form onSubmit={requestService} className="modal-card"><div className="flex justify-between gap-4"><div><p className="eyebrow">SERVICE REQUEST</p><h2 className="display mt-2 text-3xl">What can we help with?</h2></div><button type="button" onClick={() => setShowRequestForm(false)} className="icon-button">×</button></div><div className="mt-7 grid gap-4"><select name="propertyId" required className="portal-input"><option value="">Choose a property</option>{properties.map(property => <option key={property.id} value={property.id}>{property.nickname || property.address_line1}</option>)}</select><select name="serviceType" required className="portal-input"><option value="">Choose a service</option><option>Mowing & maintenance</option><option>Seasonal cleanup</option><option>Mulch & beds</option><option>Landscape improvement</option><option>Other property care</option></select><input name="preferredDate" type="date" required className="portal-input" /><textarea name="notes" rows={3} placeholder="Anything the team should know?" className="portal-input resize-none" /></div><button disabled={busy || !properties.length} className="brand-button mt-7 w-full justify-center">{busy ? "Sending…" : "Send request"} <ArrowUpRight className="h-4 w-4" /></button>{!properties.length ? <p className="mt-3 text-sm text-[#8a2d1c]">Add a property before sending your first request.</p> : null}</form></div> : null}
    </main>
  );
}
