import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "../config/index.js";

if (!config.db.url) {
    throw new Error("DATABASE_URL is not set. Add it to .env (see .env.example).");
}

const pool = new Pool({
    connectionString: config.db.url
});

export const db = drizzle({ client: pool });

export type DbTransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];
