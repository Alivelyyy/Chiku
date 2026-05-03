"use client";
import { useState, useCallback } from "react";
import { Save, Loader2, Check } from "lucide-react";
import type { SettingsData } from "@/lib/types";

interface Props { guildId: string; initial: SettingsData; }

function Toggle({ value, onChange, label, description }: {
  value: boolean; onChange: (v: boolean) => void; label: string; description: string;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.055] last:border-0">
      <div className="pr-8">
        <p className="text-sm font-semibold text-white/85">{label}</p>
        <p className="text-[12px] text-white/32 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <button type="button" onClick={() => onChange(!value)}
        className={`toggle-root ${value ? "on" : "off"}`}>
        <span className={`toggle-thumb ${value ? "" : ""}`} />
      </button>
    </div>
  );
}

export default function SettingsForm({ guildId, initial }: Props) {
  const [form, setForm]     = useState(initial.settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState<string|null>(null);

  const set = useCallback(<K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const save = useCallback(async () => {
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/proxy/guilds/${guildId}/settings`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Save failed"); }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }, [guildId, form]);

  return (
    <div className="space-y-8">
      {/* General */}
      <div className="space-y-5">
        <p className="section-label">General</p>

        <div>
          <label className="label">Command Prefix</label>
          <input value={form.prefix} onChange={e => set("prefix", e.target.value)}
            maxLength={5} placeholder="!" className="input w-24" />
          <p className="text-xs text-white/28 mt-2">1–5 characters before every command.</p>
        </div>

        <div>
          <label className="label">Default Volume</label>
          <div className="flex items-center gap-4 mt-2">
            <input type="range" min={1} max={200} value={form.defaultVolume}
              onChange={e => set("defaultVolume", Number(e.target.value))}
              className="vol-slider flex-1 max-w-xs" />
            <span className="text-sm text-white font-mono font-bold w-12 text-right tabular-nums">
              {form.defaultVolume}%
            </span>
          </div>
        </div>

        <div>
          <label className="label">Language</label>
          <select value={form.language} onChange={e => set("language", e.target.value)} className="input w-44">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="pt">Português</option>
          </select>
        </div>
      </div>

      <div className="divider" />

      {/* Music Options */}
      <div>
        <p className="section-label mb-1">Music Options</p>
        <Toggle value={form.autoplay}      onChange={v => set("autoplay",v)}      label="Autoplay"       description="Automatically queue related songs when queue ends." />
        <Toggle value={form.alwaysOn}      onChange={v => set("alwaysOn",v)}      label="24/7 Mode"      description="Bot stays in voice channel when queue is empty." />
        <Toggle value={form.announceSongs} onChange={v => set("announceSongs",v)} label="Announce Songs"  description="Post a message in chat when a new track starts." />
      </div>

      <div className="divider" />

      {/* Permissions */}
      <div className="space-y-5">
        <p className="section-label">Permissions</p>

        <div>
          <label className="label">DJ Role</label>
          <select value={form.djRole ?? ""} onChange={e => set("djRole", e.target.value || null)} className="input">
            <option value="">None — everyone can use music commands</option>
            {initial.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <p className="text-xs text-white/28 mt-2">Restrict music controls to members with this role.</p>
        </div>

        <div>
          <label className="label">Music Channel</label>
          <select value={form.musicChannel ?? ""} onChange={e => set("musicChannel", e.target.value || null)} className="input">
            <option value="">None — any channel</option>
            {initial.channels.map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
          </select>
          <p className="text-xs text-white/28 mt-2">Limit music commands to a specific text channel.</p>
        </div>
      </div>

      {error && (
        <div className="border border-red-500/20 bg-red-500/[0.05] text-red-400/80 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button onClick={save} disabled={saving}
        className={`btn w-full justify-center py-3.5 text-sm font-bold ${saved ? "btn-secondary" : "btn-primary"}`}>
        {saving  ? <><Loader2 className="w-4 h-4 animate-spin"/>Saving…</>
          : saved ? <><Check className="w-4 h-4"/>Saved!</>
          : <><Save className="w-4 h-4"/>Save Settings</>}
      </button>
    </div>
  );
}
