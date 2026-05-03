import { FileText } from "lucide-react";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By inviting Chiku to your Discord server or using the Chiku web dashboard, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use Chiku.`,
  },
  {
    title: "2. Description of Service",
    body: `Chiku is a Discord music bot and associated web dashboard provided by ApeX Development. The service allows users to play music in Discord voice channels through various streaming platforms.`,
  },
  {
    title: "3. User Responsibilities",
    body: `You are responsible for all activity that occurs under your server or account. You agree not to use Chiku to:\n• Violate Discord's Terms of Service or Community Guidelines\n• Stream copyrighted content in violation of applicable law\n• Spam commands or attempt to overload the bot\n• Attempt to exploit, hack, or reverse-engineer the service\n• Harass, abuse, or harm other users`,
  },
  {
    title: "4. Intellectual Property",
    body: `All code, design, branding, and content related to Chiku are the exclusive property of ApeX Development. Unauthorized reproduction, distribution, or reverse-engineering is prohibited. The Chiku name, logo, and branding may not be used without explicit written permission from ApeX Development.`,
  },
  {
    title: "5. Third-Party Services",
    body: `Chiku interfaces with third-party services including Discord, YouTube, Spotify, and others. Your use of these services is governed by their respective terms. We are not responsible for the content, policies, or actions of these third parties.`,
  },
  {
    title: "6. Disclaimer of Warranties",
    body: `Chiku is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, audio quality from third-party sources, or specific feature availability.`,
  },
  {
    title: "7. Limitation of Liability",
    body: `ApeX Development shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of or inability to use Chiku.`,
  },
  {
    title: "8. Termination",
    body: `We reserve the right to terminate or restrict access to Chiku for any server or user that violates these terms, at our sole discretion, without notice.`,
  },
  {
    title: "9. Changes to Terms",
    body: `We may update these Terms at any time. Continued use of Chiku after changes constitutes acceptance of the updated terms.`,
  },
  {
    title: "10. Contact",
    body: `For questions about these Terms, contact us at our Discord support server or via the contact page.`,
  },
];

export default function TermsPage() {
  return (
    <div className="text-white">
      {/* Hero */}
      <section className="relative px-5 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-glow opacity-40 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          border border-white/[0.07] bg-white/[0.03] text-xs text-white/40 font-bold uppercase tracking-widest">
            <FileText className="w-3.5 h-3.5" /> Legal
          </div>
          <h1 className="page-title text-gradient-sharp">Terms of Service</h1>
          <p className="text-white/40 text-[14px] leading-6">
            Last updated: May 2026 · Effective immediately upon use.
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
            Questions? Reach us on our{" "}
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
