import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({
  path: '.env.local',
});

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    user: process.env.DAE_DATABASE_USER || "",
    password: process.env.DAE_DATABASE_PASSWORD || "",
    database: process.env.DAE_DATABASE_NAME || "",
    port: parseInt(process.env.DAE_DATABASE_PORT || '5432'),
    host: process.env.DAE_DATABASE_HOST || "",
    ssl: {
      rejectUnauthorized: false,
    }
  },
});
