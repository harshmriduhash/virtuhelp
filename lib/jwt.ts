import { SignJWT, jwtVerify } from "jose";
import { jwtDecode } from "jwt-decode";

export function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new Error("JWT Secret key is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(payload: any) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 24 * 60 * 60; // 24 hours

  return new SignJWT({ ...payload, iat, exp })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(getJwtSecretKey());
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload;
  } catch (error) {
    return null;
  }
}

export const verifyJWT = verifyToken;

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    if (!decoded || typeof decoded !== "object" || !("exp" in decoded)) {
      return true;
    }
    const exp = decoded.exp as number;
    const currentTime = Math.floor(Date.now() / 1000);
    return exp < currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
}
