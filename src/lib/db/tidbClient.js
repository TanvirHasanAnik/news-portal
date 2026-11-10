import { connect } from "@tidbcloud/serverless";

let cachedConnection = null;
let cachedConfigKey = null;

async function getCloudflareEnv() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env) {
      return ctx.env;
    }
  } catch (_e) {}
  return {};
}

export async function getTiDbConfig(env = {}) {
  const cfEnv = await getCloudflareEnv();
  const merged = {
    ...(typeof process !== "undefined" && process.env ? process.env : {}),
    ...cfEnv,
    ...env,
  };

  const databaseUrl = merged.DATABASE_URL || merged.TIDB_DATABASE_URL || merged.MYSQL_URL;
  if (databaseUrl) {
    return { url: databaseUrl };
  }

  const host =
    merged.TIDB_HOST ||
    merged.DB_HOST ||
    merged.MYSQL_HOST ||
    "gateway01.us-east-1.prod.aws.tidbcloud.com";

  const port = Number(
    merged.TIDB_PORT ||
    merged.DB_PORT ||
    merged.MYSQL_PORT ||
    4000
  );

  const username =
    merged.TIDB_USER ||
    merged.DB_USER ||
    merged.MYSQL_USER ||
    "root";

  const password =
    merged.TIDB_PASSWORD !== undefined
      ? merged.TIDB_PASSWORD
      : merged.DB_PASSWORD !== undefined
      ? merged.DB_PASSWORD
      : merged.MYSQL_PASSWORD !== undefined
      ? merged.MYSQL_PASSWORD
      : "";

  const database =
    merged.TIDB_DATABASE ||
    merged.DB_NAME ||
    merged.MYSQL_DATABASE ||
    "newsportal_db";

  return {
    host,
    port,
    username,
    password,
    database,
  };
}

export async function getTiDbConnection(env = {}) {
  const config = await getTiDbConfig(env);
  const configKey = config.url || `${config.host}:${config.port}:${config.username}:${config.database}`;

  if (!cachedConnection || cachedConfigKey !== configKey) {
    cachedConnection = connect(config);
    cachedConfigKey = configKey;
  }

  return cachedConnection;
}

export async function executeQuery(sql, params = [], env = {}) {
  const conn = await getTiDbConnection(env);
  return await conn.execute(sql, params);
}

export async function executeQueryOne(sql, params = [], env = {}) {
  const rows = await executeQuery(sql, params, env);
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  return rows[0];
}

export default {
  getTiDbConfig,
  getTiDbConnection,
  executeQuery,
  executeQueryOne,
};
