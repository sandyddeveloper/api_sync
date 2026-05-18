import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { ADMIN_TOKEN } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // 1. Authenticate Admin
    const authHeader = request.headers.get("Authorization");
    const adminTokenHeader = request.headers.get("x-admin-token");
    
    let token = "";
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (adminTokenHeader) {
      token = adminTokenHeader;
    }

    if (!token || token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Valid admin token is required." },
        { status: 401 }
      );
    }

    // 2. Fetch all usernames from the index set
    const usernames = await kv.smembers("users:all");
    
    // 3. Resolve details for each registered user
    const users = [];
    for (const username of usernames) {
      const user: any = await kv.get(`user:${username}`);
      if (user) {
        users.push({
          username: user.username,
          role: user.role,
          subscriptionId: user.subscriptionId || null,
          createdAt: user.createdAt || null,
        });
      }
    }

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error: any) {
    console.error("Failed to list users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list users", detail: error.message },
      { status: 500 }
    );
  }
}
