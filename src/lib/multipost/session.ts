import { cookies } from "next/headers";
import { decryptJson, encryptJson } from "./crypto";

export type MetaConnection = {
  userAccessToken: string;
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  instagramUserId?: string;
  instagramUsername?: string;
};

export type MetaPendingConnection = { userAccessToken: string };
export type ThreadsConnection = { accessToken: string; userId: string };
export type TikTokConnection = {
  accessToken: string;
  refreshToken?: string;
  openId?: string;
  expiresAt?: number;
};

const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 12,
};

export async function setConnection(name: string, data: unknown) {
  const jar = await cookies();
  jar.set(`mp_${name}`, encryptJson(data), cookieBase);
}

export async function getConnection<T>(name: string) {
  const jar = await cookies();
  return decryptJson<T>(jar.get(`mp_${name}`)?.value);
}

export async function clearConnection(name: string) {
  const jar = await cookies();
  jar.set(`mp_${name}`, "", { ...cookieBase, maxAge: 0 });
}
