import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./jwt";

/**
 * Standard HTTP-only Cookie Options for JWT Authentication
 */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
};

/**
 * Sets the HTTP-only authentication cookie
 */
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
}

/**
 * Clears the HTTP-only authentication cookie
 */
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Reads the HTTP-only authentication cookie value
 */
export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value || null;
}

