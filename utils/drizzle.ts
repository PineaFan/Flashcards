import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from "../db/schema";

const migrationClient = postgres(process.env.DATABASE_URL || '', { max: 1 });
await migrate(drizzle(migrationClient, { schema }), { migrationsFolder: './db/schema' });

const queryClient = postgres(process.env.DATABASE_URL || '');
const DB = drizzle(queryClient, { schema });

export default DB;
