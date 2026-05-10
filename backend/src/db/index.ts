import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";

import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then(() => {
    console.log("✅ PostgreSQL Connected");
  })
  .catch((err) => {
    console.error("❌ PostgreSQL Connection Failed");
    console.error(err);
  });

export const db = drizzle(pool);
