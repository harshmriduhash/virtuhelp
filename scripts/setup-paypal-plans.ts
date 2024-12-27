const { createSubscriptionPlan, getOrCreateProduct } = require("../lib/paypal");

async function setupPayPalPlans() {
  try {
    // Create plans
    const plans = [
      {
        name: "Free Plan",
        description: "Basic access with limited features",
        price: 0,
        interval: "MONTH",
      },
      {
        name: "Starter Plan",
        description:
          "5 preloaded docs, 7 self-uploaded docs, advanced summaries",
        price: 9.99,
        interval: "MONTH",
      },
      {
        name: "Pro Plan",
        description: "20 preloaded docs, 20 self-uploaded docs, AI insights",
        price: 29.99,
        interval: "MONTH",
      },
      {
        name: "Unlimited Plan",
        description: "Unlimited docs, all features, team collaboration",
        price: 59.99,
        interval: "MONTH",
      },
    ];

    for (const plan of plans) {
      if (plan.price > 0) {
        // Skip free plan
        const result = await createSubscriptionPlan(plan);
        console.log(`Created plan: ${plan.name}`, result);
      }
    }

    console.log("Successfully created all subscription plans");
  } catch (error) {
    console.error("Error setting up subscription plans:", error);
  }
}

setupPayPalPlans();
