import { prisma } from "./prisma";
import { Plan, Status, Subscription } from "@prisma/client";
import { getSubscriptionDetails, cancelSubscription } from "./paypal";
import { PLAN_LIMITS } from "./subscription";

export interface SubscriptionInfo {
  isActive: boolean;
  plan: Plan;
  documentsRemaining: number;
  questionsRemaining: number;
  validUntil: Date;
  canUpgrade: boolean;
  canDowngrade: boolean;
  nextBillingDate?: Date;
  paymentStatus: Status;
}

export class SubscriptionManager {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: this.userId },
    });

    if (!subscription) {
      return this.getDefaultSubscriptionInfo();
    }

    let nextBillingDate: Date | undefined;
    if (subscription.paypalSubscriptionId) {
      try {
        const paypalDetails = await getSubscriptionDetails(
          subscription.paypalSubscriptionId
        );
        nextBillingDate = new Date(
          paypalDetails.billing_info.next_billing_time
        );
      } catch (error) {
        console.error("Error fetching PayPal subscription details:", error);
      }
    }

    return {
      isActive: subscription.status === Status.ACTIVE,
      plan: subscription.plan,
      documentsRemaining:
        subscription.documentsLimit - subscription.documentsUsed,
      questionsRemaining:
        subscription.questionsLimit - subscription.questionsUsed,
      validUntil: subscription.validUntil,
      canUpgrade: subscription.plan !== Plan.ENTERPRISE,
      canDowngrade: subscription.plan !== Plan.FREE,
      nextBillingDate,
      paymentStatus: subscription.status,
    };
  }

  private getDefaultSubscriptionInfo(): SubscriptionInfo {
    return {
      isActive: true,
      plan: Plan.FREE,
      documentsRemaining: PLAN_LIMITS.FREE.documentsLimit,
      questionsRemaining: PLAN_LIMITS.FREE.questionsLimit,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      canUpgrade: true,
      canDowngrade: false,
      paymentStatus: Status.ACTIVE,
    };
  }

  async cancelCurrentSubscription(): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: this.userId },
    });

    if (!subscription || !subscription.paypalSubscriptionId) {
      return false;
    }

    try {
      await cancelSubscription(subscription.paypalSubscriptionId);

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: Status.CANCELLED,
          plan: Plan.FREE,
          documentsLimit: PLAN_LIMITS.FREE.documentsLimit,
          questionsLimit: PLAN_LIMITS.FREE.questionsLimit,
        },
      });

      return true;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return false;
    }
  }

  async resetUsageLimits(): Promise<void> {
    await prisma.subscription.update({
      where: { userId: this.userId },
      data: {
        documentsUsed: 0,
        questionsUsed: 0,
      },
    });
  }

  async checkAndResetMonthlyLimits(): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: this.userId },
    });

    if (!subscription) return;

    const lastReset = subscription.validUntil;
    const now = new Date();
    const monthInMs = 30 * 24 * 60 * 60 * 1000;

    if (now.getTime() - lastReset.getTime() >= monthInMs) {
      await this.resetUsageLimits();
      await prisma.subscription.update({
        where: { userId: this.userId },
        data: {
          validUntil: new Date(now.getTime() + monthInMs),
        },
      });
    }
  }

  async handleFailedPayment(): Promise<void> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: this.userId },
    });

    if (!subscription) return;

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: Status.PAYMENT_FAILED,
      },
    });

    // TODO: Send email notification to user
  }

  async reactivateSubscription(): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: this.userId },
    });

    if (!subscription || !subscription.paypalSubscriptionId) {
      return false;
    }

    try {
      const paypalDetails = await getSubscriptionDetails(
        subscription.paypalSubscriptionId
      );

      if (paypalDetails.status === "ACTIVE") {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: Status.ACTIVE,
          },
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      return false;
    }
  }
}
