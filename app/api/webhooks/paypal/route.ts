import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Plan, Status } from "@prisma/client";

const WEBHOOK_SECRET = process.env.PAYPAL_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.event_type;

    // Handle subscription events
    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.CREATED": {
        const paypalId = body.resource.id;
        const planId = body.resource.plan_id;

        // Map PayPal plan IDs to our plan types
        const planMap: Record<string, Plan> = {
          [process.env.NEXT_PUBLIC_PAYPAL_BASIC_PLAN_ID!]: Plan.PROFESSIONAL,
          [process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID!]: Plan.ENTERPRISE,
        };

        const plan = planMap[planId] || Plan.FREE;

        // Update subscription status
        await db.subscription.updateMany({
          where: {
            paypalId,
          },
          data: {
            status: Status.ACTIVE,
            plan,
          },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        const paypalId = body.resource.id;
        await db.subscription.updateMany({
          where: {
            paypalId,
          },
          data: {
            status: Status.CANCELLED,
            plan: Plan.FREE,
          },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const paypalId = body.resource.id;
        await db.subscription.updateMany({
          where: {
            paypalId,
          },
          data: {
            status: Status.SUSPENDED,
          },
        });
        break;
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        const paypalId = body.resource.id;
        await db.subscription.updateMany({
          where: {
            paypalId,
          },
          data: {
            status: Status.PAYMENT_FAILED,
          },
        });
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PAYPAL_WEBHOOK_ERROR]", error);
    return new NextResponse("Webhook Error", { status: 500 });
  }
}
