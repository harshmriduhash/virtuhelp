import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, username, firstName, lastName } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user in database
    const user = await db.user.create({
      data: {
        email,
        hashedPassword: await bcrypt.hash(password, 10),
        name:
          [firstName, lastName].filter(Boolean).join(" ").trim() ||
          username ||
          "",
        username,
        subscription: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
            documentsLimit: 3,
            questionsLimit: 20,
            questionsUsed: 0,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });

    // Set the auth token as an HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
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
      redirect: "/chat",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
