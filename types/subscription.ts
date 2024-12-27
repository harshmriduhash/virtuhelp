export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  documentsPerMonth: number;
  questionsPerMonth: number;
  planId: string | null;
  popular?: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  documentsRemaining: number;
  questionsRemaining: number;
  validUntil: Date;
  nextBillingDate?: Date;
}
