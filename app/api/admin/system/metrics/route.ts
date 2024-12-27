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

    // In production, replace with actual system metrics collection
    const metrics = {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      storage: Math.floor(Math.random() * 100),
      apiLatency: Math.floor(Math.random() * 200),
      databaseConnections: Math.floor(Math.random() * 100),
      errors24h: Math.floor(Math.random() * 50),
      uptime: Math.floor(Math.random() * 720), // Hours
    };

    const services = [
      {
        name: "API Server",
        status: "operational" as const,
        latency: Math.floor(Math.random() * 100),
      },
      {
        name: "Database",
        status: "operational" as const,
        latency: Math.floor(Math.random() * 50),
      },
      {
        name: "Storage Service",
        status:
          Math.random() > 0.9
            ? ("degraded" as const)
            : ("operational" as const),
        latency: Math.floor(Math.random() * 150),
      },
      {
        name: "AI Service",
        status:
          Math.random() > 0.95 ? ("down" as const) : ("operational" as const),
        latency: Math.floor(Math.random() * 200),
      },
      {
        name: "Authentication",
        status: "operational" as const,
        latency: Math.floor(Math.random() * 100),
      },
    ];

    return NextResponse.json({
      metrics,
      services,
    });
  } catch (error) {
    console.error("System metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch system metrics" },
      { status: 500 }
    );
  }
}
