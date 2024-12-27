const { db } = require("../lib/db");
const bcrypt = require("bcryptjs");

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash("test123", 10);

    const user = await db.user.upsert({
      where: { email: "raheesahmed25621@gmail.com" },
      update: {
        hashedPassword,
        name: "Rahees Ahmed",
        role: "USER",
      },
      create: {
        email: "raheesahmed25621@gmail.com",
        hashedPassword,
        name: "Rahees Ahmed",
        role: "USER",
      },
    });

    console.log("User created/updated:", user);
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    await db.$disconnect();
  }
}

createTestUser();
