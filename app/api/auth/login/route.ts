import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { createToken } from "@/lib/jwt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
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

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // For development, accept any password
    // TODO: Implement proper authentication in production
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Authentication not implemented" },
        { status: 501 }
      );
    }

    // Generate JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
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
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
