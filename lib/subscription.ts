import { prisma } from "./prisma";

export async function trackUsage(
  userId: string,
  type: "document" | "question"
) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    throw new Error("No subscription found");
  }

  // Check limits
  if (
    type === "document" &&
    subscription.documentsUsed >= subscription.documentsLimit
  ) {
    throw new Error("Document limit reached");
  }
  if (
    type === "question" &&
    subscription.questionsUsed >= subscription.questionsLimit
  ) {
    throw new Error("Question limit reached");
  }

  // Update usage
  await prisma.subscription.update({
    where: { userId },
    data: {
      [type === "document" ? "documentsUsed" : "questionsUsed"]: {
        increment: 1,
      },
    },
  });
}

export async function checkSubscriptionLimits(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return {
      canUploadDocuments: false,
      canAskQuestions: false,
      documentsRemaining: 0,
      questionsRemaining: 0,
    };
  }

  return {
    canUploadDocuments:
      subscription.documentsUsed < subscription.documentsLimit,
    canAskQuestions: subscription.questionsUsed < subscription.questionsLimit,
    documentsRemaining:
      subscription.documentsLimit - subscription.documentsUsed,
    questionsRemaining:
      subscription.questionsLimit - subscription.questionsUsed,
  };
}

export async function resetUsage(userId: string) {
  await prisma.subscription.update({
    where: { userId },
    data: {
      documentsUsed: 0,
      questionsUsed: 0,
    },
  });
}

export const PLAN_LIMITS = {
  FREE: {
    documentsLimit: 3,
    questionsLimit: 20,
  },
  BASIC: {
    documentsLimit: 5,
    questionsLimit: 50,
  },
  PREMIUM: {
    documentsLimit: 20,
    questionsLimit: 200,
  },
  ENTERPRISE: {
    documentsLimit: -1, // unlimited
    questionsLimit: -1, // unlimited
  },
};
