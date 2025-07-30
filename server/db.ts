import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./shared/schema";

// Point to your SQLite file inside the server folder
const sqlite = new Database("server/hospital.db");

// Export drizzle instance
export const db = drizzle(sqlite, { schema });
