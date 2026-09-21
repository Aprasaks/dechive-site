import crypto from "node:crypto";
import { cookies } from "next/headers";

export async function newState(provider: string) {
  const value = crypto.randomBytes(24).toString("base64url");
  const jar = await cookies();
  jar.set(`mp_oauth_${provider}_state`, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return value;
}

export async function verifyState(provider: string, received: string | null) {
  const jar = await cookies();
  const expected = jar.get(`mp_oauth_${provider}_state`)?.value;
  jar.delete(`mp_oauth_${provider}_state`);
  if (!received || !expected || received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export function originFromRequest(requestUrl: string) {
  return new URL(requestUrl).origin;
}
