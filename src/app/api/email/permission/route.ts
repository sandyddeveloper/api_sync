import { NextResponse } from "next/server";
import { INITIAL_PERMISSIONS } from "@/lib/constants";

// In a real app without a DB, we might use a global variable (reset on restart) 
// or a file-based storage. Since the user said "all thing is static", 
// I'll simulate a toggle.
let currentPermissions = { ...INITIAL_PERMISSIONS };

export async function GET() {
  return NextResponse.json({
    success: true,
    data: currentPermissions,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    currentPermissions = { ...currentPermissions, ...body };
    
    return NextResponse.json({
      success: true,
      message: "Permissions updated successfully",
      data: currentPermissions,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }
}
