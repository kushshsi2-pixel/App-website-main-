/**
 * North Eastern Lawn visual system: Field Notes & Fine Lines.
 * A quiet, field-note-inspired sign-in page for customer account access.
 */
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowUpRight, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSending(true);

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });

    setIsSending(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f3f1ea] text-[#143c2a] p-4 sm:p-8">
      <section className="relative overflow-hidden mx-auto max-w-6xl min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-4rem)] bg-[#143c2a] text-[#f8f6ef] rounded-[2rem] px-6 py-8 sm:px-12 sm:py-12 flex flex-col">
        <div className="absolute inset-0 opacity-20 pointer-events-none field-grid" />
        <header className="relative flex items-center justify-between gap-4">
          <button onClick={() => setLocation("/")} className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide hover:text-[#b7e34b] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </button>
          <img src="/manus-storage/north-eastern-lawn-supplied-logo_158228a0.png" alt="North Eastern Lawn" className="h-14 w-24 object-contain object-right brightness-0 invert" />
        </header>

        <div className="relative flex-1 grid lg:grid-cols-[1.05fr_.95fr] gap-12 items-center py-16 lg:py-8">
          <div className="max-w-xl">
            <p className="eyebrow text-[#b7e34b]">CUSTOMER PORTAL / SECURE ACCESS</p>
            <h1 className="display mt-5 text-5xl sm:text-6xl leading-[.95]">Your property.<br /><em>Your plan.</em></h1>
            <p className="mt-7 text-lg leading-8 text-[#d9e1d8] max-w-md">View your upcoming work, keep property details current, and send a request directly to the team.</p>
            <div className="mt-12 flex items-center gap-4 text-sm text-[#c4d1c6]">
              <span className="h-px w-12 bg-[#b7e34b]" />
              A link that signs you in securely.
            </div>
          </div>

          <div className="relative bg-[#f8f6ef] text-[#143c2a] rounded-[1.6rem] p-7 sm:p-9 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between mb-9">
              <div className="h-11 w-11 rounded-full bg-[#dff0b8] grid place-items-center"><Mail className="h-5 w-5" /></div>
              <span className="text-xs font-bold uppercase tracking-[.16em] text-[#657568]">Portal sign-in</span>
            </div>
            {submitted ? (
              <div className="py-4">
                <h2 className="display text-3xl">Check your inbox.</h2>
                <p className="mt-4 leading-7 text-[#506352]">We sent a secure sign-in link to <strong>{email}</strong>. Open it on this device to continue to your dashboard.</p>
                <button onClick={() => setSubmitted(false)} className="mt-7 text-sm font-bold underline underline-offset-4 hover:text-[#4b743c]">Use a different email</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="text-sm font-bold">Email address</label>
                  <input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="you@example.com" className="mt-2 h-13 w-full rounded-xl border border-[#cbd4c9] bg-white px-4 text-base outline-none transition focus:border-[#4b743c] focus:ring-4 focus:ring-[#dff0b8]" />
                </div>
                {error ? <p className="rounded-xl bg-[#f4ddd6] p-3 text-sm text-[#8a2d1c]">{error}</p> : null}
                <button disabled={isSending} type="submit" className="brand-button w-full justify-center">
                  {isSending ? "Sending secure link…" : "Email me a secure link"} <ArrowUpRight className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
        <p className="relative text-xs uppercase tracking-[.15em] text-[#aab9ac]">North Eastern Lawn · Professional landscaping services</p>
      </section>
    </main>
  );
}
