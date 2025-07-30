import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./shared/schema";

// Point to your SQLite file (hospital.db)
const sqlite = new Database("hospital.db");

// Export drizzle instance
export const db = drizzle(sqlite, { schema });
