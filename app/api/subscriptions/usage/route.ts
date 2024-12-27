import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Get the auth token from cookies
    const token = cookies().get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the JWT token
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { type } = await request.json();

    const subscription = await prisma.subscription.findUnique({
      where: { userId: payload.userId },
      select: {
        id: true,
        plan: true,
        documentsLimit: true,
        questionsLimit: true,
        questionsUsed: true,
        documentsUsed: true,
        validUntil: true,
        status: true,
      },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Check if subscription is still valid
    if (
      subscription.validUntil < new Date() ||
      subscription.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        { error: "Subscription expired or inactive" },
        { status: 403 }
      );
    }

    // Update the appropriate usage counter
    const updatedSubscription = await prisma.subscription.update({
      where: { userId: payload.userId },
      data: {
        questionsUsed: type === "question" ? { increment: 1 } : undefined,
        documentsUsed: type === "document" ? { increment: 1 } : undefined,
      },
      select: {
        plan: true,
        documentsLimit: true,
        questionsLimit: true,
        questionsUsed: true,
        documentsUsed: true,
        validUntil: true,
        status: true,
      },
    });

    // Format the response to match the Subscription type
    const formattedSubscription = {
      plan: updatedSubscription.plan,
      documentsPerMonth: updatedSubscription.documentsLimit,
      questionsPerMonth: updatedSubscription.questionsLimit,
      questionsUsed: updatedSubscription.questionsUsed,
      documentsUsed: updatedSubscription.documentsUsed,
      validUntil: updatedSubscription.validUntil,
      planId: updatedSubscription.plan,
    };

    return NextResponse.json(formattedSubscription);
  } catch (error) {
    console.error("Error updating usage:", error);
    return NextResponse.json(
      { error: "Failed to update usage" },
      { status: 500 }
    );
  }
}
