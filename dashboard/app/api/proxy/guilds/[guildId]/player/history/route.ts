import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.BOT_API_URL;
const API_KEY  = process.env.BOT_API_KEY;

export async function GET(_req: Request, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const res = await fetch(`${API_URL}/api/guilds/${params.guildId}/player/history`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ history: [] });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ history: [] });
  }
}
