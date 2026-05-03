import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const API_URL = process.env.BOT_API_URL;
const API_KEY = process.env.BOT_API_KEY;

export async function GET(req: NextRequest, { params }: { params: { guildId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q) return NextResponse.json({ error: "Missing ?q=" }, { status: 400 });

  try {
    const res = await fetch(
      `${API_URL}/api/guilds/${params.guildId}/player/search?q=${encodeURIComponent(q)}`,
      {
        headers: { Authorization: `Bearer ${API_KEY}` },
        cache: "no-store",
      }
    );
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
