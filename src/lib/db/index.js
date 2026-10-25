import mysql from "mysql2/promise";

/**
 * Universal MySQL Data Layer for Next.js App Router, Cloudflare Workers (workerd) & TiDB.
 *
 * Edge & Worker Architecture:
 * 1. Cloudflare Workers (`workerd`) isolate freeze:
 *    - Cloudflare freezes V8 isolates between requests. Persistent connection pools keep idle TCP
 *      sockets and timer handles open, causing workerd to detect a hung request and terminate with
 *      `net::ERR_INCOMPLETE_CHUNKED_ENCODING` (The Workers runtime canceled this request because it hung).
 *    - To prevent this, in worker runtimes each operation acquires a clean connection with a strict
 *      timeout (`connectTimeout: 5000`) and immediately releases (`conn.end()`) in a `finally` block.
 * 2. Node.js runtime (`next dev`):
 *    - Retains high-performance connection pooling via `mysql.createPool()`.
 * 3. Configuration fallback:
 *    - Seamlessly extracts environment variables from Cloudflare context (`cfContext.env`)
 *      and standard `process.env`, defaulting `DB_HOST` to `127.0.0.1` and `DB_PORT` to `3307`.
 * 4. V8 Isolate Safety:
 *    - `disableEval: true` avoids dynamic code evaluation in workerd.
 * 5. Strict Unicode & Timezone:
 *    - `charset: 'utf8mb4'` and `timezone: 'Z'`.
 */

let globalNodePool = null;
let isDbBootstrapped = false;
let bootstrapPromise = null;

export function isWorkerRuntime() {
  return (
    typeof WebSocketPair !== "undefined" ||
    (typeof navigator !== "undefined" && navigator.userAgent?.includes("Cloudflare"))
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
  } catch (_e) {
    // Cloudflare context unavailable in pure Node.js
  }

  const host =
    cfEnv.DB_HOST ||
    cfEnv.MYSQL_HOST ||
    process.env.DB_HOST ||
    process.env.MYSQL_HOST ||
    "127.0.0.1";

  const port = Number(
    cfEnv.DB_PORT ||
    cfEnv.MYSQL_PORT ||
    process.env.DB_PORT ||
    process.env.MYSQL_PORT ||
    3307
  );

  const user =
    cfEnv.DB_USER ||
    cfEnv.MYSQL_USER ||
    process.env.DB_USER ||
    process.env.MYSQL_USER ||
    "root";

  const password =
    cfEnv.DB_PASSWORD !== undefined
      ? cfEnv.DB_PASSWORD
      : cfEnv.MYSQL_PASSWORD !== undefined
      ? cfEnv.MYSQL_PASSWORD
      : process.env.DB_PASSWORD !== undefined
      ? process.env.DB_PASSWORD
      : process.env.MYSQL_PASSWORD !== undefined
      ? process.env.MYSQL_PASSWORD
      : "123456";

  const database =
    cfEnv.DB_NAME ||
    cfEnv.MYSQL_DATABASE ||
    process.env.DB_NAME ||
    process.env.MYSQL_DATABASE ||
    "newsportal_db";

  return {
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
    connectTimeout: 5000,
  };
}

/**
 * Returns a connection handle tailored for the current execution runtime.
 * Automatically handles cleanup: ends socket in Worker, releases to pool in Node.
 */
export async function getConnectionHandle() {
  const config = await getDbConfig();

  if (isWorkerRuntime()) {
    const conn = await mysql.createConnection(config);
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

  // Node.js development runtime
  if (!globalNodePool) {
    globalNodePool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
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

/**
 * Ensures all database tables and seed records are auto-initialized on first use
 */
export async function ensureDbInitialized() {
  if (isDbBootstrapped) return;
  if (bootstrapPromise) return await bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const { bootstrapDatabase } = await import("./bootstrap.js");
      await bootstrapDatabase();
      isDbBootstrapped = true;
    } catch (err) {
      console.warn("[Auto-Init DB Warning]:", err?.message || err);
    } finally {
      bootstrapPromise = null;
    }
  })();

  return await bootstrapPromise;
}

/**
 * Executes a clean parameterized query with guaranteed connection cleanup and auto-initialization
 */
export async function query(sql, params = []) {
  if (
    !isDbBootstrapped &&
    !sql.startsWith("CREATE TABLE") &&
    !sql.startsWith("INSERT IGNORE INTO") &&
    !sql.startsWith("SHOW TABLES")
  ) {
    await ensureDbInitialized();
  }

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

/**
 * Parameterized single-row query runner
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return null;
  }
  return rows[0];
}

/**
 * Robust Transaction Management:
 * Executes callback within an explicit transaction with guaranteed cleanup.
 */
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

/**
 * Universal Database Adapter for Next.js App Router and Cloudflare Worker / OpenNext.
 */
export async function getDb() {
  return {
    query,
    queryOne,
    withTransaction,
    prepare(sql) {
      let boundParams = [];
      return {
        bind(...params) {
          boundParams = params;
          return this;
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
          const res = await stmt.run();
          results.push(res);
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
  ensureDbInitialized,
};
