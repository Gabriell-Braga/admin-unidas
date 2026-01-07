// Minimal drizzle config used by CLI tools. Avoid importing `drizzle-kit` at runtime
export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
};
