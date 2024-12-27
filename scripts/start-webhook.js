require("dotenv").config();
const ngrok = require("ngrok");
const fetch = require("node-fetch");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET_KEY = process.env.PAYPAL_SECRET_KEY;

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

async function createWebhook(url) {
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
        url: `${url}/api/webhooks/paypal`,
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

  return response.json();
}

async function start() {
  try {
    // Start ngrok tunnel
    const url = await ngrok.connect(3000);
    console.log("Ngrok tunnel started:", url);

    // Create webhook with ngrok URL
    const webhook = await createWebhook(url);
    console.log("Webhook created:", webhook);

    if (webhook.id) {
      console.log("\nAdd these to your .env file:");
      console.log(`PAYPAL_WEBHOOK_ID=${webhook.id}`);
      console.log(`NEXTAUTH_URL=${url}`);
    }

    console.log("\nPress Ctrl+C to stop the tunnel");
  } catch (error) {
    console.error("Error:", error);
  }
}

start();
