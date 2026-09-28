import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL must be provided"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("Billora"),
  NEXT_PUBLIC_APP_DOMAIN: z.string().optional().default("billora.in"),
  AUTH_SECRET: z.string().default("billora-default-dev-secret-key-2026"),
  APP_URL: z.string().optional().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: z.string().optional().default("http://localhost:3000"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_PHONE_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  PASSWORD_RESET_FROM: z.string().optional(),
  PASSWORD_RESET_LOG: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});


const parsedEnv = EnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Billora",
  NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN || "billora.in",
  AUTH_SECRET: process.env.AUTH_SECRET || "billora-default-dev-secret-key-2026",
  APP_URL: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID,
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  PASSWORD_RESET_FROM: process.env.PASSWORD_RESET_FROM,
  PASSWORD_RESET_LOG: process.env.PASSWORD_RESET_LOG,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});


export const isPostgres = parsedEnv.DATABASE_URL.startsWith("postgres://") || parsedEnv.DATABASE_URL.startsWith("postgresql://");
export const isSqlite = parsedEnv.DATABASE_URL.startsWith("file:") || parsedEnv.DATABASE_URL.endsWith(".db");

export const env = {
  ...parsedEnv,
  isPostgres,
  isSqlite,
};

export default env;
