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
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user's subscription from database
    const subscription = await db.subscription.findUnique({
      where: { userId: payload.userId },
      select: {
        plan: true,
        documentsLimit: true,
        questionsLimit: true,
        questionsUsed: true,
        validUntil: true,
        status: true,
      },
    });

    if (!subscription) {
      // Return default free plan if no subscription exists
      return NextResponse.json({
        plan: "FREE",
        documentsLimit: 10,
        questionsLimit: 50,
        questionsUsed: 0,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: "ACTIVE",
      });
    }

    // Format subscription data
    const formattedSubscription = {
      plan: subscription.plan,
      documentsPerMonth: subscription.documentsLimit,
      questionsPerMonth: subscription.questionsLimit,
      questionsUsed: subscription.questionsUsed,
      validUntil: subscription.validUntil,
      status: subscription.status,
    };

    return NextResponse.json(formattedSubscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
