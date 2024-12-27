import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyAdminToken } from "../auth/login/route";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "month";

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeframe) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to month
    }

    // Get users with subscriptions and usage
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        usage: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        },
      },
    });

    // Get OpenAI costs
    const costs = await prisma.openAICost.findMany({
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Calculate active users (with active subscriptions)
    const activeUsers = users.filter(
      (user) => user.subscription?.status === "ACTIVE"
    ).length;

    // Calculate total questions and documents
    const usageStats = users.reduce(
      (acc, user) => {
        const questions = user.usage.filter(
          (u: { type: string }) => u.type === "question"
        ).length;
        const documents = user.usage.filter(
          (u: { type: string }) => u.type === "document"
        ).length;
        return {
          totalQuestions: acc.totalQuestions + questions,
          totalDocuments: acc.totalDocuments + documents,
          averageQuestionsPerUser: questions / (users.length || 1),
          averageDocumentsPerUser: documents / (users.length || 1),
        };
      },
      {
        totalQuestions: 0,
        totalDocuments: 0,
        averageQuestionsPerUser: 0,
        averageDocumentsPerUser: 0,
      }
    );

    // Calculate subscription stats
    const subscriptionStats = users.reduce(
      (acc, user) => {
        const plan = user.subscription?.plan || "FREE";
        acc[plan.toLowerCase()] = (acc[plan.toLowerCase()] || 0) + 1;
        return acc;
      },
      { free: 0, professional: 0, enterprise: 0 } as Record<string, number>
    );

    // Calculate revenue (convert from cents to dollars)
    const revenue = users.reduce((acc, user) => {
      if (
        user.subscription?.status === "ACTIVE" &&
        user.subscription.price > 0
      ) {
        // Convert price from cents to dollars
        const priceInDollars = user.subscription.price / 100;
        return acc + priceInDollars;
      }
      return acc;
    }, 0);

    // Get latest OpenAI cost
    const latestCost = costs[0] || {
      totalCost: 0,
      dailyAverage: 0,
      projectedMonthlyCost: 0,
    };

    const stats = {
      overview: {
        totalUsers: users.length,
        activeUsers,
        totalRevenue: revenue,
        monthlyRevenue: revenue / 12, // Approximate monthly revenue
        paidUsers: users.filter(
          (user) =>
            user.subscription?.status === "ACTIVE" &&
            user.subscription.price > 0
        ).length,
        openaiCosts: {
          total: latestCost.totalCost,
          daily: latestCost.dailyAverage,
          projected: latestCost.projectedMonthlyCost,
        },
      },
      usageStats,
      subscriptions: subscriptionStats,
      timeframe,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 }
    );
  }
}
