import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = (session as any).accessToken as string;
  if (!token) return NextResponse.json({ error: "No access token" }, { status: 401 });

  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 30 },
  });

  if (!res.ok) return NextResponse.json({ error: "Discord API error" }, { status: res.status });

  const guilds = await res.json();
  const managed = guilds.filter((g: any) => (BigInt(g.permissions) & BigInt(0x20)) !== BigInt(0));
  return NextResponse.json(managed);
}
