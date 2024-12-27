import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/lib/jwt";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Helper function to hash password
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create new user
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "USER",
        subscription: {
          create: {
            plan: "FREE",
            documentsLimit: 10,
            questionsLimit: 50,
            questionsUsed: 0,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            status: "ACTIVE",
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscription: {
          select: {
            plan: true,
            documentsLimit: true,
            questionsLimit: true,
            questionsUsed: true,
            validUntil: true,
            status: true,
          },
        },
      },
    });

    // Generate JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });

    // Set cookie
    const cookieStore = cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Format user data for response
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscription: user.subscription
        ? {
            plan: user.subscription.plan,
            documentsPerMonth: user.subscription.documentsLimit,
            questionsPerMonth: user.subscription.questionsLimit,
            questionsUsed: user.subscription.questionsUsed,
            validUntil: user.subscription.validUntil,
          }
        : null,
    };

    return NextResponse.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
