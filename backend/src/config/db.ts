import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from './env.js';
import * as schema from '../db/schema.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

// Avoid unhandled pool errors terminating process
pool.on('error', (err) => {
  console.error('Unexpected idle client error on PostgreSQL pool:', err);
});

export const db = drizzle(pool, { schema });

export async function connectDB() {
  let retries = 3;
  while (retries > 0) {
    try {
      const client = await pool.connect();
      console.log('✅ PostgreSQL connected successfully to Neon Database');
      client.release();
      return;
    } catch (error) {
      retries -= 1;
      console.warn(`⚠️ PostgreSQL connection attempt failed (${3 - retries}/3). Retrying...`, error);
      if (retries === 0) {
        console.error('❌ Failed to connect to PostgreSQL database after 3 attempts');
      } else {
        await new Promise((res) => setTimeout(res, 2000));
      }
    }
  }
}
