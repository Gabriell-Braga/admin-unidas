import { sqliteTable, text, int } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("pending"),
});
