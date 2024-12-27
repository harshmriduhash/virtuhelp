"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Check,
  Zap,
  Shield,
  Star,
  Rocket,
  Brain,
  ArrowRight,
} from "lucide-react";
import NavBar from "@/components/NavBar";

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: string[];
  documentsPerMonth: number;
  questionsPerMonth: number;
  icon: React.ReactNode;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "FREE",
    price: "$0",
    description: "Perfect for trying out VirtuHelpX",
    features: [
      "10 Documents per month",
      "50 Questions per month",
      "Basic document analysis",
      "Standard response time",
    ],
    documentsPerMonth: 10,
    questionsPerMonth: 50,
    icon: <Brain className="h-6 w-6 text-blue-400" />,
  },
  {
    name: "PROFESSIONAL",
    price: "$9.99",
    description: "Great for personal use",
    features: [
      "50 Documents per month",
      "200 Questions per month",
      "Advanced document analysis",
      "Faster response time",
      "Priority support",
    ],
    documentsPerMonth: 50,
    questionsPerMonth: 200,
    icon: <Star className="h-6 w-6 text-indigo-400" />,
    popular: true,
  },
  {
    name: "ENTERPRISE",
    price: "$19.99",
    description: "Perfect for professionals",
    features: [
      "200 Documents per month",
      "1000 Questions per month",
      "Advanced document analysis",
      "Fastest response time",
      "24/7 Priority support",
      "Custom AI training",
    ],
    documentsPerMonth: 200,
    questionsPerMonth: 1000,
    icon: <Rocket className="h-6 w-6 text-purple-400" />,
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions/current");
        if (response.ok) {
          const data = await response.json();
          setCurrentPlan(data.plan);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchSubscription();
  }, []);

  const handleUpgrade = async (planName: string) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/subscriptions/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upgrade subscription");
      }

      if (data.url) {
        // Redirect to payment page if needed
        window.location.href = data.url;
      } else {
        toast({
          title: "Success!",
          description: "Your subscription has been updated.",
        });
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upgrade",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#0A0F1E] text-white py-20">
        {/* Background Effects */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#162454] to-[#0A0F1E]">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_400px_at_50%_300px,#3B82F6,transparent)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_400px_at_80%_80%,#6366F1,transparent)]" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Unlock the full potential of VirtuHelpX with our flexible pricing
              plans. Choose the plan that best fits your needs.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border border-white/10 bg-[#0A0F1E]/50 backdrop-blur-sm p-8 ${
                  plan.popular
                    ? "ring-2 ring-blue-500 scale-105 transform"
                    : "transform"
                } transition-all duration-200 hover:scale-105`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-0 right-0 mx-auto w-32">
                    <div className="text-xs text-white font-semibold py-1 px-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-center">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-gray-400 ml-2">/month</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">{plan.icon}</div>
                </div>

                <p className="text-gray-400 mb-6">{plan.description}</p>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Check className="h-5 w-5 text-blue-400 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={loading || currentPlan === plan.name}
                  className={`w-full relative inline-flex items-center justify-center px-8 py-3 font-medium transition-all duration-200 rounded-lg ${
                    currentPlan === plan.name
                      ? "bg-white/10 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Processing...
                    </div>
                  ) : currentPlan === plan.name ? (
                    "Current Plan"
                  ) : (
                    <>
                      <span>Choose Plan</span>
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-center mb-12">
              All Plans Include
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border border-white/10 bg-[#0A0F1E]/50 backdrop-blur-sm">
                <div className="p-3 rounded-xl bg-white/5 w-fit mb-4">
                  <Brain className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  AI-Powered Analysis
                </h3>
                <p className="text-gray-400">
                  Advanced document analysis using state-of-the-art AI models.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-[#0A0F1E]/50 backdrop-blur-sm">
                <div className="p-3 rounded-xl bg-white/5 w-fit mb-4">
                  <Shield className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-400">
                  Enterprise-grade security with end-to-end encryption.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-white/10 bg-[#0A0F1E]/50 backdrop-blur-sm">
                <div className="p-3 rounded-xl bg-white/5 w-fit mb-4">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Real-time Support
                </h3>
                <p className="text-gray-400">
                  Get help when you need it with our responsive support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
