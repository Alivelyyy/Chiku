import { Lock } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `When you use Chiku or the dashboard, we may collect:\n\nDiscord Account Data: Your Discord user ID, username, avatar, and the list of servers you manage (via OAuth2 — read-only).\n\nServer Data: Guild IDs, settings you configure (prefix, DJ role, music channel), and player state information.\n\nUsage Data: Commands used, tracks queued, and session statistics. We do not collect or store the content of your messages.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use collected information to:\n• Operate and improve the Chiku bot and dashboard\n• Save your server settings and preferences\n• Provide player history and statistics features\n• Diagnose technical issues and improve performance\n\nWe do not sell, rent, or share your personal information with third parties for marketing purposes.`,
  },
  {
    title: "3. Data Storage",
    body: `Server settings and preferences are stored in a secure database. Discord OAuth tokens are stored in encrypted session cookies and are never logged or shared. We use industry-standard security practices to protect your data.`,
  },
  {
    title: "4. Data We Do NOT Collect",
    body: `• The content of your Discord messages\n• Voice audio data\n• Private Discord channels or DMs\n• Payment information (Premium is not yet launched)\n• Any data beyond what's needed for bot functionality`,
  },
  {
    title: "5. Third-Party Services",
    body: `Chiku interacts with Discord, YouTube, Spotify, and other streaming platforms to provide music functionality. These services have their own privacy policies. When you play music, requests are made to their APIs in accordance with their terms.`,
  },
  {
    title: "6. Data Retention",
    body: `Server settings are retained as long as Chiku remains in your server. Session history is automatically cleared after 7 days or when a new session starts. You can request data deletion at any time by contacting us.`,
  },
  {
    title: "7. Your Rights",
    body: `You have the right to:\n• Request a copy of data we hold about you\n• Request deletion of your data\n• Opt out of analytics collection\n• Remove Chiku from your server at any time, which stops all data collection`,
  },
  {
    title: "8. Children's Privacy",
    body: `Chiku is not directed at children under 13. If you are under 13, please do not use this service. We do not knowingly collect information from children.`,
  },
  {
    title: "9. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify users of significant changes through our Discord support server or the dashboard.`,
  },
  {
    title: "10. Contact",
    body: `If you have privacy concerns or requests, contact us through our Discord support server or the contact page.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative px-5 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          border border-white/[0.07] bg-white/[0.03] text-xs text-white/40 font-bold uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5" /> Privacy
          </div>
          <h1 className="page-title text-gradient-sharp">Privacy Policy</h1>
          <p className="text-white/40 text-[14px] leading-6">
            Last updated: May 2026 · We take your privacy seriously.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-2xl mx-auto px-5 pb-24 space-y-4">
        {SECTIONS.map(({ title, body }) => (
          <div key={title} className="glass-card p-6 space-y-3">
            <h2 className="font-black text-[15px] text-white">{title}</h2>
            <div className="text-[13px] text-white/45 leading-6 whitespace-pre-line">{body}</div>
          </div>
        ))}

        <div className="glass-card p-6 border-white/[0.055]">
          <p className="text-[13px] text-white/35 leading-6">
            Privacy questions? Reach us on our{" "}
            <a href="https://discord.gg/q2jzjfYUJW" target="_blank" rel="noopener noreferrer"
              className="text-white hover:text-white/70 transition-colors underline">
              Discord support server
            </a>{" "}
            or through the{" "}
            <a href="/contact" className="text-white hover:text-white/70 transition-colors underline">
              contact page
            </a>.
          </p>
        </div>
      </section>
    </div>
  );
}
