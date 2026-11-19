const fs = require("fs");
const path = require("path");

function getSecretKey() {
  if (process.env.ADMIN_SECRET_KEY) {
    return process.env.ADMIN_SECRET_KEY.trim();
  }
  const devVarsPath = path.resolve(process.cwd(), ".dev.vars");
  if (fs.existsSync(devVarsPath)) {
    const lines = fs.readFileSync(devVarsPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (key === "ADMIN_SECRET_KEY") {
          return value;
        }
      }
    }
  }
  return "";
}

async function revalidateProductionCache() {
  const secretKey = getSecretKey();
  if (!secretKey) {
    console.error("[Revalidate] Error: ADMIN_SECRET_KEY was not found in environment or .dev.vars.");
    process.exit(1);
  }

  const baseUrl = (process.env.SITE_URL || "https://aloashbe.com").replace(/\/+$/, "");
  const targetUrl = `${baseUrl}/api/admin/revalidate-all`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "x-secret-key": secretKey,
        "User-Agent": "DeployRevalidationClient/1.0",
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      console.log(`[Revalidate] Cache revalidation succeeded at ${data.invalidatedAt || new Date().toISOString()}`);
      return;
    }

    if (response.status === 429) {
      console.warn(`[Revalidate] Notice: Rate limit active. Retry after ${data.retryAfter || 30} seconds.`);
      return;
    }

    if (response.status === 403) {
      console.error("[Revalidate] Error: 403 Forbidden. The provided secret key was rejected by the server.");
      process.exit(1);
    }

    console.error(`[Revalidate] Failed with status ${response.status}:`, data.error || response.statusText);
    process.exit(1);
  } catch (err) {
    console.error("[Revalidate] Network request failed:", err.message);
    process.exit(1);
  }
}

revalidateProductionCache();
