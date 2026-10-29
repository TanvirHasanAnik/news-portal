



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
const KEY_BYTE_LENGTH = 32; 



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



export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;


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


  return constantTimeEqual(password, storedHash);
}

