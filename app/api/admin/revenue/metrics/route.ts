import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: Request) {
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

    // In production, replace with actual revenue metrics collection
    const monthlyRevenue = Math.floor(Math.random() * 100000);
    const lastMonthRevenue = Math.floor(Math.random() * 100000);
    const revenueGrowth = Math.floor(
      ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    );

    // Generate revenue history data
    const revenueHistory = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split("T")[0],
        revenue: Math.floor(Math.random() * 10000),
        subscriptions: Math.floor(Math.random() * 100),
      };
    });

    // Calculate totals
    const totalRevenue = revenueHistory.reduce(
      (sum, day) => sum + day.revenue,
      0
    );

    const metrics = {
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue: totalRevenue * 12,
      revenueGrowth,
      activeSubscriptions: Math.floor(Math.random() * 1000),
      averageRevenue: Math.floor(monthlyRevenue / 100),
      subscriptionRevenue: Math.floor(monthlyRevenue * 0.8),
      oneTimeRevenue: Math.floor(monthlyRevenue * 0.2),
      revenueByPlan: {
        free: 0,
        pro: Math.floor(monthlyRevenue * 0.6),
        enterprise: Math.floor(monthlyRevenue * 0.4),
      },
      revenueHistory,
      planDistribution: [
        { name: "Free", value: 0 },
        { name: "Pro", value: Math.floor(monthlyRevenue * 0.6) },
        { name: "Enterprise", value: Math.floor(monthlyRevenue * 0.4) },
      ],
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Revenue metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue metrics" },
      { status: 500 }
    );
  }
}
