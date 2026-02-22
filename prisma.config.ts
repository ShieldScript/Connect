import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts"
  },
  datasource: {
    // Use Session pooler for migrations (supports prepared statements)
    url: process.env.MIGRATION_URL || process.env.DATABASE_URL!,
  },
});
