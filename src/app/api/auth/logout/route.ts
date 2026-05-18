import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Create the response
    const response = NextResponse.json(
      {
        success: true,
        message: "Successfully logged out. Client-side session tokens should now be cleared.",
      },
      { status: 200 }
    );

    // Securely clear any HTTP-only authentication cookies if present (best practice)
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0), // Set expiration to past, telling the browser to delete it immediately
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during logout." },
      { status: 500 }
    );
  }
}
