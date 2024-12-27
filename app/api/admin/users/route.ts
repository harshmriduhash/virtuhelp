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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const plan = searchParams.get("plan");

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {
      AND: [
        // Search condition
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        // Status filter
        status
          ? {
              subscription: {
                status: {
                  equals: status.toUpperCase(),
                },
              },
            }
          : {},
        // Plan filter
        plan
          ? {
              subscription: {
                plan: {
                  equals: plan.toUpperCase(),
                },
              },
            }
          : {},
      ],
    };

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      include: {
        subscription: true,
        usage: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Get only last 5 usage records
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Calculate usage statistics for each user
    const usersWithStats = users.map((user) => {
      const questions =
        user.usage?.filter((u) => u.type === "question").length ?? 0;
      const documents =
        user.usage?.filter((u) => u.type === "document").length ?? 0;

      // Default subscription values if no subscription exists
      const defaultSubscription = {
        status: "NONE",
        plan: "NONE",
        questionsLimit: 0,
        documentsLimit: 0,
        questionsUsed: 0,
        documentsUsed: 0,
        currentPeriodEnd: null,
      };

      // Get actual subscription data if it exists
      const subscriptionData = user.subscription
        ? {
            status: user.subscription.status,
            plan: user.subscription.plan,
            questionsLimit: user.subscription.questionsLimit,
            documentsLimit: user.subscription.documentsLimit,
            questionsUsed: user.subscription.questionsUsed,
            documentsUsed: user.subscription.documentsUsed,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
          }
        : defaultSubscription;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        subscription: subscriptionData,
        usage: {
          questions,
          documents,
          questionsLimit: subscriptionData.questionsLimit,
          documentsLimit: subscriptionData.documentsLimit,
          questionsUsed: subscriptionData.questionsUsed,
          documentsUsed: subscriptionData.documentsUsed,
        },
      };
    });

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from URL
    const userId = request.url.split("/").pop();
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        subscription: true,
        usage: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token || !(await verifyAdminToken(token))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, targetUserId, data } = body;

    switch (action) {
      case "update":
        const updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
        return NextResponse.json(updatedUser);

      case "delete":
        await prisma.user.delete({
          where: { id: targetUserId },
        });
        return NextResponse.json({ message: "User deleted successfully" });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in user action:", error);
    return NextResponse.json(
      { error: "Failed to process user action" },
      { status: 500 }
    );
  }
}
