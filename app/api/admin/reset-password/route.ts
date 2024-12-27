import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { getJwtSecretKey } from "@/lib/jwt";
import * as bcrypt from "bcryptjs";
import * as fs from "fs/promises";
import * as path from "path";

const ADMIN_EMAIL = "admin@virtuhelp.com";

export async function POST(request: Request) {
  try {
    // Verify admin is authenticated
    const adminToken = cookies().get("admin-token")?.value;
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const verified = await jwtVerify(adminToken, getJwtSecretKey());
      if (!verified.payload.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Read current file content
    const currentFilePath = new URL(import.meta.url).pathname;
    const authFilePath = path.join(path.dirname(currentFilePath), "../auth/route.ts");
    const fileContent = await fs.readFile(authFilePath, "utf-8");

    // Extract current password hash
    const currentHashMatch = fileContent.match(/ADMIN_PASSWORD_HASH = "(.+?)"/);
    if (!currentHashMatch) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    const currentHash = currentHashMatch[1];
    const isValidPassword = await bcrypt.compare(currentPassword, currentHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Generate new password hash
    const newHash = await bcrypt.hash(newPassword, 10);
    
    // Update the file content
    const updatedContent = fileContent.replace(
      /ADMIN_PASSWORD_HASH = ".+?"/,
      `ADMIN_PASSWORD_HASH = "${newHash}"`
    );

    await fs.writeFile(authFilePath, updatedContent, "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
