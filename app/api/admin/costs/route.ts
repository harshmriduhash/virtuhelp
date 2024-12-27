import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Can't use edge runtime with Prisma
export const runtime = "nodejs";

interface OpenAICostResult {
  object: string;
  amount: {
    value: number;
    currency: string;
  };
  line_item: string | null;
  project_id: string | null;
}

interface OpenAICostBucket {
  object: string;
  start_time: number;
  end_time: number;
  results: OpenAICostResult[];
}

interface OpenAICostResponse {
  object: string;
  data: OpenAICostBucket[];
  has_more: boolean;
  next_page: string | null;
}

export async function GET(request: Request) {
  try {
    const headersList = headers();
    const adminKey = headersList.get("x-admin-key");

    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate start time (30 days ago)
    const startTime = Math.floor(
      (Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000
    );

    const response = await fetch(
      `https://api.openai.com/v1/organization/costs?start_time=${startTime}&limit=30&group_by=line_item`,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = (await response.json()) as OpenAICostResponse;

    // Process and aggregate the cost data
    const costsByType: Record<string, number> = {};
    let totalCost = 0;

    data.data.forEach((bucket) => {
      bucket.results.forEach((result) => {
        const lineItem = result.line_item || "Other";
        const cost = result.amount.value;

        costsByType[lineItem] = (costsByType[lineItem] || 0) + cost;
        totalCost += cost;
      });
    });

    // Calculate daily average
    const dailyAverage = totalCost / 30;

    // Project monthly cost based on daily average
    const projectedMonthlyCost = dailyAverage * 30;

    const costSummary = {
      total_cost: totalCost,
      daily_average: dailyAverage,
      projected_monthly: projectedMonthlyCost,
      costs_by_type: costsByType,
      raw_data: data,
    };

    // Store the cost data in the database for historical tracking
    await prisma.openAICost.create({
      data: {
        totalCost,
        dailyAverage,
        projectedMonthlyCost,
        costsByType,
        rawData: data,
        timestamp: new Date(),
      },
    });

    return NextResponse.json(costSummary);
  } catch (error) {
    console.error("Error fetching OpenAI costs:", error);
    return NextResponse.json(
      { error: "Failed to fetch OpenAI costs" },
      { status: 500 }
    );
  }
}
