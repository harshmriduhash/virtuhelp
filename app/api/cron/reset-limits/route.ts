import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionManager } from "@/lib/subscription-manager";

// This endpoint should be called by a cron job service (e.g., Vercel Cron)
export async function GET(request: Request) {
  try {
    // Verify cron secret to ensure this is called by the cron service
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
      },
    });

    // Process each subscription
    const results = await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          const manager = new SubscriptionManager(subscription.userId);
          await manager.checkAndResetMonthlyLimits();
          return {
            userId: subscription.userId,
            status: "success",
          };
        } catch (error) {
          console.error(
            `Error processing subscription for user ${subscription.userId}:`,
            error
          );
          return {
            userId: subscription.userId,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { error: "Failed to process subscriptions" },
      { status: 500 }
    );
  }
}
