import { SignJWT, jwtVerify } from "jose";




export const AUTH_COOKIE_NAME = "auth_token";

const DEFAULT_JWT_SECRET = "aloshbe_news_portal_secret_jwt_key_2026_super_secure_edge_compliant";

export function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  return new TextEncoder().encode(secret);
}



export async function createJwtToken(payload, options = {}) {
  const secretKey = getJwtSecretKey();
  const expiresIn = options.expiresIn || "7d";

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);
}



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

