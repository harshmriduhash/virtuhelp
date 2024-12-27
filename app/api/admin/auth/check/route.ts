import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "../login/route";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}
