"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const paypalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  components: "buttons",
  intent: "subscription",
  vault: true,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      {children}
    </PayPalScriptProvider>
  );
}
