import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import { db } from "@/lib/db";

const PLAN_LIMITS = {
  FREE: {
    documentsLimit: 10,
    questionsLimit: 50,
  },
  PROFESSIONAL: {
    documentsLimit: 50,
    questionsLimit: 200,
  },
  ENTERPRISE: {
    documentsLimit: 200,
    questionsLimit: 1000,
  },
};

export async function POST(request: Request) {
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

    const { plan } = await request.json();

    // Validate plan
    if (!PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]) {
      return NextResponse.json(
        { error: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

    // Update or create subscription
    const subscription = await db.subscription.upsert({
      where: { userId: payload.userId },
      update: {
        plan,
        documentsLimit: limits.documentsLimit,
        questionsLimit: limits.questionsLimit,
        status: "ACTIVE",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      create: {
        userId: payload.userId,
        plan,
        documentsLimit: limits.documentsLimit,
        questionsLimit: limits.questionsLimit,
        questionsUsed: 0,
        status: "ACTIVE",
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

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
    console.error("Error upgrading subscription:", error);
    return NextResponse.json(
      { error: "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}
