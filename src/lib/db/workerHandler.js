import { bootstrapDatabase, verifyR2Storage } from "./bootstrap";

/**
 * Standard Cloudflare Worker Fetch Handler Hook
 *
 * Use this pattern if you are deploying a native Cloudflare Worker (`wrangler deploy`):
 *
 * ```javascript
 * import { bootstrapDatabase } from "@/lib/db/bootstrap";
 *
 * export default {
 *   async fetch(request, env, ctx) {
 *     // 1. Guarded cold-start database check & seeding
 *     // The in-memory `isSeeded` guard ensures this only queries TiDB once per V8 isolate
 *     await bootstrapDatabase(env);
 *
 *     // 2. Forward to your application router or API handlers
 *     return new Response("Worker is running");
 *   },
 * };
 * ```
 */
export async function withDatabaseBootstrap(handler) {
  return async (request, env, ctx) => {
    try {
      await bootstrapDatabase(env);
    } catch (err) {
      console.error("[Worker DB Bootstrap Error]:", err);
    }
    return await handler(request, env, ctx);
  };
}

