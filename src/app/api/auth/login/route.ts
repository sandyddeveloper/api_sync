import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 1. Basic Validation
    if (!username || typeof username !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Username and password are required." },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    // 2. Fetch User from Vercel KV
    const user: any = await kv.get(`user:${normalizedUsername}`);
    if (!user) {
      // Use standard generic error message to prevent username enumeration attacks
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // 3. Verify Password
    const isValid = verifyPassword(password, user.hash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // 4. Generate Session Token
    const sessionToken = generateToken({
      username: user.username,
      role: user.role,
    });

    // 5. Return Success with Token and Profile (excluding sensitive hashes)
    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        token: sessionToken,
        user: {
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login.", detail: error.message },
      { status: 500 }
    );
  }
}
