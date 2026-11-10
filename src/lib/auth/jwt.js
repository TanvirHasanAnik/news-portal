import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "auth_token";

export async function computePasswordSignature(password) {
  if (!password || typeof password !== "string") return "";
  const data = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

async function resolveJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET.trim();
  }

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env?.JWT_SECRET) {
      return ctx.env.JWT_SECRET.trim();
    }
  } catch (_e) {}

  return "";
}

export async function getJwtSecretKey() {
  const secret = await resolveJwtSecret();
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is missing.");
  }
  return new TextEncoder().encode(secret);
}

export async function createJwtToken(payload, options = {}) {
  const secretKey = await getJwtSecretKey();
  const expiresIn = options.expiresIn || "30d";

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

export async function verifyJwtToken(token) {
  if (!token) return null;
  try {
    const secretKey = await getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (_err) {
    return null;
  }
}
