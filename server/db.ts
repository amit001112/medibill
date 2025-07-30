import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./shared/schema";

// SQLite file is in the same folder as db.ts
const sqlite = new Database("hospital.db");

// Export drizzle instance
export const db = drizzle(sqlite, { schema });
