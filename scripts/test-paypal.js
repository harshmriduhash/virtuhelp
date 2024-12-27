require("dotenv").config();
const fetch = require("node-fetch");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY;

async function getAccessToken() {
  try {
    const auth = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`
    ).toString("base64");
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
        },
        body: "grant_type=client_credentials",
      }
    );

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    throw error;
  }
}

async function createProduct(accessToken) {
  try {
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/catalogs/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: "VirtuHelpX Subscription",
          type: "SERVICE",
          description: "AI Document Analysis Subscription Service",
        }),
      }
    );

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

async function createSubscriptionPlan(accessToken, productId, plan) {
  try {
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/billing/plans",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          product_id: productId,
          name: plan.name,
          description: plan.description,
          status: "ACTIVE",
          billing_cycles: [
            {
              frequency: {
                interval_unit: "MONTH",
                interval_count: 1,
              },
              tenure_type: "REGULAR",
              sequence: 1,
              total_cycles: 0,
              pricing_scheme: {
                fixed_price: {
                  value: plan.price.toString(),
                  currency_code: "USD",
                },
              },
            },
          ],
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee: {
              value: "0",
              currency_code: "USD",
            },
            setup_fee_failure_action: "CONTINUE",
            payment_failure_threshold: 3,
          },
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    throw error;
  }
}

async function setupSubscriptionPlans() {
  try {
    console.log("Setting up PayPal subscription plans...");

    // Get access token
    const accessToken = await getAccessToken();
    console.log("Got access token");

    // Create product
    const productId = await createProduct(accessToken);
    console.log("Created product:", productId);

    // Define plans
    const plans = [
      {
        name: "Starter Plan",
        description:
          "5 preloaded docs, 7 self-uploaded docs, advanced summaries",
        price: 9.99,
      },
      {
        name: "Pro Plan",
        description: "20 preloaded docs, 20 self-uploaded docs, AI insights",
        price: 29.99,
      },
      {
        name: "Unlimited Plan",
        description: "Unlimited docs, all features, team collaboration",
        price: 59.99,
      },
    ];

    // Create plans
    for (const plan of plans) {
      const result = await createSubscriptionPlan(accessToken, productId, plan);
      console.log(`Created plan: ${plan.name}`, result);
    }

    console.log("Successfully set up all subscription plans");
    return true;
  } catch (error) {
    console.error("Error setting up subscription plans:", error);
    return false;
  }
}

setupSubscriptionPlans();
