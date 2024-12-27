const crypto = require("crypto");

// Generate a random 32-byte hex string
const secret = crypto.randomBytes(32).toString("hex");

console.log("Generated JWT Secret Key:");
console.log(secret);
console.log("\nAdd this to your .env file as:");
console.log(`JWT_SECRET_KEY=${secret}`);
