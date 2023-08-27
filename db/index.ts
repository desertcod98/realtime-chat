import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL
declare global {
  var cachedDb: PostgresJsDatabase<typeof schema>;
}

let db: PostgresJsDatabase<typeof schema>;
schema
if (process.env.NODE_ENV === "production") {
  const client = postgres(connectionString!)
  db = drizzle(client, {schema: schema});
} else {
  if (!global.cachedDb) {
    const client = postgres(connectionString!)
    db = drizzle(client, {schema: schema});
    global.cachedDb = db;
  }
  db = global.cachedDb;
}

export default db;



