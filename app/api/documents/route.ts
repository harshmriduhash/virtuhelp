import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackUsage, checkSubscriptionLimits } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const { title, content, userId } = await request.json();

    // Check subscription limits
    const limits = await checkSubscriptionLimits(userId);
    if (!limits.canUploadDocuments) {
      return NextResponse.json(
        { error: "Document limit reached for your subscription" },
        { status: 403 }
      );
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        title,
        content,
        uploadedBy: userId,
      },
    });

    // Track usage
    await trackUsage(userId, "document");

    return NextResponse.json(document);
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const documents = await prisma.document.findMany({
      where: {
        OR: [{ uploadedBy: userId }, { isPublic: true }],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
