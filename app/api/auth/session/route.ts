import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token found" },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      // Clear invalid token
      cookieStore.delete("auth-token");
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: {
          select: {
            plan: true,
            documentsLimit: true,
            questionsLimit: true,
            questionsUsed: true,
            validUntil: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      // Clear token if user not found
      cookieStore.delete("auth-token");
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Format user data for response
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscription: user.subscription
        ? {
            plan: user.subscription.plan,
            documentsPerMonth: user.subscription.documentsLimit,
            questionsPerMonth: user.subscription.questionsLimit,
            questionsUsed: user.subscription.questionsUsed,
            validUntil: user.subscription.validUntil,
            status: user.subscription.status,
          }
        : null,
    };

    // Return the current session data
    return NextResponse.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 401 }
    );
  }
}
