"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "@/hooks/use-toast";
import { activateSubscription } from "@/lib/paypal";
import { useRouter } from "next/navigation";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription?: {
    questionsUsed: number;
    documentsUsed: number;
    questionsPerMonth: number;
    documentsPerMonth: number;
  };
}

export function PaymentModal({
  isOpen,
  onClose,
  subscription,
}: PaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscriptionSuccess = async (subscriptionId: string) => {
    try {
      setLoading(true);
      await activateSubscription(subscriptionId);

      toast({
        title: "Subscription activated",
        description: "Your subscription has been successfully activated",
      });

      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error activating subscription:", error);
      toast({
        title: "Error activating subscription",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
        </DialogHeader>

        {subscription && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Current Usage:</p>
              <ul className="list-disc list-inside">
                <li>
                  Documents: {subscription.documentsUsed}/
                  {subscription.documentsPerMonth}
                </li>
                <li>
                  Questions: {subscription.questionsUsed}/
                  {subscription.questionsPerMonth}
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <PayPalButtons
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ID!,
                  });
                }}
                onApprove={async (data, actions) => {
                  if (data.subscriptionID) {
                    await handleSubscriptionSuccess(data.subscriptionID);
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
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
