"use client";
import { useState } from "react";
import { MessageCircle, Mail, Send, Check, Loader2, Clock } from "lucide-react";

const CONTACTS = [
  { icon:MessageCircle, label:"Discord Server",   desc:"Fastest response. Join and open a support ticket.",      href:"https://discord.gg/q2jzjfYUJW",                          cta:"Join Discord" },
  { icon:Mail,          label:"Email",            desc:"For business inquiries and partnership opportunities.",   href:"mailto:contact@apexdev.xyz",                             cta:"Send Email"   },
];

const TIMES = [
  ["Discord",  "Usually < 1 hour"],
  ["Email",    "Within 48 hours"],
];

export default function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [status, setStatus] = useState<"idle"|"sending"|"done">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 1400));
    setStatus("done");
  };

  return (
    <div className="text-white">
      <section className="relative px-5 py-28 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-xs text-white/42 font-semibold mb-8 backdrop-blur-sm">
            <Mail className="w-3.5 h-3.5" /> We reply within 24 hours
          </div>
          <h1 className="page-title mb-7">
            Get in<br /><span className="text-gradient">touch</span>
          </h1>
          <p className="text-lg text-white/38 max-w-xl mx-auto leading-7">
            Have a question, bug report, or business inquiry? We're here to help.
          </p>
        </div>
      </section>

      <section className="px-5 pb-28 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="section-label mb-5">Quick contact</p>
            {CONTACTS.map(({ icon:Icon, label, desc, href, cta }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="glass-card feature-card flex items-center gap-5 p-5 group block">
                <div className="w-11 h-11 rounded-xl border border-white/[0.07] bg-white/[0.035] flex items-center justify-center flex-shrink-0 group-hover:border-white/14 transition-all">
                  <Icon className="w-4.5 h-4.5 text-white/48" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[13px] mb-0.5">{label}</h3>
                  <p className="text-[12px] text-white/35 leading-5">{desc}</p>
                </div>
                <span className="text-[11px] text-white/28 group-hover:text-white/65 transition-colors flex-shrink-0">{cta} →</span>
              </a>
            ))}

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-3.5 h-3.5 text-white/30" />
                <p className="section-label">Response times</p>
              </div>
              <div className="space-y-3">
                {TIMES.map(([ch, t]) => (
                  <div key={ch} className="flex items-center justify-between text-[13px]">
                    <span className="text-white/42">{ch}</span>
                    <span className="text-white/25 font-mono text-[11px]">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="section-label mb-5">Send a message</p>
            {status === "done" ? (
              <div className="glass-card-elevated p-12 text-center min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden inner-glow-top">
                <div className="absolute inset-0 bg-radial-glow opacity-35 pointer-events-none" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5">
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-black text-xl mb-2">Message sent!</h3>
                  <p className="text-[13px] text-white/38 max-w-xs leading-6">
                    We'll get back to you within 24–48 hours. For urgent issues, join our Discord.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name</label>
                    <input className="input" placeholder="Your name" value={form.name} onChange={e => setForm(p => ({...p,name:e.target.value}))} required />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({...p,email:e.target.value}))} required />
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input className="input" placeholder="What's this about?" value={form.subject} onChange={e => setForm(p => ({...p,subject:e.target.value}))} required />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input resize-none" style={{height:"8.5rem"}} placeholder="Tell us more…" value={form.message} onChange={e => setForm(p => ({...p,message:e.target.value}))} required />
                </div>
                <button type="submit" disabled={status==="sending"} className="btn-primary w-full justify-center py-3 text-sm">
                  {status==="sending"
                    ? <><Loader2 className="w-4 h-4 animate-spin"/>Sending…</>
                    : <><Send className="w-4 h-4"/>Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
