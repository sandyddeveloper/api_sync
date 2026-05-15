import { NextResponse } from "next/server";
import { APP_CONFIG } from "@/lib/constants";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: APP_CONFIG,
  });
}
