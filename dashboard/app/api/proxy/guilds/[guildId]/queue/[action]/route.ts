import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { botApi } from "@/lib/api";

export async function POST(_req: Request, { params }: { params: { guildId: string; action: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = await botApi.queueAction(params.guildId, params.action);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { guildId: string; action: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const index = Number(params.action);
  if (isNaN(index)) return NextResponse.json({ error: "Invalid index" }, { status: 400 });
  try {
    const data = await botApi.removeTrack(params.guildId, index);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
