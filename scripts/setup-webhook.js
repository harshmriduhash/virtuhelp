require("dotenv").config();
const fetch = require("node-fetch");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY;
const VERCEL_URL = process.env.NEXTAUTH_URL;

async function getAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`).toString(
    "base64"
  );
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
}

async function createWebhook() {
  try {
    console.log("Setting up PayPal webhook...");
    console.log("Using URL:", VERCEL_URL);

    const accessToken = await getAccessToken();
    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/notifications/webhooks",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          url: `${VERCEL_URL}/api/webhooks/paypal`,
          event_types: [
            { name: "BILLING.SUBSCRIPTION.CREATED" },
            { name: "BILLING.SUBSCRIPTION.CANCELLED" },
            { name: "BILLING.SUBSCRIPTION.SUSPENDED" },
            { name: "BILLING.SUBSCRIPTION.PAYMENT.FAILED" },
            { name: "BILLING.SUBSCRIPTION.UPDATED" },
          ],
        }),
      }
    );

    const webhook = await response.json();
    console.log("Webhook created:", webhook);

    if (webhook.id) {
      console.log("\nAdd this to your .env file:");
      console.log(`PAYPAL_WEBHOOK_ID=${webhook.id}`);
    } else {
      console.log("\nFailed to create webhook:", webhook);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

createWebhook();
