import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify token and check admin role
    const payload = await verifyJWT(token);
    if (!payload || payload.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { userId: targetUserId, action } = await req.json();

    if (!targetUserId || !action) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    switch (action) {
      case "make_admin":
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            role: "ADMIN",
            updatedAt: new Date(),
          },
        });
        break;

      case "suspend":
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            subscription: {
              update: {
                status: "SUSPENDED",
              },
            },
            updatedAt: new Date(),
          },
        });
        break;

      case "activate":
        await prisma.user.update({
          where: { id: targetUserId },
          data: {
            subscription: {
              update: {
                status: "ACTIVE",
              },
            },
            updatedAt: new Date(),
          },
        });
        break;

      case "edit":
        // Handle edit action in a separate endpoint
        return new NextResponse("Edit action should be handled separately", {
          status: 400,
        });

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }

    // Log the action
    await prisma.adminLog.create({
      data: {
        action,
        adminId: payload.userId,
        targetUserId,
        details: `Admin ${payload.userId} performed ${action} on user ${targetUserId}`,
      },
    });

    return new NextResponse("Action completed successfully", { status: 200 });
  } catch (error) {
    console.error("[ADMIN_USER_ACTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
