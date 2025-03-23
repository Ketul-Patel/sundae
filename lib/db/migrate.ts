import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

config({
  path: '.env.local',
});

const runMigrate = async () => {

const { Pool } = pg;

const chatPool = new Pool({
    user: process.env.DAE_DATABASE_USER,
    password: process.env.DAE_DATABASE_PASSWORD,
    host: process.env.DAE_DATABASE_HOST,
    port: parseInt(process.env.DAE_DATABASE_PORT || '5432'),
    database: process.env.DAE_DATABASE_NAME,
    ssl: {
      rejectUnauthorized: false
    }
});
  const db = drizzle(chatPool);

  console.log('⏳ Running migrations...');

  const start = Date.now();
  await migrate(db, { migrationsFolder: './lib/db/migrations' });
  const end = Date.now();

  console.log('✅ Migrations completed in', end - start, 'ms');
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
