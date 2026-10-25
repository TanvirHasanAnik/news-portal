import { SignJWT, jwtVerify } from "jose";

/**
 * Edge & Cloudflare Workers compliant JWT tokenization using `jose`.
 * Zero Node native crypto dependencies.
 */

export const AUTH_COOKIE_NAME = "auth_token";

const DEFAULT_JWT_SECRET = "aloshbe_news_portal_secret_jwt_key_2026_super_secure_edge_compliant";

export function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Creates and signs a JWT token using HS256 algorithm via Web Crypto API
 */
export async function createJwtToken(payload, options = {}) {
  const secretKey = getJwtSecretKey();
  const expiresIn = options.expiresIn || "7d";

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}

/**
 * Verifies a JWT token and returns the payload if valid, otherwise returns null
 */
export async function verifyJwtToken(token) {
  if (!token) return null;
  try {
    const secretKey = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (_err) {
    return null;
  }
}

