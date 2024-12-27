import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createToken, verifyToken } from "@/lib/jwt";

// Admin credentials - in production, use environment variables
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@virtuhelp.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin@123@";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Verify admin credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate admin token
    const token = await createToken({
      isAdmin: true,
      email: ADMIN_EMAIL,
    });

    // Set admin token in cookie with secure settings
    cookies().set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json({
      success: true,
      user: {
        email: ADMIN_EMAIL,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const token = cookies().get("admin-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const payload = await verifyToken(token);

    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        email: payload.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("Admin session error:", error);
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 401 }
    );
  }
}
