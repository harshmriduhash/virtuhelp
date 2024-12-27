import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET() {
  try {
    const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!);
    try {
      const [products, prices] = await Promise.all([
        stripe.products.list({
          active: true,
          limit: 100,
        }),
        stripe.prices.list({
          active: true,
          limit: 100,
        }),
      ]);
      return NextResponse.json({
        products: products.data,
        prices: prices.data,
      });
    } catch (error) {
      console.error("Error fetching plans:", error);
      return NextResponse.json(
        { error: "Failed to fetch plans" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}
