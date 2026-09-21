import { NextResponse } from "next/server";
import { clearConnection } from "@/lib/multipost/session";

export async function POST() {
  await Promise.all([clearConnection("meta"), clearConnection("meta_pending")]);
  return NextResponse.json({ ok: true });
}
