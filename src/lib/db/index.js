import mysql from "mysql2/promise";

let globalNodePool = null;

export function isWorkerRuntime() {
  return (
    typeof WebSocketPair !== "undefined" ||
    (typeof navigator !== "undefined" && navigator.userAgent?.includes("Cloudflare")) ||
    Boolean(process.env.NEXT_RUNTIME === "edge")
  );
}

export async function getDbConfig() {
  let cfEnv = {};
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env) {
      cfEnv = ctx.env;
    }
  } catch (_e) {}

  const env = {
    ...(typeof process !== "undefined" && process.env ? process.env : {}),
    ...cfEnv,
  };

  const databaseUrl = env.DATABASE_URL || env.TIDB_DATABASE_URL || env.MYSQL_URL;
  if (databaseUrl) {
    return {
      uri: databaseUrl,
      charset: "utf8mb4",
      timezone: "Z",
      dateStrings: true,
      decimalNumbers: true,
      connectTimeout: 10000,
    };
  }

  const host =
    env.DB_HOST ||
    env.TIDB_HOST ||
    env.MYSQL_HOST ||
    "127.0.0.1";

  const port = Number(
    env.DB_PORT ||
    env.TIDB_PORT ||
    env.MYSQL_PORT ||
    3307
  );

  const user =
    env.DB_USER ||
    env.TIDB_USER ||
    env.MYSQL_USER ||
    "root";

  const password =
    env.DB_PASSWORD !== undefined
      ? env.DB_PASSWORD
      : env.TIDB_PASSWORD !== undefined
      ? env.TIDB_PASSWORD
      : env.MYSQL_PASSWORD !== undefined
      ? env.MYSQL_PASSWORD
      : "123456";

  const database =
    env.DB_NAME ||
    env.TIDB_DATABASE ||
    env.MYSQL_DATABASE ||
    "newsportal_db";

  const isTiDbCloud =
    host.includes("tidbcloud.com") ||
    env.DB_SSL === "true" ||
    env.TIDB_ENABLE_SSL === "true";

  const config = {
    host,
    port,
    user,
    password,
    database,
    charset: "utf8mb4",
    timezone: "Z",
    disableEval: true,
    dateStrings: true,
    decimalNumbers: true,
    connectTimeout: 10000,
  };

  if (isTiDbCloud) {
    config.ssl = {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    };
  }

  return config;
}

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

export async function query(sql, params = []) {
  const handle = await getConnectionHandle();
  try {
    const [rows] = await handle.query(sql, params);
    return rows;
  } catch (error) {
    console.error("[Database Query Error]:", error?.message || error);
    throw error;
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

export async function withTransaction(callback) {
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
    console.error("[Database Transaction Error]:", error?.message || error);
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
          const [result] = await tx.connection.query(stmt.sql, params);
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
