import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Handle link-based approval from email
  if (token === "nila-eternal-2026") {
    await kv.set("vault_unlocked", true);
    return NextResponse.redirect(new URL("/?vault=unlocked", request.url));
  }

  const unlocked = await kv.get<boolean>("vault_unlocked") ?? false;
  const isDebug = process.env.NEXT_PUBLIC_DEBUG === "true";
  return NextResponse.json({ unlocked: isDebug || unlocked });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (token === "nila-eternal-2026") {
    await kv.set("vault_unlocked", true);
    return NextResponse.json({ message: "Vault Unlocked" });
  }

  return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
}
