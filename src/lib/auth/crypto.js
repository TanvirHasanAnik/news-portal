/**
 * Edge & Cloudflare Workers (workerd) Compliant Cryptographic Utilities
 * Built strictly with Web Crypto API (`crypto.subtle`).
 * Free of native Node.js C++ bindings (`bcrypt`, `crypto` module), ensuring 100%
 * compatibility with serverless runtimes, Edge Middleware, and Cloudflare Workers.
 */

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

const PBKDF2_ITERATIONS = 100000;
const KEY_BYTE_LENGTH = 32; // 256 bits

/**
 * Hashes a plaintext password using PBKDF2 with SHA-256 and a random 16-byte salt
 */
export async function hashPassword(password) {
  if (!password) return "";

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    KEY_BYTE_LENGTH * 8
  );

  return `pbkdf2:${PBKDF2_ITERATIONS}:${bufferToHex(salt)}:${bufferToHex(derivedBits)}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2 hash or legacy plaintext string
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  // 1. Verify PBKDF2 formatted hash
  if (storedHash.startsWith("pbkdf2:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 4) return false;

    const iterations = parseInt(parts[1], 10);
    const saltBuffer = hexToBuffer(parts[2]);
    const expectedHex = parts[3];

    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new Uint8Array(saltBuffer),
        iterations,
        hash: "SHA-256",
      },
      passwordKey,
      KEY_BYTE_LENGTH * 8
    );

    const actualHex = bufferToHex(derivedBits);
    return constantTimeEqual(actualHex, expectedHex);
  }

  // 2. Safe fallback for legacy/initial plain-text seeds
  return constantTimeEqual(password, storedHash);
}

