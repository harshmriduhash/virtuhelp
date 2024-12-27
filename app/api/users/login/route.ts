import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hashedPassword: true,
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

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create the token payload
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    };

    // Generate JWT token with proper expiration
    const token = await signJWT(tokenPayload);

    // Prepare user data for response
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

    // Set the auth token as an HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Return success response with user data and token
    return NextResponse.json({
      user: userData,
      token,
      redirect: "/chat",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
