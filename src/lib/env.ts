import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Billora"),
});

export const env = EnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Billora",
});

export default env;
