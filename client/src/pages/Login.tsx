/** North Eastern Lawn visual system: Cut & Collect. */
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ArrowUpRight, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation } from "wouter";

const MARK = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663476184245/nfSjHmOjvvqQCFMt.png";
const PORTAL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663476184245/lDzupWsPrlUCTEsB.jpg";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setError("");
    const { error: authError } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
    setSending(false); if (authError) return setError(authError.message); setSubmitted(true);
  }
  return <main className="min-h-screen bg-[#123c29] p-3 text-white sm:p-8"><section className="relative mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-5xl overflow-hidden rounded-[1.6rem] bg-[#123c29] lg:grid-cols-[.9fr_1.1fr] sm:min-h-[calc(100vh-4rem)]"><img src={PORTAL} alt="North Eastern Lawn property" className="absolute inset-0 h-full w-full object-cover opacity-30 lg:relative lg:opacity-100" /><div className="absolute inset-0 bg-[#123c29]/75 lg:hidden" /><div className="relative z-10 flex flex-col p-6 sm:p-10 lg:order-first"><button onClick={() => setLocation("/")} className="inline-flex w-fit items-center gap-2 text-sm font-bold text-white/85"><ArrowLeft className="h-4 w-4" /> Back to site</button><div className="mt-auto mb-auto max-w-md py-10"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#f6f1e8]"><img src={MARK} alt="North Eastern Lawn" className="h-10 w-10" /></span><p className="eyebrow mt-8 text-[#dd784d]">CUSTOMER PORTAL</p><h1 className="display mt-4 text-5xl leading-[.88] sm:text-6xl">Start with<br /><em>your place.</em></h1><p className="mt-5 leading-7 text-[#d3dfd2]">Sign in to build a quote, follow your care plan, and keep the property moving.</p></div></div><div className="relative z-10 flex items-end p-4 sm:p-8 lg:items-center"><div className="w-full rounded-[1.4rem] bg-[#f6f1e8] p-6 text-[#123c29] shadow-2xl sm:p-8">{submitted ? <div><div className="grid h-11 w-11 place-items-center rounded-full bg-[#dff0b8]"><Mail className="h-5 w-5" /></div><h2 className="display mt-6 text-3xl">Check your inbox.</h2><p className="mt-3 text-sm leading-6 text-[#5c705f]">We sent a secure sign-in link to <strong>{email}</strong>.</p><button onClick={() => setSubmitted(false)} className="mt-6 text-sm font-bold underline underline-offset-4">Use another email</button></div> : <form onSubmit={submit}><p className="eyebrow">SECURE SIGN-IN</p><h2 className="display mt-3 text-3xl">Ready when you are.</h2><label className="mt-7 block text-sm font-bold">Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} required autoComplete="email" placeholder="you@example.com" className="mt-2 h-12 w-full rounded-xl border border-[#c8d3c6] bg-white px-4 outline-none focus:border-[#4b743c] focus:ring-4 focus:ring-[#dff0b8]" /></label>{error ? <p className="mt-4 rounded-xl bg-[#f4ddd6] p-3 text-sm text-[#8a2d1c]">{error}</p> : null}<button disabled={sending} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#dd784d] text-sm font-black text-[#123c29]">{sending ? "Sending…" : "Send secure sign-in link"}<ArrowUpRight className="h-4 w-4" /></button></form>}</div></div></section></main>;
}
