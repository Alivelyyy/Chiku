import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { botApi } from "@/lib/api";

export async function POST(req: Request, { params }: { params: { guildId: string; action: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: object | undefined;
  try { body = await req.json(); } catch { body = undefined; }

  try {
    const data = await botApi.playerAction(params.guildId, params.action, body);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
