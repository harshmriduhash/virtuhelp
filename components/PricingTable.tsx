"use client";

import { Button } from "@/components/ui/button";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "@/hooks/use-toast";
import { activateSubscription } from "@/lib/paypal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2, Sparkles } from "lucide-react";

export interface PricingPlan {
  name: string;
  description: string;
  price: number;
  features: string[];
  documentsPerMonth: number;
  questionsPerMonth: number;
  planId: string | null;
  popular?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    features: [
      "3 Documents per month",
      "20 Questions per month",
      "Basic document analysis",
      "Community support",
      "Standard response time",
    ],
    documentsPerMonth: 3,
    questionsPerMonth: 20,
    planId: null,
  },
  {
    name: "Professional",
    description: "Best for professionals",
    price: 29.99,
    features: [
      "25 Documents per month",
      "100 Questions per month",
      "Advanced document analysis",
      "Priority support 24/7",
      "Advanced Analytics",
      "Custom document templates",
      "API Access (100 calls/day)",
    ],
    documentsPerMonth: 25,
    questionsPerMonth: 100,
    planId: process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID!,
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For growing teams",
    price: 99.99,
    features: [
      "Unlimited Documents",
      "Unlimited Questions",
      "Enterprise-grade security",
      "24/7 Priority support",
      "Custom Integration",
      "Team Management",
      "Dedicated account manager",
      "Custom AI model training",
      "Unlimited API access",
    ],
    documentsPerMonth: -1,
    questionsPerMonth: -1,
    planId: process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID!,
  },
];

export function PricingTable() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscriptionSuccess = async (subscriptionId: string) => {
    try {
      setLoading(true);
      await activateSubscription(subscriptionId);

      toast({
        title: "Subscription activated",
        description: "Your subscription has been successfully activated",
      });

      router.refresh();
    } catch (error) {
      console.error("Error activating subscription:", error);
      toast({
        title: "Error activating subscription",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {plans.map((plan, index) => (
        <motion.div
          key={plan.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative group"
        >
          <div
            className={cn(
              "absolute inset-0 rounded-2xl transition-opacity duration-300",
              plan.popular
                ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-100 blur-xl"
                : "bg-white/5 opacity-0 group-hover:opacity-100 blur-lg"
            )}
          />

          <div
            className={cn(
              "relative p-8 rounded-xl backdrop-blur-sm h-full flex flex-col",
              plan.popular
                ? "border-2 border-blue-500/50 bg-white/10"
                : "border border-white/10 bg-white/5"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-0 right-0 flex justify-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-400">{plan.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  ${plan.price}
                </span>
                <span className="text-gray-400 mb-2">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-4 mt-auto">
              {plan.planId ? (
                <>
                  {selectedPlan === plan.name ? (
                    <div className="space-y-4">
                      <PayPalButtons
                        createSubscription={(data, actions) => {
                          return actions.subscription.create({
                            plan_id: plan.planId!,
                          });
                        }}
                        onApprove={async (data, actions) => {
                          if (data.subscriptionID) {
                            await handleSubscriptionSuccess(
                              data.subscriptionID
                            );
                          }
                          return Promise.resolve();
                        }}
                        onError={(err) => {
                          console.error("PayPal Error:", err);
                          toast({
                            title: "Payment failed",
                            description: "Please try again later",
                            variant: "destructive",
                          });
                        }}
                        style={{
                          layout: "vertical",
                          color: "blue",
                        }}
                        disabled={loading}
                      />
                      <Button
                        variant="ghost"
                        className="w-full border border-white/10 hover:bg-white/5"
                        onClick={() => setSelectedPlan(null)}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className={cn(
                        "w-full text-white font-medium transition-all duration-200",
                        plan.popular
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90"
                          : "bg-white/10 hover:bg-white/20"
                      )}
                      onClick={() => setSelectedPlan(plan.name)}
                      disabled={loading}
                    >
                      Get Started
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-medium"
                  disabled
                >
                  Current Plan
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
