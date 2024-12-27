import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trackUsage, checkSubscriptionLimits } from "@/lib/subscription";

export async function POST(request: Request) {
  try {
    const { content, userId, documentId } = await request.json();

    // Check subscription limits
    const limits = await checkSubscriptionLimits(userId);
    if (!limits.canAskQuestions) {
      return NextResponse.json(
        { error: "Question limit reached for your subscription" },
        { status: 403 }
      );
    }

    // Get document content and generate answer using AI
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // TODO: Generate answer using AI
    const answer = "AI-generated answer will go here";

    // Create question
    const question = await prisma.question.create({
      data: {
        content,
        answer,
        userId,
        documentId,
      },
    });

    // Track usage
    await trackUsage(userId, "question");

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const documentId = searchParams.get("documentId");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const questions = await prisma.question.findMany({
      where: {
        userId,
        ...(documentId && { documentId }),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        document: {
          select: {
            title: true,
          },
        },
      },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
