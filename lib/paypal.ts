"use client";

import { ReactPayPalScriptOptions } from "@paypal/react-paypal-js";

export interface PlanData {
  name: string;
  description: string;
  price: number;
  interval?: "MONTH" | "YEAR";
  documentsLimit?: number;
  questionsLimit?: number;
}

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

if (typeof window !== "undefined" && !PAYPAL_CLIENT_ID) {
  throw new Error(
    "NEXT_PUBLIC_PAYPAL_CLIENT_ID is not defined in environment variables"
  );
}

export const paypalConfig: ReactPayPalScriptOptions = {
  "client-id": PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "subscription",
  vault: true,
  components: "buttons",
};

export async function getPayPalAccessToken() {
  const response = await fetch("/api/paypal/token", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}

export async function activateSubscription(subscriptionId: string) {
  const response = await fetch("/api/paypal/activate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscriptionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to activate subscription");
  }

  return response.json();
}

export async function cancelSubscription(subscriptionId: string) {
  const response = await fetch("/api/paypal/cancel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscriptionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to cancel subscription");
  }

  return response.json();
}

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    planId: null,
    documentsLimit: 3,
    questionsLimit: 20,
  },
  PRO: {
    name: "Professional",
    price: 29.99,
    planId: process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID,
    documentsLimit: 25,
    questionsLimit: 100,
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 99.99,
    planId: process.env.NEXT_PUBLIC_PAYPAL_ENTERPRISE_PLAN_ID,
    documentsLimit: -1, // unlimited
    questionsLimit: -1, // unlimited
  },
};
