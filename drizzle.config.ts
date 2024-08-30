import type { Config } from "drizzle-kit";
export default {
  schema: "./schemas.ts",
  out: "./migrations",
} satisfies Config;