import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// For dynamic routes
export const getDb = (locals: any) => {
  const { env } = locals.runtime || {};
  return drizzle(env?.DB, { schema });
};

// For static routes
export const getDbAsync = async (locals: any) => {
  const { env } = locals.runtime || {};
  return drizzle(env?.DB, { schema });
};
