import { connect } from "@tidbcloud/serverless";

/**
 * Universal Serverless TiDB / MySQL Client for Cloudflare Workers (V8 Edge Runtime)
 *
 * Uses the HTTP-based `@tidbcloud/serverless` driver which operates over native fetch
 * requests without persistent TCP sockets or native Node.js C++ bindings.
 */

let cachedConnection = null;
let cachedConfigKey = null;

/**
 * Resolves TiDB connection configuration from Worker `env` or Node `process.env`
 */
export function getTiDbConfig(env = {}) {
  const databaseUrl =
    env.DATABASE_URL ||
    env.TIDB_DATABASE_URL ||
    (typeof process !== "undefined" && (process.env.DATABASE_URL || process.env.TIDB_DATABASE_URL));

  if (databaseUrl) {
    return { url: databaseUrl };
  }

  const host =
    env.TIDB_HOST ||
    env.DB_HOST ||
    (typeof process !== "undefined" && (process.env.TIDB_HOST || process.env.DB_HOST)) ||
    "gateway01.us-east-1.prod.aws.tidbcloud.com";

  const port = Number(
    env.TIDB_PORT ||
    env.DB_PORT ||
    (typeof process !== "undefined" && (process.env.TIDB_PORT || process.env.DB_PORT)) ||
    4000
  );

  const username =
    env.TIDB_USER ||
    env.DB_USER ||
    (typeof process !== "undefined" && (process.env.TIDB_USER || process.env.DB_USER)) ||
    "root";

  const password =
    env.TIDB_PASSWORD !== undefined
      ? env.TIDB_PASSWORD
      : env.DB_PASSWORD !== undefined
      ? env.DB_PASSWORD
      : typeof process !== "undefined" && process.env.TIDB_PASSWORD !== undefined
      ? process.env.TIDB_PASSWORD
      : typeof process !== "undefined" && process.env.DB_PASSWORD !== undefined
      ? process.env.DB_PASSWORD
      : "";

  const database =
    env.TIDB_DATABASE ||
    env.DB_NAME ||
    (typeof process !== "undefined" && (process.env.TIDB_DATABASE || process.env.DB_NAME)) ||
    "newsportal_db";

  return {
    host,
    port,
    username,
    password,
    database,
  };
}

/**
 * Returns an HTTP connection instance optimized for Cloudflare Workers
 */
export function getTiDbConnection(env = {}) {
  const config = getTiDbConfig(env);
  const configKey = config.url || `${config.host}:${config.port}:${config.username}:${config.database}`;

  if (!cachedConnection || cachedConfigKey !== configKey) {
    cachedConnection = connect(config);
    cachedConfigKey = configKey;
  }

  return cachedConnection;
}

/**
 * Executes a parameterized SQL query via TiDB Serverless HTTP API.
 * All parameters are safely escaped by the driver to prevent SQL injection.
 */
export async function executeQuery(sql, params = [], env = {}) {
  const conn = getTiDbConnection(env);
  return await conn.execute(sql, params);
}

/**
 * Executes a parameterized query and returns the first row or null
 */
export async function executeQueryOne(sql, params = [], env = {}) {
  const rows = await executeQuery(sql, params, env);
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  return rows[0];
}

