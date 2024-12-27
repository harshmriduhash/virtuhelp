import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createToken, verifyToken } from "@/lib/jwt";

// Admin session check endpoint
export async function GET(request: Request) {
  const token = cookies().get("admin-token")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "No admin session found" },
      { status: 401 }
    );
  }

  try {
    const isValid = await verifyAdminToken(token);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid admin session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin session is valid",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid admin session" },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Verify admin credentials
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate admin token
    const token = await createToken({
      email,
      role: "ADMIN",
      isAdmin: true,
    });

    // Create response with token
    const response = NextResponse.json({
      success: true,
      message: "Admin logged in successfully",
      user: { email, role: "ADMIN" },
    });

    // Set secure cookie with absolute path
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/", // Ensure cookie is available for all paths
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Verify admin token middleware using our centralized JWT utility
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const payload = await verifyToken(token);
    return payload?.role === "ADMIN";
  } catch {
    return false;
  }
}

// Admin logout endpoint
export async function DELETE(request: Request) {
  const response = NextResponse.json({
    success: true,
    message: "Admin logged out successfully",
  });

  // Clear the admin token cookie
  response.cookies.set("admin-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
