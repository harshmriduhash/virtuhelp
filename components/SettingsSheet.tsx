"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, ArrowRight, X } from "lucide-react";
import { useAuth } from "@/lib/useAuth";
import { cn } from "@/lib/utils";

interface Subscription {
  plan: string;
  documentsPerMonth: number;
  questionsPerMonth: number;
  questionsUsed: number;
  validUntil: Date;
  status: string;
}

interface SettingsSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const isOpen = open !== undefined ? open : false;
  const setIsOpen = onOpenChange || (() => {});

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions/current");
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    if (isOpen) {
      fetchSubscription();
    }
  }, [isOpen]);

  const getProgressPercentage = (used: number, total: number) => {
    return Math.min((used / total) * 100, 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] bg-[#0A0F1E] border-l border-white/10">
        <div className="absolute right-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className={cn(
              "h-9 w-9 rounded-lg transition-all duration-200",
              "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500 hover:to-indigo-500",
              "text-blue-400 hover:text-white border border-blue-500/20"
            )}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-white">
            Settings
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* User Profile */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Profile</h3>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium text-white">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Subscription Details
            </h3>
            {!subscription ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
                <p className="text-gray-400">
                  No active subscription found. Upgrade to unlock premium
                  features.
                </p>
                <Button
                  onClick={() => router.push("/subscription")}
                  className="w-full relative inline-flex items-center justify-center px-4 py-2 font-medium text-white transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600"
                >
                  <span>Upgrade Now</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">
                    {subscription.plan} Plan
                  </h4>
                  <Badge
                    variant={
                      subscription.status === "ACTIVE"
                        ? "default"
                        : "destructive"
                    }
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                  >
                    {subscription.status}
                  </Badge>
                </div>

                {/* Questions Usage */}
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Questions Used</span>
                    <span>
                      {subscription.questionsUsed} /{" "}
                      {subscription.questionsPerMonth}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{
                        width: `${getProgressPercentage(
                          subscription.questionsUsed,
                          subscription.questionsPerMonth
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Documents Limit */}
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Documents Limit</span>
                  <span>{subscription.documentsPerMonth} per month</span>
                </div>

                {/* Valid Until */}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-sm text-gray-400">
                    Valid until: {formatDate(subscription.validUntil)}
                  </p>
                </div>

                {/* Upgrade Button */}
                {subscription.plan !== "ENTERPRISE" && (
                  <Button
                    onClick={() => router.push("/subscription")}
                    className="w-full relative inline-flex items-center justify-center px-4 py-2 font-medium text-white transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg hover:from-blue-600 hover:to-indigo-600"
                  >
                    <span>Upgrade Plan</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <Button
            onClick={logout}
            variant="destructive"
            className="w-full relative inline-flex items-center justify-center px-4 py-2 font-medium"
          >
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
