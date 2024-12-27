"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { paypalConfig } from "@/lib/paypal";

interface PayPalWrapperProps {
  children: React.ReactNode;
}

export function PayPalWrapper({ children }: PayPalWrapperProps) {
  return (
    <PayPalScriptProvider options={paypalConfig}>
      {children}
    </PayPalScriptProvider>
  );
}
