import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    // Verify admin token
    const token = cookies().get("admin-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current date range
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Fetch basic user stats
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            status: true,
            plan: true,
            price: true,
          },
        },
      },
    });

    // Calculate user statistics
    const totalUsers = users.length;
    const activeUsers = users.filter(
      (user) => user.subscription?.status === "ACTIVE"
    ).length;

    // Calculate subscription stats
    const subscriptionStats = {
      free: 0,
      pro: 0,
      enterprise: 0,
      totalRevenue: 0,
    };

    users.forEach((user) => {
      if (user.subscription) {
        const plan = user.subscription.plan.toLowerCase();
        if (plan === "free") subscriptionStats.free++;
        if (plan === "pro") subscriptionStats.pro++;
        if (plan === "enterprise") subscriptionStats.enterprise++;
        subscriptionStats.totalRevenue += user.subscription.price || 0;
      } else {
        subscriptionStats.free++;
      }
    });

    // Generate daily stats for the last 30 days
    const dailyStats = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split("T")[0];

      // Count users created on this date
      const newUsers = users.filter(
        (user) => user.createdAt.toISOString().split("T")[0] === dateStr
      ).length;

      return {
        date: dateStr,
        newUsers,
        revenue: Math.floor(Math.random() * 1000), // Replace with actual revenue data
        activeUsers: Math.floor(activeUsers * (0.9 + Math.random() * 0.2)), // Simulate daily active users
      };
    });

    // Calculate monthly metrics
    const thisMonthUsers = users.filter(
      (user) => user.createdAt >= startOfMonth
    ).length;
    const lastMonthUsers = users.filter(
      (user) =>
        user.createdAt >= startOfLastMonth && user.createdAt < startOfMonth
    ).length;
    const userGrowth =
      lastMonthUsers > 0
        ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
        : 0;

    // Prepare dashboard data
    const dashboardData = {
      overview: {
        totalUsers,
        activeUsers,
        totalRevenue: subscriptionStats.totalRevenue,
        monthlyRevenue: subscriptionStats.totalRevenue / 12, // Simplified monthly revenue
        userGrowth,
      },
      usageStats: {
        totalQuestions: 0, // Replace with actual usage data
        totalDocuments: 0,
        averageQuestionsPerUser: 0,
        averageDocumentsPerUser: 0,
      },
      subscriptions: {
        free: subscriptionStats.free,
        pro: subscriptionStats.pro,
        enterprise: subscriptionStats.enterprise,
      },
      costs: {
        total: 0, // Replace with actual cost data
        byType: {
          "API Usage": 0,
          Storage: 0,
          Other: 0,
        },
        dailyAverage: 0,
        projectedMonthly: 0,
      },
      revenue: {
        total: subscriptionStats.totalRevenue,
        monthly: subscriptionStats.totalRevenue / 12,
        lastMonth: subscriptionStats.totalRevenue / 12,
        growth: 0,
        history: dailyStats.map((stat) => ({
          date: stat.date,
          revenue: stat.revenue,
          subscriptions: Math.floor(stat.revenue / 100), // Simplified subscription count
        })),
      },
      metrics: {
        profitMargin: 80, // Replace with actual metrics
        averageRevenuePerUser:
          totalUsers > 0
            ? Math.round(subscriptionStats.totalRevenue / totalUsers)
            : 0,
        conversionRate:
          totalUsers > 0
            ? ((subscriptionStats.pro + subscriptionStats.enterprise) /
                totalUsers) *
              100
            : 0,
      },
      // For AdminStats compatibility
      revenueHistory: dailyStats.map((stat) => ({
        date: stat.date,
        revenue: stat.revenue,
        subscriptions: Math.floor(stat.revenue / 100),
      })),
      userGrowth: dailyStats.map((stat) => ({
        date: stat.date,
        totalUsers: totalUsers,
        activeUsers: stat.activeUsers,
      })),
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
