import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { path } = await req.json();

    // Validate the path
    const validPaths = ["/sign-in", "/sign-up", "/reset-password", "/chat"];
    if (!validPaths.includes(path)) {
      return NextResponse.json(
        { error: "Invalid navigation path" },
        { status: 400 }
      );
    }

    return NextResponse.json({ redirect: path });
  } catch (error) {
    console.error("Navigation error:", error);
    return NextResponse.json({ error: "Navigation failed" }, { status: 500 });
  }
}
