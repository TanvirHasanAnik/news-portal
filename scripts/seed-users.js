import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const BCRYPT_SALT_ROUNDS = 12;

function loadDevVars() {
  const env = {};
  const filePath = path.resolve(process.cwd(), ".dev.vars");
  if (!fs.existsSync(filePath)) {
    return env;
  }

  const lines = fs.readFileSync(filePath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    let val = trimmed.substring(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
  return env;
}

function promptText(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function run() {
  const devVars = loadDevVars();
  const env = {
    ...process.env,
    ...devVars,
  };

  const superAdminUsername = (env.SUPER_ADMIN_USERNAME || "superadmin").trim().toLowerCase();
  let superAdminPassword = (env.SUPER_ADMIN_PASSWORD || "").trim();

  const adminUsername = (env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  let adminPassword = (env.ADMIN_PASSWORD || "").trim();

  if (!superAdminPassword) {
    superAdminPassword = await promptText(`Enter password for "${superAdminUsername}" (Super Admin): `);
  }

  if (!superAdminPassword) {
    console.error("Super Admin password cannot be empty.");
    process.exit(1);
  }

  if (!adminPassword) {
    adminPassword = await promptText(`Enter password for "${adminUsername}" (Admin): `);
  }

  if (!adminPassword) {
    console.error("Admin password cannot be empty.");
    process.exit(1);
  }

  const databaseUrl = env.DATABASE_URL || env.TIDB_DATABASE_URL || env.MYSQL_URL;
  let connectionConfig;

  if (databaseUrl) {
    connectionConfig = {
      uri: databaseUrl,
      charset: "utf8mb4",
    };
  } else {
    const host = env.DB_HOST || env.TIDB_HOST || env.MYSQL_HOST || "127.0.0.1";
    const port = Number(env.DB_PORT || env.TIDB_PORT || env.MYSQL_PORT || 3307);
    const user = env.DB_USER || env.TIDB_USER || env.MYSQL_USER || "root";
    const password =
      env.DB_PASSWORD !== undefined
        ? env.DB_PASSWORD
        : env.TIDB_PASSWORD !== undefined
        ? env.TIDB_PASSWORD
        : env.MYSQL_PASSWORD !== undefined
        ? env.MYSQL_PASSWORD
        : "";
    const database = env.DB_NAME || env.TIDB_DATABASE || env.MYSQL_DATABASE || "newsportal_db";

    connectionConfig = {
      host,
      port,
      user,
      password,
      database,
      charset: "utf8mb4",
    };

    if (host.includes("tidbcloud.com") || env.DB_SSL === "true" || env.TIDB_ENABLE_SSL === "true") {
      connectionConfig.ssl = {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      };
    }
  }

  console.log("Hashing passwords securely with bcrypt...");
  const [saHash, admHash] = await Promise.all([
    bcrypt.hash(superAdminPassword, BCRYPT_SALT_ROUNDS),
    bcrypt.hash(adminPassword, BCRYPT_SALT_ROUNDS),
  ]);

  console.log(`Connecting to database (${connectionConfig.host || "via URL"})...`);
  const conn = await mysql.createConnection(connectionConfig);

  try {
    const query = `
      INSERT INTO users (id, username, password, role, status)
      VALUES
        ('usr_superadmin', ?, ?, 'super_admin', 'active'),
        ('usr_admin', ?, ?, 'admin', 'active')
      ON DUPLICATE KEY UPDATE
        password = VALUES(password),
        role = VALUES(role),
        status = VALUES(status)
    `;

    await conn.execute(query, [superAdminUsername, saHash, adminUsername, admHash]);

    console.log("Successfully seeded administrative users:");
    console.log(`- Super Admin: "${superAdminUsername}" (role: super_admin)`);
    console.log(`- Admin:       "${adminUsername}" (role: admin)`);
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error("Failed to seed users:", err?.message || err);
  process.exit(1);
});
