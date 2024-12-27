import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";
import {
  getPayPalAccessToken,
  cancelSubscription,
  updateSubscription,
} from "@/lib/paypal";
import { Plan, Status } from "@prisma/client";

// Get subscription plans
export async function GET() {
  try {
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/billing/plans",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

// Create/Update subscription
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

    const { planId } = await request.json();

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle free plan subscription
    if (planId === "FREE") {
      const subscription = await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          plan: Plan.FREE,
          documentsLimit: 3,
          questionsLimit: 20,
          status: Status.ACTIVE,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        create: {
          userId: user.id,
          plan: Plan.FREE,
          documentsLimit: 3,
          questionsLimit: 20,
          status: Status.ACTIVE,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json({ success: true, subscription });
    }

    // If user has an existing subscription, handle upgrade/downgrade
    if (user.subscription?.paypalSubscriptionId) {
      const updatedSubscription = await updateSubscription(
        user.subscription.paypalSubscriptionId,
        planId
      );
      return NextResponse.json({
        success: true,
        subscription: updatedSubscription,
      });
    }

    // Create a new subscription
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/billing/subscriptions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          subscriber: {
            name: {
              given_name: user.name?.split(" ")[0] || "",
              surname: user.name?.split(" ").slice(1).join(" ") || "",
            },
            email_address: user.email,
          },
          application_context: {
            brand_name: "HealthAI",
            locale: "en-US",
            shipping_preference: "NO_SHIPPING",
            user_action: "SUBSCRIBE_NOW",
            payment_method: {
              payer_selected: "PAYPAL",
              payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
            },
            return_url: `${process.env.NEXTAUTH_URL}/subscription?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/subscription?canceled=true`,
          },
          custom_id: user.id,
        }),
      }
    );

    const data = await response.json();

    if (data.status === "APPROVAL_PENDING") {
      return NextResponse.json({
        url: data.links.find((link: any) => link.rel === "approve").href,
      });
    }

    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// Cancel subscription
export async function DELETE(request: Request) {
  try {
    const token = cookies().get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { subscription: true },
    });

    if (!user?.subscription) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 404 }
      );
    }

    if (user.subscription.paypalSubscriptionId) {
      await cancelSubscription(user.subscription.paypalSubscriptionId);
    }

    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        status: Status.CANCELLED,
        validUntil: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
