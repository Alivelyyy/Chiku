import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

const BASE_URL = "https://chiku.apexdev.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Chiku — Discord Music Bot by ApeX Development",
    template: "%s | Chiku Music Bot",
  },
  description:
    "Chiku is a powerful Discord music bot with 80+ commands, 10+ streaming platforms, real-time web dashboard, audio filters, autoplay, 24/7 mode and much more. Built by ApeX Development.",
  keywords: [
    "Discord music bot",
    "Chiku bot",
    "ApeX Development",
    "Discord bot",
    "music bot",
    "YouTube Discord bot",
    "Spotify Discord bot",
    "web dashboard",
    "Lavalink bot",
    "free music bot Discord",
    "best Discord music bot",
    "24/7 music bot",
    "autoplay Discord",
  ],
  authors: [{ name: "ApeX Development", url: "https://discord.gg/q2jzjfYUJW" }],
  creator: "ApeX Development",
  publisher: "ApeX Development",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  icons: {
    icon: "/chiku.png",
    shortcut: "/chiku.png",
    apple: "/chiku.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Chiku Music Bot",
    title: "Chiku — Discord Music Bot by ApeX Development",
    description:
      "80+ commands, 10+ platforms, real-time web dashboard, audio filters, autoplay and 24/7 mode. The ultimate Discord music bot.",
    images: [
      {
        url: "/chiku.png",
        width: 512,
        height: 512,
        alt: "Chiku Discord Music Bot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chiku — Discord Music Bot by ApeX Development",
    description:
      "80+ commands, 10+ platforms, real-time web dashboard. The ultimate Discord music bot.",
    images: ["/chiku.png"],
    creator: "@ApexDevelopment",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
