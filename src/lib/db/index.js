import { getCloudflareContext } from "@opennextjs/cloudflare";

let localDbInstance = null;

/**
 * Creates an in-process D1-compatible wrapper around Node's built-in SQLite (DatabaseSync).
 * Used when running locally in Next.js development (next dev).
 * In production or wrangler preview, getCloudflareContext().env.DB is used instead.
 */
async function createLocalD1Adapter() {
  if (localDbInstance) return localDbInstance;

  // Check if we are running in a Node.js host environment
  if (typeof process === "undefined" || !process.versions?.node) {
    throw new Error(
      "Cloudflare D1 database binding 'DB' was not found in environment context. " +
      "Ensure [[d1_databases]] binding = 'DB' is configured in wrangler.toml."
    );
  }

  // Dynamically load node built-ins so Cloudflare Worker bundler does not include them statically
  const { DatabaseSync } = await import("node:sqlite");
  const fs = await import("node:fs");
  const path = await import("node:path");

  const dataDir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "news_portal_d1.sqlite");
  const sqlite = new DatabaseSync(dbPath);

  // Initialize Schema if needed
  initializeLocalSchema(sqlite, fs, path);

  // Wrapper mimicking Cloudflare D1 Database object
  localDbInstance = {
    isLocal: true,
    prepare(sql) {
      return {
        _bound: [],
        bind(...params) {
          const newStmt = localDbInstance.prepare(sql);
          newStmt._bound = params;
          return newStmt;
        },
        async all() {
          const stmt = sqlite.prepare(sql);
          const rows = stmt.all(...this._bound);
          return {
            success: true,
            results: rows ? rows.map((r) => ({ ...r })) : [],
            meta: { duration: 0 },
          };
        },
        async first(colName) {
          const stmt = sqlite.prepare(sql);
          const row = stmt.get(...this._bound);
          if (!row) return null;
          const plain = { ...row };
          if (colName) return plain[colName];
          return plain;
        },
        async run() {
          const stmt = sqlite.prepare(sql);
          const info = stmt.run(...this._bound);
          return {
            success: true,
            meta: {
              changes: info.changes,
              last_row_id: Number(info.lastInsertRowid),
            },
          };
        },
      };
    },
    async batch(statements) {
      sqlite.exec("BEGIN TRANSACTION;");
      const results = [];
      try {
        for (const stmt of statements) {
          const res = await stmt.run();
          results.push(res);
        }
        sqlite.exec("COMMIT;");
        return results;
      } catch (err) {
        sqlite.exec("ROLLBACK;");
        throw err;
      }
    },
    async exec(rawSql) {
      sqlite.exec(rawSql);
      return { count: 0, duration: 0 };
    },
  };

  return localDbInstance;
}

/**
 * Initializes tables and seeds default categories/users if database is newly created.
 */
function initializeLocalSchema(sqlite, fs, path) {
  const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    sqlite.exec(schemaSql);
  }

  // Check if categories are seeded
  const checkCat = sqlite.prepare("SELECT COUNT(*) as count FROM categories").get();
  if (!checkCat || checkCat.count === 0) {
    const seedPath = path.join(process.cwd(), "src", "lib", "db", "seed.sql");
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, "utf-8");
      sqlite.exec(seedSql);
    }
  }
}

/**
 * Returns the Cloudflare D1 binding instance if running on Cloudflare/Wrangler,
 * or the SQLite D1 adapter if running in local Node dev mode.
 *
 * All consumers call:
 *   const db = await getDb();
 *   const { results } = await db.prepare("SELECT ...").bind(...).all();
 */
export async function getDb() {
  try {
    const cfContext = await getCloudflareContext({ async: true });
    if (cfContext?.env?.DB) {
      return cfContext.env.DB;
    }
  } catch (_e) {
    // Cloudflare context is not active; fallback to local SQLite
  }

  return await createLocalD1Adapter();
}
