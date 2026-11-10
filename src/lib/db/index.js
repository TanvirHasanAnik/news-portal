import { connect as connectTiDB } from "@tidbcloud/serverless";
import mysql from "mysql2/promise";

let globalNodePool = null;

// Extract Cloudflare runtime environment variables
async function getCloudflareEnv() {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env) return ctx.env;
  } catch (_e) {}
  return {};
}

export function isWorkerRuntime() {
  return (
    typeof WebSocketPair !== "undefined" ||
    (typeof navigator !== "undefined" && navigator.userAgent?.includes("Cloudflare")) ||
    Boolean(process.env.NEXT_RUNTIME === "edge")
  );
}

export async function getDbConfig() {
  const cfEnv = await getCloudflareEnv();
  const env = {
    ...(typeof process !== "undefined" && process.env ? process.env : {}),
    ...cfEnv,
  };

  const databaseUrl = env.DATABASE_URL || env.TIDB_DATABASE_URL || env.MYSQL_URL;
  if (databaseUrl) {
    const isTiDB = databaseUrl.includes("tidbcloud.com") || env.DB_SSL === "true";
    return { uri: databaseUrl, isTiDB };
  }

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
      : "123456";
  const database = env.DB_NAME || env.TIDB_DATABASE || env.MYSQL_DATABASE || "newsportal_db";

  const isTiDB = host.includes("tidbcloud.com") || env.DB_SSL === "true" || env.TIDB_ENABLE_SSL === "true";

  return { host, port, user, password, database, isTiDB };
}

// Global Unified Query Handler
export async function query(sql, params = []) {
  const config = await getDbConfig();

  // 1. TiDB Cloud Connection via Serverless HTTP (Fetch)
  if (config.isTiDB) {
    const conn = connectTiDB(
      config.uri
        ? { url: config.uri }
        : {
            host: config.host,
            port: config.port,
            username: config.user,
            password: config.password,
            database: config.database,
          }
    );
    const rows = await conn.execute(sql, params);
    return rows;
  }

  // 2. Local MySQL Connection via mysql2 TCP Driver
  const handle = await getConnectionHandle();
  try {
    const [rows] = await handle.query(sql, params);
    return rows;
  } finally {
    if (typeof handle.release === "function") {
      await handle.release();
    }
  }
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  return rows[0];
}

// Local MySQL pool & connection management
export async function getConnectionHandle() {
  const config = await getDbConfig();

  if (isWorkerRuntime()) {
    const conn = await mysql.createConnection(config);
    try {
      await conn.query("SET time_zone = '+00:00'");
    } catch (_e) {}
    return {
      connection: conn,
      query: (sql, params) => conn.query(sql, params),
      release: async () => {
        try {
          await conn.end();
        } catch (_e) {}
      },
    };
  }

  if (!globalNodePool) {
    globalNodePool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    globalNodePool.on("connection", (connection) => {
      connection.query("SET time_zone = '+00:00'");
    });
  }

  const conn = await globalNodePool.getConnection();
  return {
    connection: conn,
    query: (sql, params) => conn.query(sql, params),
    release: () => {
      try {
        conn.release();
      } catch (_e) {}
    },
  };
}

// Dual-Engine Transaction Handler
export async function withTransaction(callback) {
  const config = await getDbConfig();

  // TiDB Cloud HTTP Transaction
  if (config.isTiDB) {
    const conn = connectTiDB(
      config.uri
        ? { url: config.uri }
        : {
            host: config.host,
            port: config.port,
            username: config.user,
            password: config.password,
            database: config.database,
          }
    );
    const tx = await conn.begin();
    try {
      const txWrapper = {
        query: async (sql, params = []) => await tx.execute(sql, params),
        queryOne: async (sql, params = []) => {
          const rows = await tx.execute(sql, params);
          if (!rows || !Array.isArray(rows) || rows.length === 0) return null;
          return rows[0];
        },
        execute: async (sql, params = []) => await tx.execute(sql, params),
      };
      const result = await callback(txWrapper);
      await tx.commit();
      return result;
    } catch (error) {
      try {
        await tx.rollback();
      } catch (_rollbackErr) {}
      throw error;
    }
  }

  // Local MySQL TCP Transaction
  const handle = await getConnectionHandle();
  const conn = handle.connection;

  try {
    await conn.beginTransaction();

    const tx = {
      connection: conn,
      query: async (sql, params = []) => {
        const [rows] = await conn.query(sql, params);
        return rows;
      },
      queryOne: async (sql, params = []) => {
        const [rows] = await conn.query(sql, params);
        if (!rows || !Array.isArray(rows) || rows.length === 0) {
          return null;
        }
        return rows[0];
      },
      execute: async (sql, params = []) => {
        const [result] = await conn.query(sql, params);
        return result;
      },
    };

    const result = await callback(tx);
    await conn.commit();
    return result;
  } catch (error) {
    try {
      await conn.rollback();
    } catch (_rollbackErr) {}
    throw error;
  } finally {
    if (typeof handle.release === "function") {
      await handle.release();
    }
  }
}

// D1-style Wrapper Layer
export async function getDb() {
  return {
    query,
    queryOne,
    withTransaction,
    prepare(sql) {
      let boundParams = [];
      return {
        sql,
        bind(...params) {
          boundParams = params;
          return this;
        },
        getBoundParams() {
          return boundParams;
        },
        async all() {
          const rows = await query(sql, boundParams);
          return {
            success: true,
            results: Array.isArray(rows) ? rows : [],
            meta: { duration: 0 },
          };
        },
        async first(colName) {
          const row = await queryOne(sql, boundParams);
          if (!row) return null;
          if (colName) return row[colName];
          return row;
        },
        async run() {
          const result = await query(sql, boundParams);
          return {
            success: true,
            meta: {
              changes: result?.affectedRows ?? 0,
              last_row_id: Number(result?.insertId ?? 0),
            },
          };
        },
      };
    },
    async batch(statements) {
      return await withTransaction(async (tx) => {
        const results = [];
        for (const stmt of statements) {
          const params = typeof stmt.getBoundParams === "function" ? stmt.getBoundParams() : [];
          const result = await tx.query(stmt.sql, params);
          results.push({
            success: true,
            meta: {
              changes: result?.affectedRows ?? 0,
              last_row_id: Number(result?.insertId ?? 0),
            },
          });
        }
        return results;
      });
    },
    async exec(rawSql) {
      const result = await query(rawSql);
      return { count: result?.affectedRows ?? 0, duration: 0 };
    },
  };
}

export default {
  getDb,
  query,
  queryOne,
  withTransaction,
};