import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { hashPassword, ADMIN_TOKEN } from "@/lib/auth";

export async function POST(request: Request) {
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

    // 2. Parse and Validate Request Body
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || typeof username !== "string" || username.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "Invalid username. Must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Invalid password. Must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();
    
    // Validate username characters (alphanumeric and underscores only for security)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(normalizedUsername)) {
      return NextResponse.json(
        { success: false, error: "Username can only contain letters, numbers, and underscores." },
        { status: 400 }
      );
    }

    // 3. Check if User Already Exists
    const existingUser = await kv.get(`user:${normalizedUsername}`);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: `User '${username}' already exists.` },
        { status: 400 }
      );
    }

    // 4. Hash Password and Store User
    const { hash, salt } = hashPassword(password);
    const userRole = role === "admin" ? "admin" : "user";
    
    const userObj = {
      username: username.trim(),
      hash,
      salt,
      role: userRole,
      createdAt: new Date().toISOString(),
    };

    // Store in KV: user details + add to general users index set
    await kv.set(`user:${normalizedUsername}`, userObj);
    await kv.sadd("users:all", normalizedUsername);

    return NextResponse.json(
      {
        success: true,
        message: `User '${username.trim()}' successfully created with role '${userRole}'.`,
        user: {
          username: username.trim(),
          role: userRole,
          createdAt: userObj.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create user", detail: error.message },
      { status: 500 }
    );
  }
}
